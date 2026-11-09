import type { Base, DigitValidator } from './types.js';

export const DIGIT_ALPHABET = '0123456789abcdef';

export const normalizeDigit = (char: string): string => char.toLowerCase();

export const getDigits = (base: Base): readonly string[] =>
  Array.from(DIGIT_ALPHABET.slice(0, base));

export const createDigitValidator = (base: Base): DigitValidator => {
  const allowedDigits: ReadonlySet<string> = new Set(getDigits(base));

  return (char) => allowedDigits.has(normalizeDigit(char));
};
