export const MIN_SECRET_LENGTH = 2;
export const MAX_SECRET_LENGTH = 6;
export const BASE_OPTIONS = [
    { base: 2, label: 'bin' },
    { base: 8, label: 'oct' },
    { base: 10, label: 'dec' },
    { base: 16, label: 'hex' },
];
export const DEFAULT_SETTINGS = { length: 4, base: 10 };
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const SECRET_LENGTHS = Array.from({ length: MAX_SECRET_LENGTH - MIN_SECRET_LENGTH + 1 }, (_, offset) => MIN_SECRET_LENGTH + offset);
export const getAvailableLengths = (base) => SECRET_LENGTHS.filter((length) => length <= base);
export const isLengthAvailable = (length, base) => getAvailableLengths(base).includes(length);
export const normalizeSettings = (settings) => {
    const maxLength = Math.min(MAX_SECRET_LENGTH, settings.base);
    return {
        ...settings,
        length: clamp(Math.trunc(settings.length), MIN_SECRET_LENGTH, maxLength),
    };
};
//# sourceMappingURL=settings.js.map