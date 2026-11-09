import { countPossibleSecrets } from '../../core/combinatorics.js';
import { BASE_OPTIONS, SECRET_LENGTHS, isLengthAvailable } from '../../core/settings.js';
import type { GameSettings } from '../../core/types.js';
import { el } from '../dom.js';
import { getDigitRangeLabel } from './labels.js';

export interface SettingsViewOptions {
  readonly settings: GameSettings;
  readonly locked: boolean;
  readonly onChange: (settings: GameSettings) => void;
}

interface OptionProps {
  readonly name: string;
  readonly value: string;
  readonly label: string;
  readonly hint: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

const renderOption = (props: OptionProps): HTMLLabelElement => {
  const input = el('input', {
    className: 'option__input',
    attrs: {
      type: 'radio',
      name: props.name,
      value: props.value,
      checked: props.checked,
      disabled: props.disabled,
    },
  });
  input.addEventListener('change', props.onSelect);

  return el('label', { className: 'option', attrs: { title: props.hint } }, [
    input,
    el('span', { className: 'option__label', text: props.label }),
  ]);
};

const renderGroup = (title: string, options: readonly HTMLElement[]): HTMLElement =>
  el('div', { className: 'settings__group', attrs: { role: 'radiogroup', 'aria-label': title } }, [
    el('span', { className: 'settings__title', text: title }),
    el('div', { className: 'options' }, options),
  ]);

export const renderSettings = ({
  settings,
  locked,
  onChange,
}: SettingsViewOptions): HTMLElement => {
  const baseOptions = BASE_OPTIONS.map(({ base, label }) =>
    renderOption({
      name: 'base',
      value: String(base),
      label,
      hint: `Base ${String(base)}, digits ${getDigitRangeLabel(base)}`,
      checked: settings.base === base,
      disabled: false,
      onSelect: () => {
        onChange({ ...settings, base });
      },
    }),
  );

  const lengthOptions = SECRET_LENGTHS.map((length) => {
    const available = isLengthAvailable(length, settings.base);

    return renderOption({
      name: 'length',
      value: String(length),
      label: String(length),
      hint: available
        ? `${String(length)} digits`
        : `Not enough unique digits in base ${String(settings.base)}`,
      checked: settings.length === length,
      disabled: !available,
      onSelect: () => {
        onChange({ ...settings, length });
      },
    });
  });

  const possibleSecrets = countPossibleSecrets(settings.length, settings.base);

  return el('fieldset', { className: 'card settings', attrs: { disabled: locked } }, [
    el('legend', { className: 'card__title', text: 'Settings' }),
    renderGroup('Number system', baseOptions),
    renderGroup('Secret length', lengthOptions),
    el('p', {
      className: 'settings__note',
      text: locked
        ? 'Settings are locked until you start a new game.'
        : `${possibleSecrets.toLocaleString('en-US')} possible secrets with digits ${getDigitRangeLabel(settings.base)}.`,
    }),
  ]);
};
