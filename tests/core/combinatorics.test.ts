import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from '../../src/core/combinatorics.js';

describe('countPossibleSecrets', () => {
  it.each([
    [2, 2, 2],
    [2, 8, 56],
    [3, 8, 336],
    [6, 8, 20_160],
    [2, 10, 90],
    [4, 10, 5_040],
    [6, 10, 151_200],
    [2, 16, 240],
    [4, 16, 43_680],
    [6, 16, 5_765_760],
  ])('counts P(base, length) for length %i and base %i as %i', (length, base, expected) => {
    expect(countPossibleSecrets(length, base)).toBe(expected);
  });

  it('counts secrets with a leading zero as distinct secrets', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('returns 1 for an empty secret', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns base for a single-digit secret', () => {
    expect(countPossibleSecrets(1, 16)).toBe(16);
  });

  it('returns 0 when length exceeds the number of available digits', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
    expect(countPossibleSecrets(17, 16)).toBe(0);
  });

  it('follows the recurrence count(length, base) = base * count(length - 1, base - 1)', () => {
    expect(countPossibleSecrets(5, 10)).toBe(10 * countPossibleSecrets(4, 9));
  });

  it('returns the same value on repeated calls', () => {
    const first = countPossibleSecrets(6, 16);

    expect(countPossibleSecrets(6, 16)).toBe(first);
  });

  it.each([
    [-1, 10],
    [2.5, 10],
    [2, -1],
    [2, 1.5],
  ])('throws a RangeError for length %d and base %d', (length, base) => {
    expect(() => countPossibleSecrets(length, base)).toThrow(RangeError);
  });
});
