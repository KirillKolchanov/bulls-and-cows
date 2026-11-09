export type Base = 2 | 8 | 10 | 16;

export type DigitValidator = (char: string) => boolean;

export interface GuessResult {
  readonly bulls: number;
  readonly cows: number;
}

export type RandomSource = () => number;
