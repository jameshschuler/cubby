/**
 * Parses a typed money amount, accepting a leading "$" and thousands separators ("$1,250.50").
 * A single comma followed by one or two digits is a decimal separator ("12,50"), which is what
 * the decimal keypad types in comma-decimal locales.
 * Like `Number`, an empty string is 0 and anything unparseable is NaN.
 */
export function parseAmountInput(value: string): number {
  const trimmed = value.trim().replace(/^\$/, '');
  const normalized = /^-?\d*,\d{1,2}$/.test(trimmed)
    ? trimmed.replace(',', '.')
    : trimmed.replace(/,/g, '');

  return Number(normalized);
}
