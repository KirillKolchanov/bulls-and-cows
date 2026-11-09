import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../../src/core/digits.js';
import type { Base } from '../../src/core/types.js';

const toChars = (value: string): string[] => Array.from(value);

describe('createDigitValidator', () => {
  it('returns a predicate function for a given base', () => {
    expect(typeof createDigitValidator(10)).toBe('function');
  });

  it.each<[Base, string]>([
    [2, '01'],
    [8, '01234567'],
    [10, '0123456789'],
    [16, '0123456789abcdef'],
  ])('accepts every digit of base %i', (base, digits) => {
    const isDigit = createDigitValidator(base);

    expect(toChars(digits).every(isDigit)).toBe(true);
  });

  it.each<[Base, string]>([
    [2, '23456789a'],
    [8, '89abcdef'],
    [10, 'abcdefABCDEF'],
    [16, 'gGzZ'],
  ])('rejects characters outside of base %i', (base, chars) => {
    const isDigit = createDigitValidator(base);

    expect(toChars(chars).some(isDigit)).toBe(false);
  });

  it('accepts uppercase hex digits the same as lowercase ones', () => {
    const isHexDigit = createDigitValidator(16);

    expect(toChars('ABCDEF').every(isHexDigit)).toBe(true);
  });

  it.each(['', ' ', '-', '.', '+', '01', 'ab', '١'])(
    'rejects non-digit or multi-character input %j',
    (input) => {
      expect(createDigitValidator(16)(input)).toBe(false);
    },
  );

  it('creates independent validators for different bases', () => {
    const isBinaryDigit = createDigitValidator(2);
    const isDecimalDigit = createDigitValidator(10);

    expect(isBinaryDigit('5')).toBe(false);
    expect(isDecimalDigit('5')).toBe(true);
    expect(isBinaryDigit('5')).toBe(false);
  });
});
