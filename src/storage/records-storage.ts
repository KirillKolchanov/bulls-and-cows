import { parseRecordsTable } from '../core/records.js';
import type { RecordsTable } from '../core/types.js';

const STORAGE_KEY = 'bulls-and-cows:records';

const getStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const loadRecords = (storage: Storage | null = getStorage()): RecordsTable => {
  try {
    return parseRecordsTable(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return {};
  }
};

export const saveRecords = (table: RecordsTable, storage: Storage | null = getStorage()): void => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(table));
  } catch {
    // Storage can be full or blocked; the game keeps working without persistence.
  }
};
