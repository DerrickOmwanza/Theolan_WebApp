/**
 * Migration: Create Products and Booking Tables
 * Purpose: Product catalogue and booking management
 */

export async function up(knex) {
  // Products table
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.enum('category', ['windows', 'doors', 'curtain_walls', 'partitions', 'balustrades']).notNullable();
    table.enum('finish', ['mill', 'silver', 'black', 'champagne', 'bronze']).notNullable();
    table.decimal('base_price_per_sqm', 10, 2).notNullable();
    table.decimal('double_glazing_multiplier', 5, 2).defaultTo(1.35);
    table.string('image_url').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('category');
    table.index('finish');
    table.index('is_active');
    table.index(['category', 'finish']);
  });

  // Product Rates table (for flexible pricing by product type + finish)
  await knex.schema.createTable('product_rates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.enum('finish', ['mill', 'silver', 'black', 'champagne', 'bronze']).notNullable();
    table.decimal('price_per_sqm', 10, 2).notNullable();
    table.integer('min_area_sqm').defaultTo(1);
    table.integer('max_area_sqm').nullable();
    table.decimal('discount_percentage', 5, 2).defaultTo(0);
    table.timestamp('effective_from').defaultTo(knex.fn.now());
    table.timestamp('effective_to').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes and Constraints
    table.unique(['product_id', 'finish']);
    table.index('product_id');
    table.index('is_active');
  });

  // Technicians table
  await knex.schema.createTable('technicians', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('specialization', 100).nullable();
    table.enum('status', ['available', 'on_leave', 'inactive']).defaultTo('available');
    table.integer('max_daily_visits').defaultTo(5);
    table.string('phone_number', 20).notNullable();
    table.string('service_radius_km', 50).defaultTo('50');
    table.json('service_areas').nullable();
    table.timestamp('available_from').nullable();
    table.timestamp('available_to').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('status');
  });

  // Time Slots table (for available booking slots)
  await knex.schema.createTable('time_slots', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('technician_id').references('id').inTable('technicians').onDelete('SET NULL');
    table.date('slot_date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.boolean('is_available').defaultTo(true);
    table.text('reason_unavailable').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('slot_date');
    table.index('is_available');
    table.index(['slot_date', 'is_available']);
    table.index('technician_id');
  });

  // Bookings table
  await knex.schema.createTable('bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('client_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('technician_id').nullable().references('id').inTable('technicians').onDelete('SET NULL');
    table.enum('service_type', ['windows', 'doors', 'curtain_walls', 'partitions', 'balustrades', 'custom']).notNullable();
    table.enum('property_type', ['residential', 'commercial', 'industrial']).notNullable();
    table.string('location', 200).notNullable();
    table.enum('county', ['nairobi', 'kiambu', 'machakos']).notNullable();
    table.text('description').nullable();
    table.timestamp('scheduled_at').notNullable();
    table.enum('status', ['scheduled', 'completed', 'cancelled', 'no_show']).defaultTo('scheduled');
    table.enum('contact_method', ['sms', 'whatsapp', 'email']).defaultTo('sms');
    table.timestamp('completed_at').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('client_id');
    table.index('technician_id');
    table.index('status');
    table.index('scheduled_at');
    table.index('created_at');
    table.index(['status', 'scheduled_at']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.dropTableIfExists('time_slots');
  await knex.schema.dropTableIfExists('technicians');
  await knex.schema.dropTableIfExists('product_rates');
  await knex.schema.dropTableIfExists('products');
}
