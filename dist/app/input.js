import { createDigitValidator } from '../core/digits.js';
export const createInputSanitizer = (base, length) => {
    const isDigit = createDigitValidator(base);
    return (value) => Array.from(value).filter(isDigit).slice(0, length).join('');
};
//# sourceMappingURL=input.js.map