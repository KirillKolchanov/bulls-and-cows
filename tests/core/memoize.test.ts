import { describe, expect, it, vi } from 'vitest';
import { memoize } from '../../src/core/memoize.js';

const sum = (a: number, b: number): number => a + b;

describe('memoize', () => {
  it('returns the same result as the original function', () => {
    const memoizedSum = memoize(sum);

    expect(memoizedSum(2, 3)).toBe(5);
  });

  it('calls the original function only once for the same arguments', () => {
    const spy = vi.fn(sum);
    const memoizedSum = memoize(spy);

    memoizedSum(2, 3);
    memoizedSum(2, 3);
    memoizedSum(2, 3);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('calls the original function again for different arguments', () => {
    const spy = vi.fn(sum);
    const memoizedSum = memoize(spy);

    expect(memoizedSum(2, 3)).toBe(5);
    expect(memoizedSum(3, 2)).toBe(5);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('distinguishes argument lists that would collide when concatenated', () => {
    const spy = vi.fn((a: number, b: number) => `${String(a)}:${String(b)}`);
    const memoized = memoize(spy);

    expect(memoized(1, 23)).toBe('1:23');
    expect(memoized(12, 3)).toBe('12:3');
  });

  it('caches falsy results', () => {
    const spy = vi.fn((value: number) => value * 0);
    const memoized = memoize(spy);

    memoized(7);
    memoized(7);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('keeps separate caches for separately memoized functions', () => {
    const first = vi.fn(sum);
    const second = vi.fn(sum);
    const memoizedFirst = memoize(first);
    const memoizedSecond = memoize(second);

    memoizedFirst(1, 1);
    memoizedSecond(1, 1);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('uses a custom key resolver when provided', () => {
    const spy = vi.fn((text: string) => text.length);
    const memoizedLength = memoize(spy, (text) => text.toLowerCase());

    expect(memoizedLength('ABC')).toBe(3);
    expect(memoizedLength('abc')).toBe(3);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
