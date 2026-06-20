/**
 * Migration: Create orders and order_events tables
 *
 * Code divergence from schema doc:
 * - orders: added reference_number (code generates ORD001, ORD002...)
 * - orders: added deposit_amount (orderService saves this on creation)
 * - orders: status includes 'cancelled' (state machine allows cancellation)
 * - order_events: is_current flag (code uses it to track latest event)
 *
 * The order state machine: quoted → confirmed → fabrication → ready → installed
 * Cancellation allowed from: quoted, confirmed, fabrication, ready
 */

export async function up(knex) {
  // ============================================================
  // ORDERS
  // ============================================================
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('client_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.string('reference_number', 20);
    table.string('product_summary', 500).notNullable();
    table.text('dimensions_notes');
    table.string('status', 50).notNullable().defaultTo('quoted');
    table.decimal('total_price_kes', 12, 2).notNullable();
    table.decimal('paid_amount_kes', 12, 2).defaultTo(0);
    table.string('payment_status', 50).notNullable().defaultTo('unpaid');
    table.decimal('deposit_amount', 12, 2);
    table.timestamp('scheduled_installation_at');
    table.uuid('assigned_technician_id').references('id').inTable('technicians');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check(
      'status IN (\'quoted\', \'confirmed\', \'fabrication\', \'ready\', \'installed\', \'cancelled\')',
      [],
      'orders_status_check'
    );
    table.check(
      'payment_status IN (\'unpaid\', \'deposit_received\', \'paid_in_full\')',
      [],
      'orders_payment_status_check'
    );
    table.check('total_price_kes > 0', [], 'orders_price_positive_check');
    table.check('paid_amount_kes <= total_price_kes', [], 'orders_paid_le_total_check');
  });

  await knex.raw('CREATE INDEX idx_orders_client_id_status ON orders(client_id, status)');
  await knex.raw('CREATE INDEX idx_orders_status ON orders(status)');
  await knex.raw('CREATE INDEX idx_orders_payment_status ON orders(payment_status)');
  await knex.raw('CREATE INDEX idx_orders_assigned_technician ON orders(assigned_technician_id)');
  await knex.raw('CREATE INDEX idx_orders_created_at ON orders(created_at DESC)');
  await knex.raw('CREATE INDEX idx_orders_reference_number ON orders(reference_number)');

  // ============================================================
  // ORDER EVENTS (Timeline)
  // ============================================================
  await knex.schema.createTable('order_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description');
    table.timestamp('occurred_at').notNullable();
    table.boolean('is_current').defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw('CREATE INDEX idx_order_events_order_id_occurred ON order_events(order_id, occurred_at DESC)');
  await knex.raw('CREATE INDEX idx_order_events_is_current ON order_events(is_current)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('order_events');
  await knex.schema.dropTableIfExists('orders');
}
