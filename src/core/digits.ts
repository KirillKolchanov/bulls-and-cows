import type { Base, DigitValidator } from './types.js';

export const createDigitValidator = (base: Base): DigitValidator => {
  throw new Error(`createDigitValidator(${String(base)}) is not implemented`);
};
