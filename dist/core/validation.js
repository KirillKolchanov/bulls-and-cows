import { createDigitValidator, normalizeDigit } from './digits.js';
const hasUniqueItems = (items) => new Set(items).size === items.length;
export const isValidGuess = (guess, length, base) => {
    const digits = Array.from(guess, normalizeDigit);
    return (digits.length === length && digits.every(createDigitValidator(base)) && hasUniqueItems(digits));
};
//# sourceMappingURL=validation.js.map