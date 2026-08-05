import { describe, expect, it } from 'vitest';

import { shouldShowOnboarding } from './onboarding';
import { AppData } from './types';

describe('shouldShowOnboarding', () => {
  const baseData: AppData = {
    goals: [],
    progressEvents: [],
    settings: {
      defaultView: 'month',
      targetSavingsRate: 0.15,
      savingsTargetMode: 'rate',
      yearlySavingsGoalAmount: 0,
      incomeAmount: 0,
      incomeFrequency: 'monthly',
      incomeIsGross: true,
      hasCompletedOnboarding: false,
      useSeededDemoData: false,
    },
  };

  it('shows onboarding for a first-time user with no goals', () => {
    expect(shouldShowOnboarding(baseData)).toBe(true);
  });

  it('hides onboarding once the user has completed it or already has goals', () => {
    expect(
      shouldShowOnboarding({
        ...baseData,
        goals: [
          {
            id: 'goal-1',
            name: 'Test',
            nickname: '',
            origin: '',
            cadence: 'monthly',
            isRecurring: true,
            recurringState: 'month',
            targetAmount: 100,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
      })
    ).toBe(false);
    expect(
      shouldShowOnboarding({
        ...baseData,
        settings: { ...baseData.settings, hasCompletedOnboarding: true },
      })
    ).toBe(false);
  });
});
