import { normalizeDigit } from './digits.js';
const toNormalizedDigits = (value) => Array.from(value, normalizeDigit);
export const evaluateGuess = (secret, guess) => {
    const secretDigits = toNormalizedDigits(secret);
    const secretDigitSet = new Set(secretDigits);
    return toNormalizedDigits(guess).reduce((result, digit, index) => {
        if (secretDigits[index] === digit) {
            return { ...result, bulls: result.bulls + 1 };
        }
        if (secretDigitSet.has(digit)) {
            return { ...result, cows: result.cows + 1 };
        }
        return result;
    }, { bulls: 0, cows: 0 });
};
//# sourceMappingURL=evaluation.js.map