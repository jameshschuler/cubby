import { useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';

import { parseAmountInput } from '../../helpers/amount-input';

interface AmountInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  value: number | undefined;
  /** Receives undefined when the field is cleared and 0 when the text isn't a valid amount. */
  onChangeValue: (value: number | undefined) => void;
}

function formatValue(value: number | undefined) {
  return value ? String(value) : '';
}

function parseText(text: string) {
  if (!text.trim()) {
    return undefined;
  }

  const parsed = parseAmountInput(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * A numeric field for a number held in state. It keeps the typed text, so partial input such as
 * "12." or "1,0" isn't rewritten while the user is still typing.
 */
export default function AmountInput({ value, onChangeValue, ...props }: AmountInputProps) {
  const [text, setText] = useState(() => formatValue(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // Only replace the text when the value changes from outside this field.
  if (value !== syncedValue) {
    setSyncedValue(value);
    const textValue = parseText(text);
    // Callers pass undefined for amounts they don't keep (such as 0 or negatives); only a positive
    // amount in the field means the value was cleared from outside.
    const isClearedFromOutside = value === undefined && (textValue ?? 0) > 0;
    if (isClearedFromOutside || (value !== undefined && textValue !== value)) {
      setText(formatValue(value));
    }
  }

  return (
    <TextInput
      {...props}
      value={text}
      onChangeText={(nextText) => {
        const nextValue = parseText(nextText);
        setText(nextText);
        setSyncedValue(nextValue);
        onChangeValue(nextValue);
      }}
      keyboardType="decimal-pad"
    />
  );
}
