import { createInputSanitizer } from '../../app/input.js';
import type { Screen } from '../../app/state.js';
import { createDigitValidator } from '../../core/digits.js';
import { formatDuration } from '../../core/format.js';
import { getAttemptsCount, getElapsedMs } from '../../core/game.js';
import type { GameState, GuessEntry, GuessError } from '../../core/types.js';
import { el } from '../dom.js';
import { getDigitRangeLabel } from './labels.js';

export type GameScreen = Extract<Screen, { kind: 'game' }>;

export interface GameViewOptions {
  readonly screen: GameScreen;
  readonly now: number;
  readonly onGuess: (guess: string) => void;
  readonly onNewGame: () => void;
}

export const TIMER_ROLE = 'timer';
export const GUESS_INPUT_NAME = 'guess';

const getErrorMessage = (error: GuessError, game: GameState, draft: string): string => {
  const { length, base } = game.settings;
  const messages: Readonly<Record<GuessError, string>> = {
    invalid: `Enter ${String(length)} different digits from ${getDigitRangeLabel(base)}.`,
    duplicate: `You have already tried ${draft}.`,
    finished: 'This round is over. Start a new game.',
  };
  return messages[error];
};

const formatAttempts = (count: number): string =>
  `${String(count)} ${count === 1 ? 'attempt' : 'attempts'}`;

const renderStat = (label: string, value: string, role?: string): HTMLElement =>
  el('div', { className: 'stat' }, [
    el('span', { className: 'stat__label', text: label }),
    el('span', { className: 'stat__value', text: value, attrs: { 'data-role': role } }),
  ]);

const renderGuessInput = (game: GameState, draft: string): HTMLInputElement => {
  const { length, base } = game.settings;
  const isDigit = createDigitValidator(base);
  const sanitize = createInputSanitizer(base, length);

  const input = el('input', {
    className: 'guess-form__input',
    attrs: {
      type: 'text',
      name: GUESS_INPUT_NAME,
      value: draft,
      maxlength: length,
      inputmode: base <= 10 ? 'numeric' : 'text',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      placeholder: '·'.repeat(length),
      'aria-label': `Your guess, ${String(length)} digits`,
    },
  });

  input.addEventListener('beforeinput', (event) => {
    if (event.data === null) {
      return;
    }
    const allowed = Array.from(event.data).filter(isDigit).join('');
    if (allowed === event.data) {
      return;
    }
    event.preventDefault();
    if (allowed !== '') {
      input.setRangeText(
        allowed,
        input.selectionStart ?? input.value.length,
        input.selectionEnd ?? input.value.length,
        'end',
      );
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  input.addEventListener('input', () => {
    const sanitized = sanitize(input.value);
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
  });

  return input;
};

const renderGuessForm = (screen: GameScreen, onGuess: (guess: string) => void): HTMLElement => {
  const input = renderGuessInput(screen.game, screen.draft);
  const form = el('form', { className: 'guess-form', attrs: { novalidate: true } }, [
    input,
    el('button', { className: 'button button--primary', text: 'Check', attrs: { type: 'submit' } }),
  ]);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onGuess(input.value);
  });

  return form;
};

const renderHistoryRow = (entry: GuessEntry, index: number, length: number): HTMLElement =>
  el('tr', { className: entry.bulls === length ? 'history__row--win' : '' }, [
    el('td', { text: String(index + 1) }),
    el('td', { className: 'history__guess', text: entry.guess }),
    el('td', { className: 'history__bulls', text: String(entry.bulls) }),
    el('td', { className: 'history__cows', text: String(entry.cows) }),
  ]);

const renderHistory = (game: GameState): HTMLElement =>
  game.history.length === 0
    ? el('p', { className: 'empty', text: 'No attempts yet. Make your first guess!' })
    : el('table', { className: 'table history' }, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { text: '#' }),
            el('th', { text: 'Guess' }),
            el('th', { text: 'Bulls' }),
            el('th', { text: 'Cows' }),
          ]),
        ]),
        el(
          'tbody',
          {},
          game.history.map((entry, index) => renderHistoryRow(entry, index, game.settings.length)),
        ),
      ]);

const renderWinBanner = (game: GameState, now: number): HTMLElement =>
  el('div', { className: 'banner', attrs: { role: 'status' } }, [
    el('strong', { text: `You cracked ${game.secret}!` }),
    el('span', {
      text: ` ${formatAttempts(getAttemptsCount(game))} in ${formatDuration(getElapsedMs(game, now))}.`,
    }),
  ]);

export const renderGame = ({ screen, now, onGuess, onNewGame }: GameViewOptions): HTMLElement => {
  const { game, error, draft } = screen;
  const newGameButton = el('button', {
    className: game.status === 'won' ? 'button button--primary' : 'button',
    text: 'New game',
    attrs: { type: 'button' },
  });
  newGameButton.addEventListener('click', onNewGame);

  return el('section', { className: 'card game' }, [
    el('div', { className: 'game__header' }, [
      el('h2', { className: 'card__title', text: 'Game' }),
      el('div', { className: 'stats' }, [
        renderStat('Attempts', String(getAttemptsCount(game))),
        renderStat('Time', formatDuration(getElapsedMs(game, now)), TIMER_ROLE),
      ]),
    ]),
    game.status === 'won' ? renderWinBanner(game, now) : renderGuessForm(screen, onGuess),
    error !== null &&
      el('p', {
        className: 'error',
        text: getErrorMessage(error, game, draft),
        attrs: { role: 'alert' },
      }),
    renderHistory(game),
    el('div', { className: 'actions' }, [newGameButton]),
  ]);
};
