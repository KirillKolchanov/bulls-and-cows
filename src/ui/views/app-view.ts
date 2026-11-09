import type { AppState } from '../../app/state.js';
import type { GameSettings } from '../../core/types.js';
import { el } from '../dom.js';
import { renderGame } from './game-view.js';
import { renderRecords } from './records-view.js';
import { renderSettings } from './settings-view.js';

export interface AppHandlers {
  readonly onSettingsChange: (settings: GameSettings) => void;
  readonly onStart: () => void;
  readonly onGuess: (guess: string) => void;
  readonly onNewGame: () => void;
}

const renderHeader = (): HTMLElement =>
  el('header', {}, [
    el('h1', { text: 'Bulls and Cows' }),
    el('p', {
      text: 'Guess the secret number with unique digits. Bulls: right digit in the right place. Cows: right digit in the wrong place.',
    }),
  ]);

const renderSettingsScreen = (state: AppState, handlers: AppHandlers): readonly HTMLElement[] => {
  const startButton = el('button', { text: 'Start game', attrs: { type: 'button' } });
  startButton.addEventListener('click', handlers.onStart);

  return [
    renderSettings({
      settings: state.settings,
      locked: false,
      onChange: handlers.onSettingsChange,
    }),
    el('p', {}, [startButton]),
    renderRecords({ records: state.records, settings: state.settings, latestRecord: null }),
  ];
};

const renderGameScreen = (
  state: AppState,
  handlers: AppHandlers,
  now: number,
): readonly HTMLElement[] => {
  if (state.screen.kind !== 'game') {
    return [];
  }
  const { screen } = state;

  return [
    renderSettings({
      settings: screen.game.settings,
      locked: true,
      onChange: handlers.onSettingsChange,
    }),
    renderGame({ screen, now, onGuess: handlers.onGuess, onNewGame: handlers.onNewGame }),
    screen.game.status === 'won' &&
      renderRecords({
        records: state.records,
        settings: screen.game.settings,
        latestRecord: state.latestRecord,
      }),
  ].filter((element): element is HTMLElement => element !== false);
};

export const renderApp = (state: AppState, handlers: AppHandlers, now: number): HTMLElement =>
  el('div', {}, [
    renderHeader(),
    el(
      'main',
      {},
      state.screen.kind === 'settings'
        ? renderSettingsScreen(state, handlers)
        : renderGameScreen(state, handlers, now),
    ),
  ]);
