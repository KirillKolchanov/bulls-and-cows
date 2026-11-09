import { normalizeDigit } from './digits.js';
import { evaluateGuess } from './evaluation.js';
import { isValidGuess } from './validation.js';
const normalizeNumber = (value) => Array.from(value, normalizeDigit).join('');
export const createGame = (settings, secret, startedAt) => ({
    settings: { ...settings },
    secret: normalizeNumber(secret),
    history: [],
    status: 'playing',
    startedAt,
    finishedAt: null,
});
export const hasBeenGuessed = (history, guess) => {
    const normalizedGuess = normalizeNumber(guess);
    return history.some((entry) => entry.guess === normalizedGuess);
};
export const getGuessError = (state, guess) => {
    if (state.status !== 'playing') {
        return 'finished';
    }
    if (!isValidGuess(guess, state.settings.length, state.settings.base)) {
        return 'invalid';
    }
    if (hasBeenGuessed(state.history, guess)) {
        return 'duplicate';
    }
    return null;
};
export const applyGuess = (state, guess, now) => {
    if (getGuessError(state, guess) !== null) {
        return state;
    }
    const normalizedGuess = normalizeNumber(guess);
    const entry = {
        guess: normalizedGuess,
        ...evaluateGuess(state.secret, normalizedGuess),
    };
    const isWon = entry.bulls === state.settings.length;
    return {
        ...state,
        history: [...state.history, entry],
        status: isWon ? 'won' : 'playing',
        finishedAt: isWon ? now : null,
    };
};
export const getAttemptsCount = (state) => state.history.length;
export const getElapsedMs = (state, now) => (state.finishedAt ?? now) - state.startedAt;
//# sourceMappingURL=game.js.map