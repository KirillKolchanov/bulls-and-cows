import { describe, expect, it } from 'vitest';
import { isValidGuess } from '../../src/core/validation.js';
import type { Base } from '../../src/core/types.js';

describe('isValidGuess', () => {
  it.each<[string, number, Base]>([
    ['01', 2, 2],
    ['10', 2, 2],
    ['0123', 4, 8],
    ['7654', 4, 8],
    ['0123', 4, 10],
    ['987654', 6, 10],
    ['12', 2, 10],
    ['0a1b', 4, 16],
    ['fedcba', 6, 16],
  ])('accepts %j for length %i and base %i', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(true);
  });

  it.each<[string, number, Base]>([
    ['012', 4, 10],
    ['01234', 4, 10],
    ['', 2, 10],
    ['0', 2, 2],
  ])('rejects %j when its length differs from %i', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(false);
  });

  it.each<[string, number, Base]>([
    ['02', 2, 2],
    ['0128', 4, 8],
    ['012a', 4, 10],
    ['012g', 4, 16],
    ['12 4', 4, 10],
    ['-123', 4, 10],
  ])('rejects %j with characters outside of base %i', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(false);
  });

  it.each<[string, number, Base]>([
    ['00', 2, 2],
    ['1123', 4, 10],
    ['1231', 4, 10],
    ['abca', 4, 16],
  ])('rejects %j with repeated digits', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(false);
  });

  it('accepts uppercase hex digits', () => {
    expect(isValidGuess('A1F0', 4, 16)).toBe(true);
  });

  it('treats the same hex digit in different case as a repeat', () => {
    expect(isValidGuess('aA12', 4, 16)).toBe(false);
  });
});
