/**
 * Migration: Create database triggers for auto-computed fields
 *
 * Per docs/03_DATABASE_SCHEMA.md, three triggers are required:
 *
 * 1. trg_order_update_client_status
 *    - Fires AFTER INSERT on orders
 *    - Updates clients.status: lead (0 orders), active (1), repeat (2+)
 *
 * 2. trg_payment_update_ltv
 *    - Fires AFTER UPDATE on payments
 *    - When status changes TO 'success', adds amount to client's lifetime_value_kes
 *
 * 3. trg_order_update_timestamp
 *    - Fires BEFORE UPDATE on orders
 *    - Sets updated_at = CURRENT_TIMESTAMP automatically
 */

export async function up(knex) {
  // ============================================================
  // Trigger 1: Update client status when order is created
  // ============================================================
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_client_status()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE clients
      SET status = CASE
        WHEN (SELECT COUNT(*) FROM orders WHERE client_id = NEW.client_id) = 0 THEN 'lead'
        WHEN (SELECT COUNT(*) FROM orders WHERE client_id = NEW.client_id) = 1 THEN 'active'
        ELSE 'repeat'
      END,
      order_count = (SELECT COUNT(*) FROM orders WHERE client_id = NEW.client_id),
      updated_at = CURRENT_TIMESTAMP
      WHERE user_id = NEW.client_id;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await knex.raw(`
    CREATE TRIGGER trg_order_update_client_status
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION update_client_status()
  `);

  // ============================================================
  // Trigger 2: Update client lifetime value on payment success
  // ============================================================
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_client_ltv()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status != 'success') THEN
        UPDATE clients
        SET lifetime_value_kes = lifetime_value_kes + NEW.amount_kes,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = (SELECT client_id FROM orders WHERE id = NEW.order_id);
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await knex.raw(`
    CREATE TRIGGER trg_payment_update_ltv
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_client_ltv()
  `);

  // ============================================================
  // Trigger 3: Auto-update orders.updated_at on any change
  // ============================================================
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_order_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await knex.raw(`
    CREATE TRIGGER trg_order_update_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_order_timestamp()
  `);
}

export async function down(knex) {
  await knex.raw('DROP TRIGGER IF EXISTS trg_order_update_client_status ON orders');
  await knex.raw('DROP TRIGGER IF EXISTS trg_payment_update_ltv ON payments');
  await knex.raw('DROP TRIGGER IF EXISTS trg_order_update_timestamp ON orders');
  await knex.raw('DROP FUNCTION IF EXISTS update_client_status() CASCADE');
  await knex.raw('DROP FUNCTION IF EXISTS update_client_ltv() CASCADE');
  await knex.raw('DROP FUNCTION IF EXISTS update_order_timestamp() CASCADE');
}
