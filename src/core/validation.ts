import type { Base } from './types.js';

export const isValidGuess = (guess: string, length: number, base: Base): boolean => {
  throw new Error(`isValidGuess(${guess}, ${String(length)}, ${String(base)}) is not implemented`);
};
