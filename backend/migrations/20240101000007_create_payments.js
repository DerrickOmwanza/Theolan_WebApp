/**
 * Migration: Create payments table
 *
 * Code divergence from schema doc (SIGNIFICANT):
 * - Replaced mpesa_receipt with transaction_id (code stores M-Pesa receipt here)
 * - Added mpesa_checkout_request_id (for STK Push callback matching)
 * - Added mpesa_result_code and mpesa_result_description (from callback)
 * - Added payment_type (full/deposit/final — paymentService determines this)
 * - Added paid_at timestamp (set on successful callback)
 * - Added mpesa_phone (stored from STK initiation)
 *
 * These columns are all used by paymentService.js and mpesaService.js.
 * The schema doc's mpesa_receipt column is replaced by transaction_id in the code.
 */

export async function up(knex) {
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL');
    table.uuid('booking_id').references('id').inTable('bookings').onDelete('SET NULL');
    table.decimal('amount_kes', 12, 2).notNullable();
    table.string('method', 50).notNullable();
    table.string('transaction_id', 50);
    table.string('mpesa_phone', 20);
    table.string('mpesa_checkout_request_id', 100);
    table.string('mpesa_result_code', 20);
    table.text('mpesa_result_description');
    table.string('payment_type', 20);
    table.string('status', 50).notNullable().defaultTo('pending');
    table.timestamp('paid_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.check('amount_kes > 0', [], 'payments_amount_positive_check');
    table.check(
      'method IN (\'mpesa\', \'bank_transfer\', \'cash\')',
      [],
      'payments_method_check'
    );
    table.check(
      'status IN (\'pending\', \'success\', \'failed\')',
      [],
      'payments_status_check'
    );
    table.check(
      '(order_id IS NOT NULL) OR (booking_id IS NOT NULL)',
      [],
      'payments_order_or_booking_check'
    );
  });

  await knex.raw('CREATE INDEX idx_payments_order_id_status ON payments(order_id, status)');
  await knex.raw('CREATE INDEX idx_payments_booking_id_status ON payments(booking_id, status)');
  await knex.raw('CREATE INDEX idx_payments_created_at ON payments(created_at DESC)');
  await knex.raw('CREATE INDEX idx_payments_mpesa_checkout ON payments(mpesa_checkout_request_id)');
  await knex.raw('CREATE INDEX idx_payments_transaction_id ON payments(transaction_id) WHERE transaction_id IS NOT NULL');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('payments');
}
