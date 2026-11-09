import { describe, expect, it } from 'vitest';
import {
  applyGuess,
  createGame,
  getAttemptsCount,
  getElapsedMs,
  getGuessError,
  hasBeenGuessed,
} from '../../src/core/game.js';
import type { GameSettings, GameState } from '../../src/core/types.js';

const deepFreeze = <T>(value: T): T => {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const DECIMAL_SETTINGS: GameSettings = { length: 4, base: 10 };
const START = 1_000;

const startDecimalGame = (): GameState => deepFreeze(createGame(DECIMAL_SETTINGS, '1234', START));

describe('createGame', () => {
  it('creates a playing game with an empty history', () => {
    expect(createGame(DECIMAL_SETTINGS, '1234', START)).toEqual({
      settings: { length: 4, base: 10 },
      secret: '1234',
      history: [],
      status: 'playing',
      startedAt: START,
      finishedAt: null,
    });
  });

  it('stores the secret in lowercase', () => {
    expect(createGame({ length: 2, base: 16 }, 'AB', START).secret).toBe('ab');
  });
});

describe('hasBeenGuessed', () => {
  const history = deepFreeze([{ guess: 'ab12', bulls: 0, cows: 1 }]);

  it('finds a guess that is already in the history', () => {
    expect(hasBeenGuessed(history, 'ab12')).toBe(true);
  });

  it('ignores letter case', () => {
    expect(hasBeenGuessed(history, 'AB12')).toBe(true);
  });

  it('returns false for a new guess', () => {
    expect(hasBeenGuessed(history, 'ab13')).toBe(false);
  });
});

describe('getGuessError', () => {
  it('returns null for a valid new guess', () => {
    expect(getGuessError(startDecimalGame(), '5678')).toBeNull();
  });

  it.each(['567', '5566', '56a8', ''])('reports %j as invalid', (guess) => {
    expect(getGuessError(startDecimalGame(), guess)).toBe('invalid');
  });

  it('reports a repeated guess as duplicate', () => {
    const state = applyGuess(startDecimalGame(), '5678', START + 1);

    expect(getGuessError(state, '5678')).toBe('duplicate');
  });

  it('reports any guess after the win as finished', () => {
    const state = applyGuess(startDecimalGame(), '1234', START + 1);

    expect(getGuessError(state, '5678')).toBe('finished');
  });
});

describe('applyGuess', () => {
  it('appends an entry with bulls and cows to the history', () => {
    const state = applyGuess(startDecimalGame(), '1243', START + 10);

    expect(state.history).toEqual([{ guess: '1243', bulls: 2, cows: 2 }]);
    expect(state.status).toBe('playing');
  });

  it('does not mutate the previous state or its history', () => {
    const initial = startDecimalGame();
    const first = deepFreeze(applyGuess(initial, '5678', START + 1));
    const second = applyGuess(first, '1243', START + 2);

    expect(initial.history).toEqual([]);
    expect(first.history).toHaveLength(1);
    expect(second.history).toHaveLength(2);
    expect(second.history).not.toBe(first.history);
    expect(second.history[0]).toBe(first.history[0]);
  });

  it('keeps history entries in the order of guesses', () => {
    const state = ['5678', '1243', '4321'].reduce(
      (current, guess, index) => applyGuess(current, guess, START + index),
      startDecimalGame(),
    );

    expect(state.history.map((entry) => entry.guess)).toEqual(['5678', '1243', '4321']);
  });

  it('stores hex guesses in lowercase', () => {
    const game = deepFreeze(createGame({ length: 2, base: 16 }, 'ab', START));

    expect(applyGuess(game, 'BA', START + 1).history[0]).toEqual({
      guess: 'ba',
      bulls: 0,
      cows: 2,
    });
  });

  it('finishes the game when all digits are bulls', () => {
    const state = applyGuess(startDecimalGame(), '1234', START + 5_000);

    expect(state.status).toBe('won');
    expect(state.finishedAt).toBe(START + 5_000);
    expect(state.history).toEqual([{ guess: '1234', bulls: 4, cows: 0 }]);
  });

  it('returns the same state for an invalid guess', () => {
    const state = startDecimalGame();

    expect(applyGuess(state, '11', START + 1)).toBe(state);
  });

  it('returns the same state for a duplicate guess without doubling the history', () => {
    const state = deepFreeze(applyGuess(startDecimalGame(), '5678', START + 1));

    const repeated = applyGuess(state, '5678', START + 2);

    expect(repeated).toBe(state);
    expect(repeated.history).toHaveLength(1);
  });

  it('ignores guesses after the game is won', () => {
    const won = deepFreeze(applyGuess(startDecimalGame(), '1234', START + 1));

    expect(applyGuess(won, '5678', START + 2)).toBe(won);
  });
});

describe('getAttemptsCount', () => {
  it('counts history entries', () => {
    const state = applyGuess(applyGuess(startDecimalGame(), '5678', 1), '1234', 2);

    expect(getAttemptsCount(state)).toBe(2);
  });
});

describe('getElapsedMs', () => {
  it('measures time from the start while the game is played', () => {
    expect(getElapsedMs(startDecimalGame(), START + 2_500)).toBe(2_500);
  });

  it('freezes the time once the game is won', () => {
    const won = applyGuess(startDecimalGame(), '1234', START + 4_000);

    expect(getElapsedMs(won, START + 60_000)).toBe(4_000);
  });
});
