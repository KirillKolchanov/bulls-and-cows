import type { GameSettings, GameState, GuessEntry, GuessError } from './types.js';

const notImplemented = (name: string): never => {
  throw new Error(`${name} is not implemented`);
};

export const createGame = (settings: GameSettings, secret: string, startedAt: number): GameState =>
  notImplemented(`createGame(${JSON.stringify(settings)}, ${secret}, ${String(startedAt)})`);

export const hasBeenGuessed = (history: readonly GuessEntry[], guess: string): boolean =>
  notImplemented(`hasBeenGuessed(${String(history.length)}, ${guess})`);

export const getGuessError = (state: GameState, guess: string): GuessError | null =>
  notImplemented(`getGuessError(${state.status}, ${guess})`);

export const applyGuess = (state: GameState, guess: string, now: number): GameState =>
  notImplemented(`applyGuess(${state.status}, ${guess}, ${String(now)})`);

export const getAttemptsCount = (state: GameState): number =>
  notImplemented(`getAttemptsCount(${state.status})`);

export const getElapsedMs = (state: GameState, now: number): number =>
  notImplemented(`getElapsedMs(${state.status}, ${String(now)})`);
