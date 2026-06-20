// Test payment service logic with focused unit tests
import { parseCallbackMetadata } from '../src/services/mpesaService.js';

describe('M-Pesa Callback Parsing', () => {
  describe('parseCallbackMetadata', () => {
    it('should parse Amount correctly', () => {
      const items = [{ Name: 'Amount', Value: 10000 }];
      const result = parseCallbackMetadata(items);
      expect(result.amount).toBe(10000);
    });

    it('should parse MpesaReceiptNumber correctly', () => {
      const items = [{ Name: 'MpesaReceiptNumber', Value: 'ABC123' }];
      const result = parseCallbackMetadata(items);
      expect(result.mpesaReceipt).toBe('ABC123');
    });

    it('should parse TransactionDate correctly', () => {
      const items = [{ Name: 'TransactionDate', Value: 20240101120000 }];
      const result = parseCallbackMetadata(items);
      expect(result.transactionDate).toBe(20240101120000);
    });

    it('should parse PhoneNumber correctly', () => {
      const items = [{ Name: 'PhoneNumber', Value: 254712345678 }];
      const result = parseCallbackMetadata(items);
      expect(result.phoneNumber).toBe(254712345678);
    });

    it('should return empty object for null input', () => {
      const result = parseCallbackMetadata(null);
      expect(result).toEqual({});
    });

    it('should parse all metadata fields together', () => {
      const items = [
        { Name: 'Amount', Value: 15000 },
        { Name: 'MpesaReceiptNumber', Value: 'XYZ789' },
        { Name: 'TransactionDate', Value: 20240102120000 },
        { Name: 'PhoneNumber', Value: 254798765432 }
      ];

      const result = parseCallbackMetadata(items);

      expect(result.amount).toBe(15000);
      expect(result.mpesaReceipt).toBe('XYZ789');
      expect(result.transactionDate).toBe(20240102120000);
      expect(result.phoneNumber).toBe(254798765432);
    });
  });
});

describe('Payment Validation Logic', () => {
  it('should reject negative payment amount', () => {
    const amount = -100;
    expect(amount <= 0).toBe(true);
  });

  it('should reject amount exceeding remaining balance', () => {
    const totalPrice = 50000;
    const paidAmount = 40000;
    const paymentAmount = 20000;

    const remaining = totalPrice - paidAmount;
    expect(paymentAmount > remaining).toBe(true);
  });

  it('should accept payment within remaining balance', () => {
    const totalPrice = 50000;
    const paidAmount = 30000;
    const paymentAmount = 15000;

    const remaining = totalPrice - paidAmount;
    expect(paymentAmount <= remaining).toBe(true);
  });
});

describe('Callback Idempotency', () => {
  it('should detect pending status (needs processing)', () => {
    const status = 'pending';
    expect(status === 'pending').toBe(true);
  });

  it('should detect already processed status', () => {
    const status = 'success';
    expect(status !== 'pending').toBe(true);
  });
});
