import { formatDuration } from '../../core/format.js';
import { getRecords } from '../../core/records.js';
import type { GameSettings, RecordEntry, RecordsTable } from '../../core/types.js';
import { el } from '../dom.js';
import { getSettingsLabel } from './labels.js';

export interface RecordsViewOptions {
  readonly records: RecordsTable;
  readonly settings: GameSettings;
  readonly latestRecord: RecordEntry | null;
}

const isSameRecord = (first: RecordEntry, second: RecordEntry | null): boolean =>
  second !== null &&
  first.achievedAt === second.achievedAt &&
  first.attempts === second.attempts &&
  first.timeMs === second.timeMs;

const renderRow = (entry: RecordEntry, index: number, latest: RecordEntry | null): HTMLElement =>
  el('tr', { className: isSameRecord(entry, latest) ? 'highlight' : '' }, [
    el('td', { text: String(index + 1) }),
    el('td', { text: String(entry.attempts) }),
    el('td', { text: formatDuration(entry.timeMs) }),
    el('td', { text: new Date(entry.achievedAt).toLocaleDateString() }),
  ]);

const renderTable = (entries: readonly RecordEntry[], latest: RecordEntry | null): HTMLElement =>
  el('table', {}, [
    el('tr', {}, [
      el('th', { text: '#' }),
      el('th', { text: 'Attempts' }),
      el('th', { text: 'Time' }),
      el('th', { text: 'Date' }),
    ]),
    ...entries.map((entry, index) => renderRow(entry, index, latest)),
  ]);

export const renderRecords = ({
  records,
  settings,
  latestRecord,
}: RecordsViewOptions): HTMLElement => {
  const entries = getRecords(records, settings);

  return el('section', {}, [
    el('h2', { text: `Records (${getSettingsLabel(settings)})` }),
    entries.length === 0
      ? el('p', { text: 'No records yet.' })
      : renderTable(entries, latestRecord),
  ]);
};
