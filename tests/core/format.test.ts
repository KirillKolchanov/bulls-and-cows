import { describe, expect, it } from 'vitest';
import { formatDuration } from '../../src/core/format.js';

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [999, '0:00'],
    [1_000, '0:01'],
    [59_999, '0:59'],
    [60_000, '1:00'],
    [605_000, '10:05'],
    [3_600_000, '1:00:00'],
    [3_725_000, '1:02:05'],
  ])('formats %i ms as %j', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });

  it('treats negative durations as zero', () => {
    expect(formatDuration(-5_000)).toBe('0:00');
  });
});
