import { normalizeDigit } from './digits.js';
import type { GuessResult } from './types.js';

const toNormalizedDigits = (value: string): readonly string[] => Array.from(value, normalizeDigit);

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  const secretDigits = toNormalizedDigits(secret);
  const secretDigitSet: ReadonlySet<string> = new Set(secretDigits);

  return toNormalizedDigits(guess).reduce<GuessResult>(
    (result, digit, index) => {
      if (secretDigits[index] === digit) {
        return { ...result, bulls: result.bulls + 1 };
      }
      if (secretDigitSet.has(digit)) {
        return { ...result, cows: result.cows + 1 };
      }
      return result;
    },
    { bulls: 0, cows: 0 },
  );
};
