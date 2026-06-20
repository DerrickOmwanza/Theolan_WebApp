/**
 * Migration: Create clients and client_notes tables (CRM)
 *
 * The clients table is a 1:1 extension of users for CRM tracking.
 * Status is auto-computed by database trigger (lead/active/repeat).
 * lifetime_value_kes is auto-updated by trigger on payment success.
 */

export async function up(knex) {
  // ============================================================
  // CLIENTS
  // ============================================================
  await knex.schema.createTable('clients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.string('status', 50).notNullable().defaultTo('lead');
    table.decimal('lifetime_value_kes', 12, 2).defaultTo(0);
    table.timestamp('last_contact_at');
    table.integer('order_count').defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check('status IN (\'lead\', \'active\', \'repeat\')', [], 'clients_status_check');
  });

  await knex.raw('CREATE INDEX idx_clients_status ON clients(status)');
  await knex.raw('CREATE INDEX idx_clients_last_contact_at ON clients(last_contact_at DESC)');
  await knex.raw('CREATE INDEX idx_clients_lifetime_value_kes ON clients(lifetime_value_kes DESC)');

  // ============================================================
  // CLIENT NOTES
  // ============================================================
  await knex.schema.createTable('client_notes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('client_id').notNullable().references('id').inTable('clients').onDelete('CASCADE');
    table.text('note_text').notNullable();
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw('CREATE INDEX idx_client_notes_client_id ON client_notes(client_id, created_at DESC)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('client_notes');
  await knex.schema.dropTableIfExists('clients');
}
