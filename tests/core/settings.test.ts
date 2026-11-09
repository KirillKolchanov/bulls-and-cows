import { describe, expect, it } from 'vitest';
import {
  getAvailableLengths,
  isLengthAvailable,
  normalizeSettings,
} from '../../src/core/settings.js';
import type { Base, GameSettings } from '../../src/core/types.js';

describe('getAvailableLengths', () => {
  it.each<[Base, number[]]>([
    [2, [2]],
    [8, [2, 3, 4, 5, 6]],
    [10, [2, 3, 4, 5, 6]],
    [16, [2, 3, 4, 5, 6]],
  ])('returns lengths available for base %i', (base, expected) => {
    expect(getAvailableLengths(base)).toEqual(expected);
  });
});

describe('isLengthAvailable', () => {
  it.each<[number, Base, boolean]>([
    [2, 2, true],
    [3, 2, false],
    [6, 2, false],
    [2, 10, true],
    [6, 10, true],
    [1, 10, false],
    [7, 16, false],
    [4.5, 10, false],
  ])('returns %j for length %i in base %i', (length, base, expected) => {
    expect(isLengthAvailable(length, base)).toBe(expected);
  });
});

describe('normalizeSettings', () => {
  it('keeps settings that are already valid', () => {
    const settings: GameSettings = Object.freeze({ length: 5, base: 16 });

    expect(normalizeSettings(settings)).toEqual({ length: 5, base: 16 });
  });

  it('clamps the length to the only one available for binary', () => {
    expect(normalizeSettings({ length: 4, base: 2 })).toEqual({ length: 2, base: 2 });
  });

  it.each<[number, number]>([
    [1, 2],
    [0, 2],
    [9, 6],
  ])('clamps length %i into the allowed range as %i', (length, expected) => {
    expect(normalizeSettings({ length, base: 10 })).toEqual({ length: expected, base: 10 });
  });

  it('does not mutate the original settings', () => {
    const settings: GameSettings = Object.freeze({ length: 6, base: 2 });

    const normalized = normalizeSettings(settings);

    expect(settings).toEqual({ length: 6, base: 2 });
    expect(normalized).not.toBe(settings);
  });
});
