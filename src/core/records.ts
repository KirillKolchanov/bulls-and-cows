import type { GameSettings, GameState, RecordEntry, RecordsTable } from './types.js';

export const RECORDS_LIMIT = 10;

const notImplemented = (name: string): never => {
  throw new Error(`${name} is not implemented`);
};

export const getRecordsKey = (settings: GameSettings): string =>
  notImplemented(`getRecordsKey(${JSON.stringify(settings)})`);

export const compareRecords = (first: RecordEntry, second: RecordEntry): number =>
  notImplemented(`compareRecords(${String(first.attempts)}, ${String(second.attempts)})`);

export const createRecordFromGame = (state: GameState): RecordEntry | null =>
  notImplemented(`createRecordFromGame(${state.status})`);

export const insertRecord =
  (limit: number) =>
  (records: readonly RecordEntry[], entry: RecordEntry): readonly RecordEntry[] =>
    notImplemented(
      `insertRecord(${String(limit)})(${String(records.length)}, ${String(entry.attempts)})`,
    );

export const getRecords = (table: RecordsTable, settings: GameSettings): readonly RecordEntry[] =>
  notImplemented(`getRecords(${String(Object.keys(table).length)}, ${String(settings.base)})`);

export const addRecordToTable = (
  table: RecordsTable,
  settings: GameSettings,
  entry: RecordEntry,
  limit: number = RECORDS_LIMIT,
): RecordsTable =>
  notImplemented(
    `addRecordToTable(${String(Object.keys(table).length)}, ${String(settings.base)}, ${String(entry.attempts)}, ${String(limit)})`,
  );

export const parseRecordsTable = (raw: string | null): RecordsTable =>
  notImplemented(`parseRecordsTable(${String(raw)})`);
