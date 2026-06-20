/**
 * Migration: Create time_slots and bookings tables
 *
 * Code divergence from schema doc:
 * - bookings: added reference_number (code generates BKG001, BKG002...)
 *
 * Time slots are pre-seeded for 12 weeks of availability.
 * Bookings reference both users (client) and technicians (assigned).
 */

export async function up(knex) {
  // ============================================================
  // TIME SLOTS
  // ============================================================
  await knex.schema.createTable('time_slots', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.date('date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.boolean('available').defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check('start_time < end_time', [], 'time_slots_time_order_check');
  });

  await knex.raw('CREATE INDEX idx_time_slots_date_available ON time_slots(date, available)');
  await knex.raw('CREATE UNIQUE INDEX idx_time_slots_unique_slot ON time_slots(date, start_time, end_time)');
  await knex.raw('CREATE INDEX idx_time_slots_date ON time_slots(date)');

  // ============================================================
  // BOOKINGS
  // ============================================================
  await knex.schema.createTable('bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('client_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('service_type', 100).notNullable();
    table.string('property_type', 100);
    table.string('location', 255).notNullable();
    table.text('notes');
    table.timestamp('scheduled_at').notNullable();
    table.string('contact_method', 50);
    table.uuid('assigned_technician_id').references('id').inTable('technicians');
    table.string('status', 50).notNullable().defaultTo('scheduled');
    table.string('reference_number', 20);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check(
      'service_type IN (\'windows\', \'doors\', \'curtain_wall\', \'partitions\', \'balustrades\', \'glazing\')',
      [],
      'bookings_service_type_check'
    );
    table.check(
      'property_type IN (\'residential\', \'commercial\')',
      [],
      'bookings_property_type_check'
    );
    table.check(
      'contact_method IN (\'sms\', \'whatsapp\', \'email\')',
      [],
      'bookings_contact_method_check'
    );
    table.check(
      'status IN (\'scheduled\', \'completed\', \'cancelled\', \'no_show\')',
      [],
      'bookings_status_check'
    );
  });

  await knex.raw('CREATE INDEX idx_bookings_client_id_scheduled ON bookings(client_id, scheduled_at DESC)');
  await knex.raw('CREATE INDEX idx_bookings_status_scheduled ON bookings(status, scheduled_at DESC)');
  await knex.raw('CREATE INDEX idx_bookings_assigned_technician ON bookings(assigned_technician_id, scheduled_at)');
  await knex.raw('CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at DESC)');
  await knex.raw('CREATE INDEX idx_bookings_reference_number ON bookings(reference_number)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.dropTableIfExists('time_slots');
}
