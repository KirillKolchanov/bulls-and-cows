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

export const getAvailableLengths = (base: Base): readonly number[] => {
  throw new Error(`getAvailableLengths(${String(base)}) is not implemented`);
};

export const isLengthAvailable = (length: number, base: Base): boolean => {
  throw new Error(`isLengthAvailable(${String(length)}, ${String(base)}) is not implemented`);
};

export const normalizeSettings = (settings: GameSettings): GameSettings => {
  throw new Error(`normalizeSettings(${JSON.stringify(settings)}) is not implemented`);
};
