import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../../src/core/evaluation.js';

describe('evaluateGuess', () => {
  it('counts all bulls when the guess equals the secret', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
  });

  it('counts all cows when every digit is present but misplaced', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
  });

  it('returns zeros when no digits match', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
  });

  it.each([
    ['1234', '1243', { bulls: 2, cows: 2 }],
    ['1234', '1567', { bulls: 1, cows: 0 }],
    ['1234', '5162', { bulls: 0, cows: 2 }],
    ['1234', '1325', { bulls: 1, cows: 2 }],
    ['8150', '5108', { bulls: 1, cows: 3 }],
  ])('evaluates secret %j against guess %j', (secret, guess, expected) => {
    expect(evaluateGuess(secret, guess)).toEqual(expected);
  });

  it('handles a secret with a leading zero', () => {
    expect(evaluateGuess('0123', '0321')).toEqual({ bulls: 2, cows: 2 });
  });

  it('works for binary secrets', () => {
    expect(evaluateGuess('01', '10')).toEqual({ bulls: 0, cows: 2 });
    expect(evaluateGuess('10', '10')).toEqual({ bulls: 2, cows: 0 });
  });

  it('works for hex secrets with six digits', () => {
    expect(evaluateGuess('a0f3c9', 'a3f0b1')).toEqual({ bulls: 2, cows: 2 });
  });

  it('ignores letter case of hex digits on both sides', () => {
    expect(evaluateGuess('abcd', 'ABDC')).toEqual({ bulls: 2, cows: 2 });
    expect(evaluateGuess('ABCD', 'abcd')).toEqual({ bulls: 4, cows: 0 });
  });

  it('returns a new result object on every call', () => {
    const first = evaluateGuess('1234', '1243');
    const second = evaluateGuess('1234', '1243');

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});
