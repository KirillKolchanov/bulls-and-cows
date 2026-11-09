import { getAttemptsCount, getElapsedMs } from './game.js';
export const RECORDS_LIMIT = 10;
export const getRecordsKey = (settings) => `${String(settings.base)}:${String(settings.length)}`;
export const compareRecords = (first, second) => first.attempts - second.attempts || first.timeMs - second.timeMs;
export const createRecordFromGame = (state) => state.status === 'won' && state.finishedAt !== null
    ? {
        attempts: getAttemptsCount(state),
        timeMs: getElapsedMs(state, state.finishedAt),
        achievedAt: state.finishedAt,
    }
    : null;
export const insertRecord = (limit) => (records, entry) => [...records, entry].sort(compareRecords).slice(0, limit);
export const getRecords = (table, settings) => table[getRecordsKey(settings)] ?? [];
export const addRecordToTable = (table, settings, entry, limit = RECORDS_LIMIT) => ({
    ...table,
    [getRecordsKey(settings)]: insertRecord(limit)(getRecords(table, settings), entry),
});
const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonNegativeNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isRecordEntry = (value) => isPlainObject(value) &&
    isNonNegativeNumber(value.attempts) &&
    isNonNegativeNumber(value.timeMs) &&
    isNonNegativeNumber(value.achievedAt);
const safeJsonParse = (raw) => {
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
export const parseRecordsTable = (raw) => {
    const parsed = raw === null ? null : safeJsonParse(raw);
    if (!isPlainObject(parsed)) {
        return {};
    }
    return Object.fromEntries(Object.entries(parsed)
        .filter((pair) => Array.isArray(pair[1]))
        .map(([key, entries]) => [key, entries.filter(isRecordEntry)]));
};
//# sourceMappingURL=records.js.map