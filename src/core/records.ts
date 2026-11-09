import { getAttemptsCount, getElapsedMs } from './game.js';
import type { GameSettings, GameState, RecordEntry, RecordsTable } from './types.js';

export const RECORDS_LIMIT = 10;

export const getRecordsKey = (settings: GameSettings): string =>
  `${String(settings.base)}:${String(settings.length)}`;

export const compareRecords = (first: RecordEntry, second: RecordEntry): number =>
  first.attempts - second.attempts || first.timeMs - second.timeMs;

export const createRecordFromGame = (state: GameState): RecordEntry | null =>
  state.status === 'won' && state.finishedAt !== null
    ? {
        attempts: getAttemptsCount(state),
        timeMs: getElapsedMs(state, state.finishedAt),
        achievedAt: state.finishedAt,
      }
    : null;

export const insertRecord =
  (limit: number) =>
  (records: readonly RecordEntry[], entry: RecordEntry): readonly RecordEntry[] =>
    [...records, entry].sort(compareRecords).slice(0, limit);

export const getRecords = (table: RecordsTable, settings: GameSettings): readonly RecordEntry[] =>
  table[getRecordsKey(settings)] ?? [];

export const addRecordToTable = (
  table: RecordsTable,
  settings: GameSettings,
  entry: RecordEntry,
  limit: number = RECORDS_LIMIT,
): RecordsTable => ({
  ...table,
  [getRecordsKey(settings)]: insertRecord(limit)(getRecords(table, settings), entry),
});

const isPlainObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isRecordEntry = (value: unknown): value is RecordEntry =>
  isPlainObject(value) &&
  isNonNegativeNumber(value.attempts) &&
  isNonNegativeNumber(value.timeMs) &&
  isNonNegativeNumber(value.achievedAt);

const safeJsonParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const parseRecordsTable = (raw: string | null): RecordsTable => {
  const parsed = raw === null ? null : safeJsonParse(raw);

  if (!isPlainObject(parsed)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(parsed)
      .filter((pair): pair is [string, unknown[]] => Array.isArray(pair[1]))
      .map(([key, entries]) => [key, entries.filter(isRecordEntry)]),
  );
};
