import { getDigits } from './digits.js';
const pickIndex = (size, random) => Math.min(Math.floor(random() * size), size - 1);
const removeAt = (items, index) => [
    ...items.slice(0, index),
    ...items.slice(index + 1),
];
const drawDigits = (pool, count, random) => {
    if (count === 0) {
        return [];
    }
    const index = pickIndex(pool.length, random);
    const digit = pool[index] ?? '';
    return [digit, ...drawDigits(removeAt(pool, index), count - 1, random)];
};
export const generateSecret = (length, base, random = Math.random) => {
    if (!Number.isInteger(length) || length < 1 || length > base) {
        throw new RangeError(`Secret length must be an integer from 1 to ${String(base)}, got ${String(length)}`);
    }
    return drawDigits(getDigits(base), length, random).join('');
};
//# sourceMappingURL=secret.js.map