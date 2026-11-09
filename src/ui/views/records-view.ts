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

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const renderRow = (entry: RecordEntry, index: number, latest: RecordEntry | null): HTMLElement =>
  el('tr', { className: isSameRecord(entry, latest) ? 'records__row--latest' : '' }, [
    el('td', { text: String(index + 1) }),
    el('td', { text: String(entry.attempts) }),
    el('td', { text: formatDuration(entry.timeMs) }),
    el('td', { text: formatDate(entry.achievedAt) }),
  ]);

const renderTable = (entries: readonly RecordEntry[], latest: RecordEntry | null): HTMLElement =>
  el('table', { className: 'table' }, [
    el('thead', {}, [
      el('tr', {}, [
        el('th', { text: '#' }),
        el('th', { text: 'Attempts' }),
        el('th', { text: 'Time' }),
        el('th', { text: 'Date' }),
      ]),
    ]),
    el(
      'tbody',
      {},
      entries.map((entry, index) => renderRow(entry, index, latest)),
    ),
  ]);

export const renderRecords = ({
  records,
  settings,
  latestRecord,
}: RecordsViewOptions): HTMLElement => {
  const entries = getRecords(records, settings);

  return el('section', { className: 'card records' }, [
    el('h2', { className: 'card__title' }, [
      'Best results ',
      el('span', { className: 'badge', text: getSettingsLabel(settings) }),
    ]),
    entries.length === 0
      ? el('p', { className: 'empty', text: 'No results for these settings yet.' })
      : renderTable(entries, latestRecord),
  ]);
};
