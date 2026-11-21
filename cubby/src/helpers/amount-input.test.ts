import { describe, expect, it } from '@jest/globals';

import { parseAmountInput } from './amount-input';
import { formatCurrency } from './formatters';

describe('parseAmountInput', () => {
  it('accepts dollar signs, thousands separators, and cents', () => {
    expect(parseAmountInput('$1,250.50')).toBe(1250.5);
    expect(parseAmountInput(' 40 ')).toBe(40);
  });

  it('reads a comma followed by one or two digits as a decimal separator', () => {
    expect(parseAmountInput('12,50')).toBe(12.5);
    expect(parseAmountInput('12,5')).toBe(12.5);
    expect(parseAmountInput('1,000')).toBe(1000);
  });

  it('treats empty input as 0 and rejects text', () => {
    expect(parseAmountInput('')).toBe(0);
    expect(parseAmountInput('ten')).toBeNaN();
  });
});

describe('formatCurrency', () => {
  it('omits cents for whole amounts and keeps them otherwise', () => {
    expect(formatCurrency(1200)).toBe('$1,200');
    expect(formatCurrency(12.5)).toBe('$12.50');
    expect(formatCurrency(0.1 + 0.2)).toBe('$0.30');
  });
});
