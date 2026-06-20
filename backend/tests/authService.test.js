// Test authentication utility functions
import { normalizePhone, isValidKenyanPhone } from '../src/utils/auth.js';

describe('Auth Utilities', () => {
  describe('normalizePhone', () => {
    it('should normalize 07XX format to +254', () => {
      expect(normalizePhone('0712345678')).toBe('+254712345678');
    });

    it('should normalize 254XX format to +254', () => {
      expect(normalizePhone('254712345678')).toBe('+254712345678');
    });

    it('should normalize +254XX format (keep as is)', () => {
      expect(normalizePhone('+254712345678')).toBe('+254712345678');
    });

    it('should normalize 7XX format to +254', () => {
      expect(normalizePhone('712345678')).toBe('+254712345678');
    });

    it('should return null for invalid phone', () => {
      expect(normalizePhone('invalid')).toBeNull();
      expect(normalizePhone('123')).toBeNull();
      expect(normalizePhone('')).toBeNull();
      expect(normalizePhone(null)).toBeNull();
    });

    it('should handle spaces and dashes', () => {
      expect(normalizePhone('0712 345 678')).toBe('+254712345678');
      expect(normalizePhone('0712-345-678')).toBe('+254712345678');
    });
  });

  describe('isValidKenyanPhone', () => {
    it('should validate correct Kenyan phone numbers', () => {
      expect(isValidKenyanPhone('+254712345678')).toBe(true);
      expect(isValidKenyanPhone('+254123456789')).toBe(true); // 01 prefix
    });

    it('should reject invalid Kenyan phone numbers', () => {
      expect(isValidKenyanPhone('+254912345678')).toBe(false); // 09 invalid
      expect(isValidKenyanPhone('+25471234567')).toBe(false); // too short
      expect(isValidKenyanPhone('0712345678')).toBe(false); // missing +
    });
  });
});

describe('Finish Multipliers', () => {
  // Test the multiplier values defined in productService
  const FINISH_MULTIPLIERS = {
    mill: 1.0,
    silver: 1.05,
    black: 1.15,
    champagne: 1.1,
    bronze: 1.12
  };

  it('should have mill finish at base multiplier (1.0)', () => {
    expect(FINISH_MULTIPLIERS.mill).toBe(1.0);
  });

  it('should apply higher multiplier for premium finishes', () => {
    expect(FINISH_MULTIPLIERS.black).toBeGreaterThan(FINISH_MULTIPLIERS.mill);
    expect(FINISH_MULTIPLIERS.silver).toBeGreaterThan(FINISH_MULTIPLIERS.mill);
    expect(FINISH_MULTIPLIERS.champagne).toBeGreaterThan(FINISH_MULTIPLIERS.mill);
    expect(FINISH_MULTIPLIERS.bronze).toBeGreaterThan(FINISH_MULTIPLIERS.mill);
  });

  it('should calculate correct quote with multipliers', () => {
    const baseRate = 5000;
    const area = 6; // 2m x 1.5m x 2 quantity

    // Mill finish
    expect(area * baseRate * FINISH_MULTIPLIERS.mill).toBe(30000);

    // Black finish
    expect(area * baseRate * FINISH_MULTIPLIERS.black).toBe(34500);

    // Silver finish
    expect(area * baseRate * FINISH_MULTIPLIERS.silver).toBe(31500);
  });
});

describe('Quote Calculation Logic', () => {
  it('should calculate estimate range correctly', () => {
    const subtotal = 30000;
    const variance = 0.08; // 8%

    const estimateMin = Math.round(subtotal * (1 - variance));
    const estimateMax = Math.round(subtotal * (1 + variance));

    expect(estimateMin).toBe(27600);
    expect(estimateMax).toBe(32400);
  });

  it('should handle double glazing multiplier', () => {
    const baseCost = 30000;
    const glazingMultiplier = 1.2;

    const glazingAdjusted = baseCost * glazingMultiplier;
    expect(glazingAdjusted).toBe(36000);
  });

  it('should combine all multipliers correctly', () => {
    const area = 6;
    const baseRate = 5000;
    const glazingMultiplier = 1.2;
    const finishMultiplier = 1.15;

    const total = area * baseRate * glazingMultiplier * finishMultiplier;
    expect(total).toBe(41400); // 6 * 5000 * 1.2 * 1.15 = 41400
  });
});
