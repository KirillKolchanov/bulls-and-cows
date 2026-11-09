import type { Base, RandomSource } from './types.js';

export const generateSecret = (
  length: number,
  base: Base,
  random: RandomSource = Math.random,
): string => {
  throw new Error(
    `generateSecret(${String(length)}, ${String(base)}, ${typeof random}) is not implemented`,
  );
};
