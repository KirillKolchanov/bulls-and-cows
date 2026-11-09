export type Base = 2 | 8 | 10 | 16;

export type DigitValidator = (char: string) => boolean;

export interface GuessResult {
  readonly bulls: number;
  readonly cows: number;
}

export type RandomSource = () => number;

export interface GameSettings {
  readonly length: number;
  readonly base: Base;
}

export interface GuessEntry extends GuessResult {
  readonly guess: string;
}

export type GameStatus = 'playing' | 'won';

export interface GameState {
  readonly settings: GameSettings;
  readonly secret: string;
  readonly history: readonly GuessEntry[];
  readonly status: GameStatus;
  readonly startedAt: number;
  readonly finishedAt: number | null;
}

export type GuessError = 'invalid' | 'duplicate' | 'finished';
