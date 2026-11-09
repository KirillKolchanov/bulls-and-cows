export const DIGIT_ALPHABET = '0123456789abcdef';
export const normalizeDigit = (char) => char.toLowerCase();
export const getDigits = (base) => Array.from(DIGIT_ALPHABET.slice(0, base));
export const createDigitValidator = (base) => {
    const allowedDigits = new Set(getDigits(base));
    return (char) => allowedDigits.has(normalizeDigit(char));
};
//# sourceMappingURL=digits.js.map