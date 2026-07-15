/**
 * Migration: Create contact_messages table
 *
 * Used by POST /api/v1/contact endpoint to store user inquiries.
 * Messages are stored in the database and an email notification is sent to the business.
 */

export async function up(knex) {
  await knex.schema.createTable('contact_messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20);
    table.string('subject', 255).notNullable();
    table.text('message').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes for common queries
    table.raw('CREATE INDEX idx_contact_messages_email ON contact_messages(email)');
    table.raw('CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC)');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('contact_messages');
}