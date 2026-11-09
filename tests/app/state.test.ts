import { describe, expect, it } from 'vitest';
import {
  createAppState,
  returnToSettings,
  startGame,
  submitGuess,
  updateSettings,
} from '../../src/app/state.js';
import type { AppState, Screen } from '../../src/app/state.js';
import { DEFAULT_SETTINGS } from '../../src/core/settings.js';
import type { RecordsTable } from '../../src/core/types.js';

const deepFreeze = <T>(value: T): T => {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const initial = (records: RecordsTable = {}): AppState => deepFreeze(createAppState(records));

const playing = (): AppState => deepFreeze(startGame(initial(), '1234', 1_000));

const getGame = (state: AppState): Extract<Screen, { kind: 'game' }> => {
  if (state.screen.kind !== 'game') {
    throw new Error('Expected the game screen');
  }
  return state.screen;
};

describe('createAppState', () => {
  it('starts on the settings screen with default settings', () => {
    const records: RecordsTable = { '10:4': [{ attempts: 3, timeMs: 1, achievedAt: 0 }] };

    expect(createAppState(records)).toEqual({
      settings: DEFAULT_SETTINGS,
      screen: { kind: 'settings' },
      records,
      latestRecord: null,
    });
  });
});

describe('updateSettings', () => {
  it('changes settings on the settings screen', () => {
    expect(updateSettings(initial(), { length: 6, base: 16 }).settings).toEqual({
      length: 6,
      base: 16,
    });
  });

  it('normalizes the length for binary', () => {
    expect(updateSettings(initial(), { length: 4, base: 2 }).settings).toEqual({
      length: 2,
      base: 2,
    });
  });

  it('ignores settings changes while a game is running', () => {
    const state = playing();

    expect(updateSettings(state, { length: 6, base: 16 })).toBe(state);
  });
});

describe('startGame', () => {
  it('opens the game screen with a new game for the current settings', () => {
    const screen = getGame(playing());

    expect(screen.game.settings).toEqual(DEFAULT_SETTINGS);
    expect(screen.game.secret).toBe('1234');
    expect(screen.game.startedAt).toBe(1_000);
    expect(screen.error).toBeNull();
    expect(screen.draft).toBe('');
  });

  it('clears the latest record of a previous round', () => {
    const won = submitGuess(playing(), '1234', 2_000);
    const restarted = startGame(returnToSettings(won), '5678', 3_000);

    expect(restarted.latestRecord).toBeNull();
  });
});

describe('submitGuess', () => {
  it('adds a valid guess to the game history', () => {
    const screen = getGame(submitGuess(playing(), '1243', 2_000));

    expect(screen.game.history).toEqual([{ guess: '1243', bulls: 2, cows: 2 }]);
    expect(screen.error).toBeNull();
    expect(screen.draft).toBe('');
  });

  it('keeps the rejected guess as a draft with an error', () => {
    const state = playing();

    const screen = getGame(submitGuess(state, '1123', 2_000));

    expect(screen.error).toBe('invalid');
    expect(screen.draft).toBe('1123');
    expect(screen.game).toBe(getGame(state).game);
  });

  it('reports a duplicate guess without changing the history', () => {
    const once = submitGuess(playing(), '5678', 2_000);
    const twice = getGame(submitGuess(once, '5678', 3_000));

    expect(twice.error).toBe('duplicate');
    expect(twice.game.history).toHaveLength(1);
  });

  it('saves a record to the table when the game is won', () => {
    const afterMiss = submitGuess(playing(), '5678', 2_000);
    const won = submitGuess(afterMiss, '1234', 6_000);
    const expected = { attempts: 2, timeMs: 5_000, achievedAt: 6_000 };

    expect(getGame(won).game.status).toBe('won');
    expect(won.latestRecord).toEqual(expected);
    expect(won.records).toEqual({ '10:4': [expected] });
  });

  it('keeps the same records table while the game is not won', () => {
    const state = playing();

    expect(submitGuess(state, '5678', 2_000).records).toBe(state.records);
  });

  it('does nothing on the settings screen', () => {
    const state = initial();

    expect(submitGuess(state, '1234', 2_000)).toBe(state);
  });
});

describe('returnToSettings', () => {
  it('goes back to the settings screen keeping settings and records', () => {
    const won = submitGuess(playing(), '1234', 2_000);
    const back = returnToSettings(won);

    expect(back.screen).toEqual({ kind: 'settings' });
    expect(back.settings).toEqual(won.settings);
    expect(back.records).toBe(won.records);
  });
});
