export type KeyResolver<Args extends readonly unknown[]> = (...args: Args) => string;

const serializeArgs = (...args: readonly unknown[]): string => JSON.stringify(args);

export const memoize = <Args extends readonly unknown[], Result>(
  fn: (...args: Args) => Result,
  resolveKey: KeyResolver<Args> = serializeArgs,
): ((...args: Args) => Result) => {
  const cache = new Map<string, Result>();

  return (...args) => {
    const key = resolveKey(...args);

    if (cache.has(key)) {
      return cache.get(key) as Result;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
