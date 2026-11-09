import type {
  GameSettings,
  GameState,
  GuessError,
  RecordEntry,
  RecordsTable,
} from '../core/types.js';

export type Screen =
  | { readonly kind: 'settings' }
  | {
      readonly kind: 'game';
      readonly game: GameState;
      readonly error: GuessError | null;
      readonly draft: string;
    };

export interface AppState {
  readonly settings: GameSettings;
  readonly screen: Screen;
  readonly records: RecordsTable;
  readonly latestRecord: RecordEntry | null;
}

const notImplemented = (name: string): never => {
  throw new Error(`${name} is not implemented`);
};

export const createAppState = (records: RecordsTable): AppState =>
  notImplemented(`createAppState(${String(Object.keys(records).length)})`);

export const updateSettings = (state: AppState, settings: GameSettings): AppState =>
  notImplemented(`updateSettings(${state.screen.kind}, ${JSON.stringify(settings)})`);

export const startGame = (state: AppState, secret: string, now: number): AppState =>
  notImplemented(`startGame(${state.screen.kind}, ${secret}, ${String(now)})`);

export const submitGuess = (state: AppState, guess: string, now: number): AppState =>
  notImplemented(`submitGuess(${state.screen.kind}, ${guess}, ${String(now)})`);

export const returnToSettings = (state: AppState): AppState =>
  notImplemented(`returnToSettings(${state.screen.kind})`);
