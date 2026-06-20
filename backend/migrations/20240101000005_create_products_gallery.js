/**
 * Migration: Create products, product_rates, and gallery_photos tables
 *
 * Code divergence from schema doc:
 * - gallery_photos: added description column (productModel searches it with ILIKE)
 *
 * Products are the catalogue (18 seeded items).
 * Product rates hold pricing with finish/glazing multipliers.
 * Gallery photos are project images (Cloudinary-hosted).
 */

export async function up(knex) {
  // ============================================================
  // PRODUCTS
  // ============================================================
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('category', 100).notNullable();
    table.string('finish', 100).notNullable();
    table.text('description');
    table.decimal('base_price_per_sqm_kes', 10, 2).notNullable();
    table.string('image_url', 500);
    table.boolean('published').defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check(
      'category IN (\'windows\', \'doors\', \'curtain_walls\', \'partitions\', \'balustrades\')',
      [],
      'products_category_check'
    );
    table.check(
      'finish IN (\'mill\', \'silver\', \'black\', \'champagne\', \'bronze\')',
      [],
      'products_finish_check'
    );
    table.check('base_price_per_sqm_kes > 0', [], 'products_price_positive_check');
  });

  await knex.raw('CREATE INDEX idx_products_category_finish ON products(category, finish)');
  await knex.raw('CREATE INDEX idx_products_published ON products(published)');

  // ============================================================
  // PRODUCT RATES
  // ============================================================
  await knex.schema.createTable('product_rates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.decimal('base_rate_per_sqm_kes', 10, 2).notNullable();
    table.decimal('double_glazing_multiplier', 4, 2).defaultTo(1.35);
    table.decimal('finish_multiplier', 4, 2).defaultTo(1.0);
    table.text('notes');
    table.date('effective_from').defaultTo(knex.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check('base_rate_per_sqm_kes > 0', [], 'product_rates_rate_positive_check');
    table.check('double_glazing_multiplier > 0', [], 'product_rates_dg_positive_check');
    table.check('finish_multiplier > 0', [], 'product_rates_finish_positive_check');
  });

  await knex.raw('CREATE INDEX idx_product_rates_product_id ON product_rates(product_id, effective_from DESC)');

  // ============================================================
  // GALLERY PHOTOS
  // ============================================================
  await knex.schema.createTable('gallery_photos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('category', 100).notNullable();
    table.string('finish', 100);
    table.string('project_name', 255);
    table.string('location', 255);
    table.text('description');
    table.string('image_url', 500).notNullable();
    table.boolean('published').defaultTo(false);
    table.uuid('uploaded_by').notNullable().references('id').inTable('users');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.check(
      'category IN (\'windows\', \'doors\', \'curtain_walls\', \'partitions\', \'balustrades\')',
      [],
      'gallery_photos_category_check'
    );
    table.check(
      'finish IN (\'mill\', \'silver\', \'black\', \'champagne\', \'bronze\')',
      [],
      'gallery_photos_finish_check'
    );
  });

  await knex.raw('CREATE INDEX idx_gallery_photos_category_published ON gallery_photos(category, published)');
  await knex.raw('CREATE INDEX idx_gallery_photos_published ON gallery_photos(published)');
  await knex.raw('CREATE INDEX idx_gallery_photos_uploaded_by ON gallery_photos(uploaded_by)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('gallery_photos');
  await knex.schema.dropTableIfExists('product_rates');
  await knex.schema.dropTableIfExists('products');
}
