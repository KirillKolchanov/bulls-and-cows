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
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

const renderOption = (props: OptionProps): HTMLLabelElement => {
  const input = el('input', {
    attrs: {
      type: 'radio',
      name: props.name,
      value: props.value,
      checked: props.checked,
      disabled: props.disabled,
    },
  });
  input.addEventListener('change', props.onSelect);

  return el('label', { className: props.disabled ? 'unavailable' : '' }, [input, props.label]);
};

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
      checked: settings.base === base,
      disabled: false,
      onSelect: () => {
        onChange({ ...settings, base });
      },
    }),
  );

  const lengthOptions = SECRET_LENGTHS.map((length) =>
    renderOption({
      name: 'length',
      value: String(length),
      label: String(length),
      checked: settings.length === length,
      disabled: !isLengthAvailable(length, settings.base),
      onSelect: () => {
        onChange({ ...settings, length });
      },
    }),
  );

  return el('fieldset', { attrs: { disabled: locked } }, [
    el('legend', { text: 'Settings' }),
    el('p', {}, ['Number system: ', ...baseOptions]),
    el('p', {}, ['Length: ', ...lengthOptions]),
    el('p', {
      text: locked
        ? 'Settings are locked until a new game.'
        : `Digits ${getDigitRangeLabel(settings.base)}, possible secrets: ${String(countPossibleSecrets(settings.length, settings.base))}`,
    }),
  ]);
};
