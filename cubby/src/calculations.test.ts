import { describe, expect, it } from 'vitest';

import { getSavingsRateForSelectedYear, getTargetSavedAmountForView } from './calculations';
import { Goal, IncomeFrequency, SavingsTargetMode } from './types';

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
