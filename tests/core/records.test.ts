import { describe, expect, it } from 'vitest';
import { applyGuess, createGame } from '../../src/core/game.js';
import {
  addRecordToTable,
  compareRecords,
  createRecordFromGame,
  getRecords,
  getRecordsKey,
  insertRecord,
  parseRecordsTable,
  RECORDS_LIMIT,
} from '../../src/core/records.js';
import type { GameSettings, RecordEntry, RecordsTable } from '../../src/core/types.js';

const record = (attempts: number, timeMs: number, achievedAt = 0): RecordEntry =>
  Object.freeze({ attempts, timeMs, achievedAt });

const DECIMAL: GameSettings = { length: 4, base: 10 };
const HEX: GameSettings = { length: 4, base: 16 };

describe('getRecordsKey', () => {
  it('builds a distinct key for every base and length combination', () => {
    expect(getRecordsKey(DECIMAL)).toBe('10:4');
    expect(getRecordsKey(HEX)).toBe('16:4');
    expect(getRecordsKey({ length: 2, base: 2 })).toBe('2:2');
  });
});

describe('compareRecords', () => {
  it('ranks fewer attempts first', () => {
    expect(compareRecords(record(3, 90_000), record(5, 1_000))).toBeLessThan(0);
  });

  it('ranks shorter time first when attempts are equal', () => {
    expect(compareRecords(record(4, 1_000), record(4, 2_000))).toBeLessThan(0);
    expect(compareRecords(record(4, 2_000), record(4, 1_000))).toBeGreaterThan(0);
  });

  it('treats records with equal attempts and time as equal', () => {
    expect(compareRecords(record(4, 1_000, 1), record(4, 1_000, 2))).toBe(0);
  });
});

describe('createRecordFromGame', () => {
  it('returns null while the game is not won', () => {
    expect(createRecordFromGame(createGame(DECIMAL, '1234', 0))).toBeNull();
  });

  it('creates a record with attempts, elapsed time and finish timestamp', () => {
    const playing = applyGuess(createGame(DECIMAL, '1234', 1_000), '5678', 2_000);
    const won = applyGuess(playing, '1234', 6_000);

    expect(createRecordFromGame(won)).toEqual({ attempts: 2, timeMs: 5_000, achievedAt: 6_000 });
  });
});

describe('insertRecord', () => {
  const insertTopThree = insertRecord(3);

  it('is curried by the table size limit', () => {
    expect(typeof insertTopThree).toBe('function');
  });

  it('inserts a record keeping the list sorted', () => {
    const records = Object.freeze([record(2, 10), record(5, 10)]);

    expect(insertTopThree(records, record(3, 10))).toEqual([
      record(2, 10),
      record(3, 10),
      record(5, 10),
    ]);
  });

  it('keeps only the best records up to the limit', () => {
    const records = Object.freeze([record(2, 10), record(3, 10), record(4, 10)]);

    expect(insertTopThree(records, record(1, 10))).toEqual([
      record(1, 10),
      record(2, 10),
      record(3, 10),
    ]);
    expect(insertTopThree(records, record(9, 10))).toEqual(records);
  });

  it('places a new record after an equal existing one', () => {
    const existing = record(3, 100, 1);
    const newer = record(3, 100, 2);

    expect(insertTopThree([existing], newer)).toEqual([existing, newer]);
  });

  it('does not mutate the original list', () => {
    const records = Object.freeze([record(5, 10)]);

    const updated = insertTopThree(records, record(1, 10));

    expect(records).toEqual([record(5, 10)]);
    expect(updated).not.toBe(records);
  });
});

describe('getRecords', () => {
  it('returns an empty list for settings without records', () => {
    expect(getRecords({}, DECIMAL)).toEqual([]);
  });

  it('returns records for the given settings only', () => {
    const table: RecordsTable = { '10:4': [record(3, 10)], '16:4': [record(7, 10)] };

    expect(getRecords(table, HEX)).toEqual([record(7, 10)]);
  });
});

describe('addRecordToTable', () => {
  it('adds a record to the table of its settings', () => {
    const table = addRecordToTable({}, DECIMAL, record(4, 10));

    expect(table).toEqual({ '10:4': [record(4, 10)] });
  });

  it('keeps tables of other settings untouched', () => {
    const table: RecordsTable = Object.freeze({ '16:4': Object.freeze([record(7, 10)]) });

    const updated = addRecordToTable(table, DECIMAL, record(4, 10));

    expect(updated).toEqual({ '16:4': [record(7, 10)], '10:4': [record(4, 10)] });
    expect(updated['16:4']).toBe(table['16:4']);
    expect(table).toEqual({ '16:4': [record(7, 10)] });
  });

  it('limits each table to RECORDS_LIMIT entries by default', () => {
    const fullTable = Array.from({ length: RECORDS_LIMIT + 5 }, (_, index) =>
      record(index + 1, 10),
    ).reduce<RecordsTable>((table, entry) => addRecordToTable(table, DECIMAL, entry), {});

    expect(getRecords(fullTable, DECIMAL)).toHaveLength(RECORDS_LIMIT);
  });
});

describe('parseRecordsTable', () => {
  it('returns an empty table for missing data', () => {
    expect(parseRecordsTable(null)).toEqual({});
  });

  it.each(['not json', '[]', '42', '"text"', 'null'])('returns an empty table for %j', (raw) => {
    expect(parseRecordsTable(raw)).toEqual({});
  });

  it('restores a table that was serialized with JSON.stringify', () => {
    const table = addRecordToTable({}, DECIMAL, record(4, 1_500, 99));

    expect(parseRecordsTable(JSON.stringify(table))).toEqual(table);
  });

  it('drops malformed entries and lists', () => {
    const raw = JSON.stringify({
      '10:4': [record(4, 10), { attempts: 'x', timeMs: 1, achievedAt: 0 }, null],
      '16:4': 'broken',
    });

    expect(parseRecordsTable(raw)).toEqual({ '10:4': [record(4, 10)] });
  });
});
