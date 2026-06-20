/**
 * Migration: Create technicians table
 *
 * Technicians are the field team who perform site visits and installations.
 * Referenced by bookings and orders as assigned_technician_id.
 * Seed data creates 3 technicians (Kevin, Brian, James).
 */

export async function up(knex) {
  await knex.schema.createTable('technicians', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('phone', 20).notNullable().unique();
    table.string('email', 255);
    table.string('color_code', 7).notNullable().defaultTo('#0055CC');
    table.string('status', 50).notNullable().defaultTo('active');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check('status IN (\'active\', \'inactive\')', [], 'technicians_status_check');
    table.check('phone ~ \'^\\+254[0-9]{9}$\'', [], 'technicians_phone_format_check');
    table.check('color_code ~ \'^#[0-9A-Fa-f]{6}$\'', [], 'technicians_color_format_check');
  });

  await knex.raw('CREATE INDEX idx_technicians_status ON technicians(status)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('technicians');
}
