import { getDigits } from './digits.js';
import type { Base, RandomSource } from './types.js';

const pickIndex = (size: number, random: RandomSource): number =>
  Math.min(Math.floor(random() * size), size - 1);

const removeAt = <T>(items: readonly T[], index: number): readonly T[] => [
  ...items.slice(0, index),
  ...items.slice(index + 1),
];

const drawDigits = (
  pool: readonly string[],
  count: number,
  random: RandomSource,
): readonly string[] => {
  if (count === 0) {
    return [];
  }
  const index = pickIndex(pool.length, random);
  const digit = pool[index] ?? '';

  return [digit, ...drawDigits(removeAt(pool, index), count - 1, random)];
};

export const generateSecret = (
  length: number,
  base: Base,
  random: RandomSource = Math.random,
): string => {
  if (!Number.isInteger(length) || length < 1 || length > base) {
    throw new RangeError(
      `Secret length must be an integer from 1 to ${String(base)}, got ${String(length)}`,
    );
  }

  return drawDigits(getDigits(base), length, random).join('');
};
