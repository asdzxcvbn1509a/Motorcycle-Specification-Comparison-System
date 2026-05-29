import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatNumber } from './utils';

describe('cn (className merger)', () => {
  it('merges class strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('dedupes conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('formatPrice', () => {
  it('formats THB currency with no decimals', () => {
    expect(formatPrice(320000)).toMatch(/320,000/);
    expect(formatPrice(320000)).toMatch(/฿|THB|บาท/);
  });

  it('handles string input (from Prisma Decimal)', () => {
    expect(formatPrice('189000')).toMatch(/189,000/);
  });

  it('returns "-" for invalid input', () => {
    expect(formatPrice('not a number')).toBe('-');
    expect(formatPrice(NaN)).toBe('-');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toMatch(/0/);
  });
});

describe('formatNumber', () => {
  it('formats integers with thousand separator', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('appends suffix when given', () => {
    expect(formatNumber(650, 'cc')).toBe('650 cc');
    expect(formatNumber(94, 'HP')).toBe('94 HP');
  });

  it('returns "-" for null/undefined/empty', () => {
    expect(formatNumber(null)).toBe('-');
    expect(formatNumber(undefined)).toBe('-');
    expect(formatNumber('')).toBe('-');
  });

  it('handles zero as a valid value', () => {
    expect(formatNumber(0, 'cc')).toBe('0 cc');
  });

  it('handles string numbers (from Prisma Decimal)', () => {
    expect(formatNumber('94', 'HP')).toBe('94 HP');
  });

  it('returns "-" for NaN strings', () => {
    expect(formatNumber('not a number')).toBe('-');
  });
});
