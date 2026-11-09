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
    invalid: `Enter ${String(length)} different digits (${getDigitRangeLabel(base)}).`,
    duplicate: `You have already tried ${draft}.`,
    finished: 'The game is over.',
  };
  return messages[error];
};

const renderGuessInput = (game: GameState, draft: string): HTMLInputElement => {
  const { length, base } = game.settings;
  const isDigit = createDigitValidator(base);
  const sanitize = createInputSanitizer(base, length);

  const input = el('input', {
    attrs: {
      type: 'text',
      name: GUESS_INPUT_NAME,
      value: draft,
      maxlength: length,
      autocomplete: 'off',
      spellcheck: 'false',
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
  const form = el('form', { attrs: { novalidate: true } }, [
    input,
    ' ',
    el('button', { text: 'Check', attrs: { type: 'submit' } }),
  ]);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onGuess(input.value);
  });

  return form;
};

const renderHistory = (history: readonly GuessEntry[]): HTMLElement =>
  history.length === 0
    ? el('p', { text: 'No attempts yet.' })
    : el('table', {}, [
        el('tr', {}, [
          el('th', { text: '#' }),
          el('th', { text: 'Guess' }),
          el('th', { text: 'Bulls' }),
          el('th', { text: 'Cows' }),
        ]),
        ...history.map((entry, index) =>
          el('tr', {}, [
            el('td', { text: String(index + 1) }),
            el('td', { text: entry.guess.toUpperCase() }),
            el('td', { text: String(entry.bulls) }),
            el('td', { text: String(entry.cows) }),
          ]),
        ),
      ]);

export const renderGame = ({ screen, now, onGuess, onNewGame }: GameViewOptions): HTMLElement => {
  const { game, error, draft } = screen;
  const isWon = game.status === 'won';
  const newGameButton = el('button', { text: 'New game', attrs: { type: 'button' } });
  newGameButton.addEventListener('click', onNewGame);

  return el('section', {}, [
    el('p', {}, [
      `Attempts: ${String(getAttemptsCount(game))}, time: `,
      el('span', {
        text: formatDuration(getElapsedMs(game, now)),
        attrs: { 'data-role': TIMER_ROLE },
      }),
    ]),
    isWon
      ? el('p', {}, [el('b', { text: `You won! The number was ${game.secret.toUpperCase()}.` })])
      : renderGuessForm(screen, onGuess),
    error !== null && el('p', { className: 'error', text: getErrorMessage(error, game, draft) }),
    renderHistory(game.history),
    el('p', {}, [newGameButton]),
  ]);
};
