import { parseRecordsTable } from '../core/records.js';
const STORAGE_KEY = 'bulls-and-cows:records';
const getStorage = () => {
    try {
        return window.localStorage;
    }
    catch {
        return null;
    }
};
export const loadRecords = (storage = getStorage()) => {
    try {
        return parseRecordsTable(storage?.getItem(STORAGE_KEY) ?? null);
    }
    catch {
        return {};
    }
};
export const saveRecords = (table, storage = getStorage()) => {
    try {
        storage?.setItem(STORAGE_KEY, JSON.stringify(table));
    }
    catch {
        // Storage can be full or blocked; the game keeps working without persistence.
    }
};
//# sourceMappingURL=records-storage.js.map