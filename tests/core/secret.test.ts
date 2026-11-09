import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateSecret } from '../../src/core/secret.js';
import type { Base, RandomSource } from '../../src/core/types.js';

const createSequenceRandom = (values: readonly number[]): RandomSource => {
  let callIndex = 0;

  return () => {
    const value = values[callIndex % values.length] ?? 0;
    callIndex += 1;
    return value;
  };
};

const ALPHABET = '0123456789abcdef';

const isSecretValid = (secret: string, length: number, base: Base): boolean => {
  const digits = Array.from(secret);
  const allowed = ALPHABET.slice(0, base);

  return (
    digits.length === length &&
    digits.every((digit) => allowed.includes(digit)) &&
    new Set(digits).size === length
  );
};

describe('generateSecret', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('picks the first remaining digit each time when random returns 0', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('picks the last remaining digit each time when random is close to 1', () => {
    expect(generateSecret(4, 10, () => 0.999)).toBe('9876');
  });

  it('builds the secret from a deterministic sequence of random values', () => {
    expect(generateSecret(3, 10, createSequenceRandom([0.5, 0, 0.99]))).toBe('509');
  });

  it('uses hex digits in lowercase', () => {
    expect(generateSecret(2, 16, createSequenceRandom([0.7, 0.2]))).toBe('b3');
  });

  it('keeps a leading zero in the secret', () => {
    expect(generateSecret(2, 2, () => 0)).toBe('01');
  });

  it('returns the same secret for the same random sequence', () => {
    const values = [0.13, 0.42, 0.77, 0.05, 0.61, 0.9];

    expect(generateSecret(6, 16, createSequenceRandom(values))).toBe(
      generateSecret(6, 16, createSequenceRandom(values)),
    );
  });

  it('calls the random source once per digit', () => {
    const random = vi.fn(() => 0.3);

    generateSecret(5, 10, random);

    expect(random).toHaveBeenCalledTimes(5);
  });

  it('never goes out of range even if random returns 1', () => {
    expect(
      isSecretValid(
        generateSecret(3, 8, () => 1),
        3,
        8,
      ),
    ).toBe(true);
  });

  it.each<[number, Base]>([
    [2, 2],
    [3, 8],
    [6, 8],
    [4, 10],
    [6, 10],
    [2, 16],
    [6, 16],
  ])('produces %i unique digits valid for base %i', (length, base) => {
    const random = createSequenceRandom([0.37, 0.81, 0.12, 0.64, 0.5, 0.29]);

    expect(isSecretValid(generateSecret(length, base, random), length, base)).toBe(true);
  });

  it('uses Math.random by default', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(generateSecret(3, 10)).toBe('012');
    expect(Math.random).toHaveBeenCalledTimes(3);
  });

  it.each<[number, Base]>([
    [0, 10],
    [-1, 10],
    [3, 2],
    [17, 16],
    [2.5, 10],
  ])('throws a RangeError for length %i and base %i', (length, base) => {
    expect(() => generateSecret(length, base, () => 0)).toThrow(RangeError);
  });
});
