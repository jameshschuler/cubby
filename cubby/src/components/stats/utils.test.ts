import { describe, expect, it } from 'vitest';

import { formatAccountTypeLabel } from './utils';

describe('formatAccountTypeLabel', () => {
  it('returns an empty string when no account type is provided', () => {
    expect(formatAccountTypeLabel()).toBe('');
  });
});
