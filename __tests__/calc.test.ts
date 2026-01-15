import { describe, it, expect } from 'vitest';
import { calculateAR, formatAR, determineStatus } from '../lib/calc';

describe('calc.ts', () => {
  describe('calculateAR', () => {
    it('calculates AR correctly for normal case', () => {
      const ar = calculateAR(918, 2794);
      expect(ar).toBeCloseTo(24.73, 2);
    });

    it('returns 0 when total is 0', () => {
      const ar = calculateAR(0, 0);
      expect(ar).toBe(0);
    });

    it('calculates 100% AR when no declines', () => {
      const ar = calculateAR(100, 0);
      expect(ar).toBe(100);
    });

    it('calculates 0% AR when no sales', () => {
      const ar = calculateAR(0, 100);
      expect(ar).toBe(0);
    });
  });

  describe('formatAR', () => {
    it('formats AR to 2 decimal places', () => {
      expect(formatAR(24.734)).toBe('24.73');
      expect(formatAR(40.95238095238095)).toBe('40.95');
      expect(formatAR(100)).toBe('100.00');
      expect(formatAR(0)).toBe('0.00');
    });
  });

  describe('determineStatus', () => {
    it('returns PERFORMING when AR >= threshold', () => {
      expect(determineStatus(40, 38)).toBe('PERFORMING');
      expect(determineStatus(38, 38)).toBe('PERFORMING');
    });

    it('returns LOW when AR < threshold', () => {
      expect(determineStatus(35, 38)).toBe('LOW');
      expect(determineStatus(0, 38)).toBe('LOW');
    });
  });
});
