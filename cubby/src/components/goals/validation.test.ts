import { describe, expect, it } from 'vitest';

import { validateAutomaticContribution, validateGoalBasics } from './validation';

describe('validateGoalBasics', () => {
  it('requires a non-empty trimmed name', () => {
    expect(validateGoalBasics({ name: '   ', targetAmount: 100 })).toEqual({
      name: 'Account name is required.',
    });
  });

  it('rejects non-finite and non-positive target amounts', () => {
    expect(validateGoalBasics({ name: 'Emergency Fund', targetAmount: 'Infinity' })).toEqual({
      targetAmount: 'Target amount must be greater than 0.',
    });
    expect(validateGoalBasics({ name: 'Emergency Fund', targetAmount: '0' })).toEqual({
      targetAmount: 'Target amount must be greater than 0.',
    });
  });

  it('accepts trimmed numeric input', () => {
    expect(validateGoalBasics({ name: 'Emergency Fund', targetAmount: ' 2500 ' })).toEqual({});
  });
});

describe('validateAutomaticContribution', () => {
  it('skips validation for one-time goals or disabled automatic contributions', () => {
    expect(
      validateAutomaticContribution({
        isRecurring: false,
        hasAutomaticContribution: true,
        recurringState: 'month',
        autoContributionAmount: '',
        autoContributionAnchor: '',
      })
    ).toEqual({});
  });

  it('rejects invalid automatic contribution amounts', () => {
    expect(
      validateAutomaticContribution({
        isRecurring: true,
        hasAutomaticContribution: true,
        recurringState: 'month',
        autoContributionAmount: 'Infinity',
        autoContributionAnchor: '12',
      })
    ).toEqual({
      autoContributionAmount: 'Automatic monthly contribution must be greater than 0.',
    });
  });

  it('rejects malformed contribution anchors', () => {
    expect(
      validateAutomaticContribution({
        isRecurring: true,
        hasAutomaticContribution: true,
        recurringState: 'year',
        autoContributionAmount: '50',
        autoContributionAnchor: 'abc',
      })
    ).toEqual({
      autoContributionAnchor: 'Choose a valid contribution timing for this frequency.',
    });
  });

  it('accepts valid recurring contribution inputs', () => {
    expect(
      validateAutomaticContribution({
        isRecurring: true,
        hasAutomaticContribution: true,
        recurringState: 'week',
        autoContributionAmount: '75',
        autoContributionAnchor: '5',
      })
    ).toEqual({});
  });
});
