import { normalizeDigit } from './digits.js';
import { evaluateGuess } from './evaluation.js';
import { isValidGuess } from './validation.js';
import type { GameSettings, GameState, GuessEntry, GuessError } from './types.js';

const normalizeNumber = (value: string): string => Array.from(value, normalizeDigit).join('');

export const createGame = (
  settings: GameSettings,
  secret: string,
  startedAt: number,
): GameState => ({
  settings: { ...settings },
  secret: normalizeNumber(secret),
  history: [],
  status: 'playing',
  startedAt,
  finishedAt: null,
});

export const hasBeenGuessed = (history: readonly GuessEntry[], guess: string): boolean => {
  const normalizedGuess = normalizeNumber(guess);

  return history.some((entry) => entry.guess === normalizedGuess);
};

export const getGuessError = (state: GameState, guess: string): GuessError | null => {
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

export const applyGuess = (state: GameState, guess: string, now: number): GameState => {
  if (getGuessError(state, guess) !== null) {
    return state;
  }
  const normalizedGuess = normalizeNumber(guess);
  const entry: GuessEntry = {
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

export const getAttemptsCount = (state: GameState): number => state.history.length;

export const getElapsedMs = (state: GameState, now: number): number =>
  (state.finishedAt ?? now) - state.startedAt;
