/**
 * Migration: Add product_id to orders table
 *
 * This migration adds a product_id foreign key column to the orders table
 * to link orders to their source products.
 *
 * Status: Already applied to production database (per task context)
 */

export async function up(knex) {
  // Check if column already exists
  const hasColumn = await knex.schema.hasColumn('orders', 'product_id');
  if (hasColumn) {
    console.log('product_id column already exists on orders table - migration is idempotent');
    return;
  }

  // Add product_id column
  await knex.schema.alterTable('orders', (table) => {
    table.uuid('product_id').references('id').inTable('products').onDelete('SET NULL');
  });

  // Create index for faster joins
  await knex.raw('CREATE INDEX idx_orders_product_id ON orders(product_id)');
}

export async function down(knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('product_id');
  });
}