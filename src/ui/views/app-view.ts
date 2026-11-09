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
  el('header', { className: 'header' }, [
    el('h1', { className: 'header__title', text: 'Bulls & Cows' }),
    el('p', { className: 'header__rules' }, [
      'Guess the secret number made of unique digits. ',
      el('strong', { text: 'Bulls' }),
      ' — right digit in the right place, ',
      el('strong', { text: 'cows' }),
      ' — right digit in the wrong place.',
    ]),
  ]);

const renderSettingsScreen = (state: AppState, handlers: AppHandlers): readonly HTMLElement[] => {
  const startButton = el('button', {
    className: 'button button--primary button--wide',
    text: 'Start game',
    attrs: { type: 'button' },
  });
  startButton.addEventListener('click', handlers.onStart);

  return [
    renderSettings({
      settings: state.settings,
      locked: false,
      onChange: handlers.onSettingsChange,
    }),
    startButton,
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
  el('div', { className: 'app' }, [
    renderHeader(),
    el(
      'main',
      { className: 'main' },
      state.screen.kind === 'settings'
        ? renderSettingsScreen(state, handlers)
        : renderGameScreen(state, handlers, now),
    ),
  ]);
