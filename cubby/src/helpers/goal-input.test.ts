import { describe, expect, it } from '@jest/globals';

import {
  getCadenceForRecurringState,
  sanitizeAutoContributionAmount,
  sanitizeAutoContributionAnchor,
} from './goal-input';

describe('getCadenceForRecurringState', () => {
  it('maps recurring states to saved cadence values', () => {
    expect(getCadenceForRecurringState('week')).toBe('weekly');
    expect(getCadenceForRecurringState('month')).toBe('monthly');
    expect(getCadenceForRecurringState('year')).toBe('yearly');
  });
});

describe('sanitizeAutoContributionAmount', () => {
  it('drops automatic contributions for one-time goals', () => {
    expect(sanitizeAutoContributionAmount(false, 50)).toBeUndefined();
  });

  it('drops non-finite and non-positive automatic contribution amounts', () => {
    expect(sanitizeAutoContributionAmount(true, Number.NaN)).toBeUndefined();
    expect(sanitizeAutoContributionAmount(true, Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(sanitizeAutoContributionAmount(true, 0)).toBeUndefined();
    expect(sanitizeAutoContributionAmount(true, -5)).toBeUndefined();
  });

  it('preserves valid recurring automatic contribution amounts', () => {
    expect(sanitizeAutoContributionAmount(true, 75)).toBe(75);
  });
});

describe('sanitizeAutoContributionAnchor', () => {
  it('drops anchors for one-time goals', () => {
    expect(sanitizeAutoContributionAnchor(false, '15')).toBeUndefined();
  });

  it('trims valid recurring anchors and removes empty ones', () => {
    expect(sanitizeAutoContributionAnchor(true, ' 06-15 ')).toBe('06-15');
    expect(sanitizeAutoContributionAnchor(true, '   ')).toBeUndefined();
  });
});
