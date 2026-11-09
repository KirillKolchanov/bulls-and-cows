import type { Base, GameSettings } from './types.js';

export const MIN_SECRET_LENGTH = 2;
export const MAX_SECRET_LENGTH = 6;

export const BASE_OPTIONS: readonly { readonly base: Base; readonly label: string }[] = [
  { base: 2, label: 'bin' },
  { base: 8, label: 'oct' },
  { base: 10, label: 'dec' },
  { base: 16, label: 'hex' },
];

export const DEFAULT_SETTINGS: GameSettings = { length: 4, base: 10 };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const ALL_LENGTHS: readonly number[] = Array.from(
  { length: MAX_SECRET_LENGTH - MIN_SECRET_LENGTH + 1 },
  (_, offset) => MIN_SECRET_LENGTH + offset,
);

export const getAvailableLengths = (base: Base): readonly number[] =>
  ALL_LENGTHS.filter((length) => length <= base);

export const isLengthAvailable = (length: number, base: Base): boolean =>
  getAvailableLengths(base).includes(length);

export const normalizeSettings = (settings: GameSettings): GameSettings => {
  const maxLength = Math.min(MAX_SECRET_LENGTH, settings.base);

  return {
    ...settings,
    length: clamp(Math.trunc(settings.length), MIN_SECRET_LENGTH, maxLength),
  };
};
