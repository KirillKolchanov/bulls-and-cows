import type { GuessResult } from './types.js';

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  throw new Error(`evaluateGuess(${secret}, ${guess}) is not implemented`);
};
