import { describe, expect, it } from '@jest/globals';

import { formatAccountTypeLabel } from './helpers/utils';

describe('formatAccountTypeLabel', () => {
  it('returns an empty string when no account type is provided', () => {
    expect(formatAccountTypeLabel()).toBe('');
  });
});
