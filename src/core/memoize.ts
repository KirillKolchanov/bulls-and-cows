export type KeyResolver<Args extends readonly unknown[]> = (...args: Args) => string;

export const memoize = <Args extends readonly unknown[], Result>(
  fn: (...args: Args) => Result,
  resolveKey?: KeyResolver<Args>,
): ((...args: Args) => Result) => {
  throw new Error(`memoize(${fn.name}, ${typeof resolveKey}) is not implemented`);
};
