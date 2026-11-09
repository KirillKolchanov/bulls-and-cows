import { returnToSettings, startGame, submitGuess, updateSettings } from '../app/state.js';
import type { AppState } from '../app/state.js';
import { formatDuration } from '../core/format.js';
import { getElapsedMs } from '../core/game.js';
import { generateSecret } from '../core/secret.js';
import { saveRecords } from '../storage/records-storage.js';
import { renderApp } from './views/app-view.js';
import type { AppHandlers } from './views/app-view.js';
import { GUESS_INPUT_NAME, TIMER_ROLE } from './views/game-view.js';

const TIMER_INTERVAL_MS = 250;

export const mountApp = (root: HTMLElement, initialState: AppState): void => {
  let state = initialState;
  let timerId: number | undefined;

  const stopTimer = (): void => {
    window.clearInterval(timerId);
    timerId = undefined;
  };

  const startTimer = (): void => {
    stopTimer();
    if (state.screen.kind !== 'game' || state.screen.game.status !== 'playing') {
      return;
    }
    const { game } = state.screen;
    const timer = root.querySelector(`[data-role="${TIMER_ROLE}"]`);

    timerId = window.setInterval(() => {
      if (timer !== null) {
        timer.textContent = formatDuration(getElapsedMs(game, Date.now()));
      }
    }, TIMER_INTERVAL_MS);
  };

  const focusGuessInput = (): void => {
    const input = root.querySelector<HTMLInputElement>(`input[name="${GUESS_INPUT_NAME}"]`);
    input?.focus();
    input?.select();
  };

  const handlers: AppHandlers = {
    onSettingsChange: (settings) => {
      dispatch(updateSettings(state, settings));
    },
    onStart: () => {
      const { length, base } = state.settings;
      dispatch(startGame(state, generateSecret(length, base), Date.now()));
    },
    onGuess: (guess) => {
      dispatch(submitGuess(state, guess, Date.now()));
    },
    onNewGame: () => {
      dispatch(returnToSettings(state));
    },
  };

  const render = (): void => {
    root.replaceChildren(renderApp(state, handlers, Date.now()));
    startTimer();
    focusGuessInput();
  };

  function dispatch(nextState: AppState): void {
    if (nextState === state) {
      return;
    }
    if (nextState.records !== state.records) {
      saveRecords(nextState.records);
    }
    state = nextState;
    render();
  }

  render();
};
