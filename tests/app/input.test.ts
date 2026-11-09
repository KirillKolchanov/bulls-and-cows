import { describe, expect, it } from 'vitest';
import { createInputSanitizer } from '../../src/app/input.js';

describe('createInputSanitizer', () => {
  it('keeps a value that only has allowed digits', () => {
    expect(createInputSanitizer(10, 4)('0123')).toBe('0123');
  });

  it('removes characters that are not digits of the base', () => {
    expect(createInputSanitizer(8, 4)('1a8 9-7')).toBe('17');
    expect(createInputSanitizer(2, 2)('2101')).toBe('10');
  });

  it('keeps hex letters in any case', () => {
    expect(createInputSanitizer(16, 4)('aFgZ1')).toBe('aF1');
  });

  it('cuts the value to the secret length', () => {
    expect(createInputSanitizer(10, 3)('123456')).toBe('123');
  });

  it('returns an empty string when nothing is allowed', () => {
    expect(createInputSanitizer(10, 4)('abc')).toBe('');
  });
});
