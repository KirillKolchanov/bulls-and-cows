import { createDigitValidator } from '../core/digits.js';
import type { Base } from '../core/types.js';

export type InputSanitizer = (value: string) => string;

export const createInputSanitizer = (base: Base, length: number): InputSanitizer => {
  const isDigit = createDigitValidator(base);

  return (value) => Array.from(value).filter(isDigit).slice(0, length).join('');
};
