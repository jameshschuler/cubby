import { describe, expect, it } from '@jest/globals';

import {
  getIncomeAmountForSelectedYear,
  getSavingsRateForSelectedYear,
  getSavingsRateForView,
  getTargetSavedAmountForView,
} from './calculations';
import { Goal, IncomeFrequency, SavingsTargetMode } from '../core/types';

function createGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    name: 'Emergency fund',
    nickname: '',
    origin: '',
    cadence: 'monthly',
    isRecurring: true,
    recurringState: 'month',
    targetAmount: 1000,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getTargetSavedAmountForView', () => {
  it('uses the savings rate for recurring views when rate mode is selected', () => {
    const goals = [createGoal()];

    const amount = getTargetSavedAmountForView(
      {
        incomeAmount: 5000,
        incomeFrequency: 'monthly' as IncomeFrequency,
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate' as SavingsTargetMode,
        yearlySavingsGoalAmount: 50000,
      },
      'month',
      goals
    );

    expect(amount).toBe(1000);
  });

  it('uses the yearly savings goal for recurring views when yearly-goal mode is selected', () => {
    const goals = [createGoal()];

    const amount = getTargetSavedAmountForView(
      {
        incomeAmount: 5000,
        incomeFrequency: 'monthly' as IncomeFrequency,
        targetSavingsRate: 0.2,
        savingsTargetMode: 'yearly-goal' as SavingsTargetMode,
        yearlySavingsGoalAmount: 50000,
      },
      'month',
      goals
    );

    expect(amount).toBe(4166.666666666667);
  });

  it('returns zero for yearly-goal mode when the configured goal is not positive', () => {
    const goals = [createGoal()];

    const amount = getTargetSavedAmountForView(
      {
        incomeAmount: 5000,
        incomeFrequency: 'monthly' as IncomeFrequency,
        targetSavingsRate: 0.2,
        savingsTargetMode: 'yearly-goal' as SavingsTargetMode,
        yearlySavingsGoalAmount: 0,
      },
      'month',
      goals
    );

    expect(amount).toBe(0);
  });

  it('sums visible goal targets for one-time view', () => {
    const goals = [createGoal(), createGoal({ id: 'goal-2', targetAmount: 2500 })];

    const amount = getTargetSavedAmountForView(
      {
        incomeAmount: 5000,
        incomeFrequency: 'monthly' as IncomeFrequency,
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate' as SavingsTargetMode,
        yearlySavingsGoalAmount: 50000,
      },
      'one-time',
      goals
    );

    expect(amount).toBe(3500);
  });
});

describe('getSavingsRateForView', () => {
  it('returns null for one-time view and non-positive income', () => {
    expect(getSavingsRateForView(500, 4000, 'monthly', 'one-time')).toBeNull();
    expect(getSavingsRateForView(500, 0, 'monthly', 'month')).toBeNull();
  });

  it('uses the income amount converted into the active view', () => {
    const rate = getSavingsRateForView(1000, 52000, 'yearly', 'month');

    expect(rate).toBeCloseTo(1000 / (52000 / 12));
  });
});

describe('getIncomeAmountForSelectedYear', () => {
  it('limits the current year to the elapsed months in scope', () => {
    const amount = getIncomeAmountForSelectedYear(
      6000,
      'monthly',
      2026,
      new Date('2026-08-04T00:00:00.000Z')
    );

    expect(amount).toBe(48000);
  });

  it('returns the full year for past years', () => {
    const amount = getIncomeAmountForSelectedYear(
      120000,
      'yearly',
      2025,
      new Date('2026-08-04T00:00:00.000Z')
    );

    expect(amount).toBe(120000);
  });

  it('returns null when selected year or income is unavailable', () => {
    expect(getIncomeAmountForSelectedYear(0, 'monthly', 2026)).toBeNull();
    expect(getIncomeAmountForSelectedYear(5000, 'monthly', null)).toBeNull();
  });
});

describe('getSavingsRateForSelectedYear', () => {
  it('returns null when selected year income cannot be derived', () => {
    expect(getSavingsRateForSelectedYear(1000, 0, 'monthly', 2026)).toBeNull();
  });

  it('calculates the yearly savings rate from annual savings and income', () => {
    const savingsRate = getSavingsRateForSelectedYear(
      25000,
      200000,
      'yearly',
      2026,
      new Date('2026-08-04T00:00:00.000Z')
    );

    expect(savingsRate).toBe(0.1875);
  });
});
