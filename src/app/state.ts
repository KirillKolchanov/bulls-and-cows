import { applyGuess, createGame, getGuessError } from '../core/game.js';
import { addRecordToTable, createRecordFromGame } from '../core/records.js';
import { DEFAULT_SETTINGS, normalizeSettings } from '../core/settings.js';
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

const SETTINGS_SCREEN: Screen = { kind: 'settings' };

export const createAppState = (records: RecordsTable): AppState => ({
  settings: DEFAULT_SETTINGS,
  screen: SETTINGS_SCREEN,
  records,
  latestRecord: null,
});

export const updateSettings = (state: AppState, settings: GameSettings): AppState =>
  state.screen.kind === 'settings' ? { ...state, settings: normalizeSettings(settings) } : state;

export const startGame = (state: AppState, secret: string, now: number): AppState => ({
  ...state,
  screen: { kind: 'game', game: createGame(state.settings, secret, now), error: null, draft: '' },
  latestRecord: null,
});

export const submitGuess = (state: AppState, guess: string, now: number): AppState => {
  if (state.screen.kind !== 'game') {
    return state;
  }
  const { game } = state.screen;
  const error = getGuessError(game, guess);

  if (error !== null) {
    return { ...state, screen: { ...state.screen, error, draft: guess } };
  }
  const nextGame = applyGuess(game, guess, now);
  const record = createRecordFromGame(nextGame);

  return {
    ...state,
    screen: { kind: 'game', game: nextGame, error: null, draft: '' },
    records:
      record === null ? state.records : addRecordToTable(state.records, nextGame.settings, record),
    latestRecord: record ?? state.latestRecord,
  };
};

export const returnToSettings = (state: AppState): AppState => ({
  ...state,
  screen: SETTINGS_SCREEN,
});
