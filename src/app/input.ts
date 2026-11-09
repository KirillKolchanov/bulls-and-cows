import type { Base } from '../core/types.js';

export type InputSanitizer = (value: string) => string;

export const createInputSanitizer = (base: Base, length: number): InputSanitizer => {
  throw new Error(`createInputSanitizer(${String(base)}, ${String(length)}) is not implemented`);
};
