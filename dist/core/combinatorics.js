import { memoize } from './memoize.js';
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;
const countPermutations = memoize((length, base) => {
    if (length === 0) {
        return 1;
    }
    if (base === 0) {
        return 0;
    }
    return base * countPermutations(length - 1, base - 1);
});
export const countPossibleSecrets = (length, base) => {
    if (!isNonNegativeInteger(length) || !isNonNegativeInteger(base)) {
        throw new RangeError(`Length and base must be non-negative integers, got ${String(length)} and ${String(base)}`);
    }
    return countPermutations(length, base);
};
//# sourceMappingURL=combinatorics.js.map