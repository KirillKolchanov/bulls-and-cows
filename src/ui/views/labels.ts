import { getDigits } from '../../core/digits.js';
import { BASE_OPTIONS } from '../../core/settings.js';
import type { Base, GameSettings } from '../../core/types.js';

export const getBaseLabel = (base: Base): string =>
  BASE_OPTIONS.find((option) => option.base === base)?.label ?? String(base);

export const getDigitRangeLabel = (base: Base): string => {
  const digits = getDigits(base);

  return `${digits[0] ?? ''}–${digits[digits.length - 1] ?? ''}`;
};

export const getSettingsLabel = (settings: GameSettings): string =>
  `${getBaseLabel(settings.base)}, ${String(settings.length)} digits`;
