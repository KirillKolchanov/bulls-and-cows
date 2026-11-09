import { getDigits } from '../../core/digits.js';
import { BASE_OPTIONS } from '../../core/settings.js';
export const getBaseLabel = (base) => BASE_OPTIONS.find((option) => option.base === base)?.label ?? String(base);
export const getDigitRangeLabel = (base) => {
    const digits = getDigits(base);
    return `${digits[0] ?? ''}–${digits[digits.length - 1] ?? ''}`;
};
export const getSettingsLabel = (settings) => `${getBaseLabel(settings.base)}, ${String(settings.length)} digits`;
//# sourceMappingURL=labels.js.map