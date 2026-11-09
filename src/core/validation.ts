import { createDigitValidator, normalizeDigit } from './digits.js';
import type { Base } from './types.js';

const hasUniqueItems = (items: readonly string[]): boolean => new Set(items).size === items.length;

export const isValidGuess = (guess: string, length: number, base: Base): boolean => {
  const digits = Array.from(guess, normalizeDigit);

  return (
    digits.length === length && digits.every(createDigitValidator(base)) && hasUniqueItems(digits)
  );
};
