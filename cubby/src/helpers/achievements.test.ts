import { describe, expect, it } from 'vitest';

import { getAchievementStatuses } from './achievements';
import { AppData } from '../core/types';

type AppDataOverrides = Omit<Partial<AppData>, 'settings'> & {
  settings?: Partial<AppData['settings']>;
};

function buildData(overrides?: AppDataOverrides): AppData {
  const settings = {
    defaultView: 'month' as const,
    targetSavingsRate: 0.15,
    savingsTargetMode: 'rate' as const,
    yearlySavingsGoalAmount: 0,
    incomeAmount: 0,
    incomeFrequency: 'monthly' as const,
    hasCompletedOnboarding: false,
    logoTapCount: 0,
    ...overrides?.settings,
  };

  return {
    goals: [],
    progressEvents: [],
    ...overrides,
    settings,
  };
}

describe('getAchievementStatuses', () => {
  it('unlocks profile-complete when income and target settings are configured', () => {
    const data = buildData({
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 5000,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
      },
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['profile-complete']).toBe(true);
  });

  it('unlocks logo-tap after tapping the app logo', () => {
    const data = buildData({
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.15,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 0,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
        logoTapCount: 1,
      },
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['logo-tap']).toBe(true);
  });

  it('keeps profile-complete locked when income is missing', () => {
    const data = buildData({
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 0,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
      },
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['profile-complete']).toBe(false);
  });

  it('keeps logo-tap locked before any logo taps', () => {
    const statuses = getAchievementStatuses(buildData());
    expect(statuses['logo-tap']).toBe(false);
  });

  it('unlocks first-goal and first-deposit when data exists', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Rainy Day',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 500,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 50,
          eventDate: '2026-01-12T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-01-12T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['first-goal']).toBe(true);
    expect(statuses['first-deposit']).toBe(true);
  });

  it('unlocks progress milestones and first-1000 from totals', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Trip Fund',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: false,
          recurringState: 'month',
          targetAmount: 1000,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 1100,
          eventDate: '2026-03-01T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-03-01T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['quarter-tank']).toBe(true);
    expect(statuses['halfway-there']).toBe(true);
    expect(statuses['goal-crushed']).toBe(true);
    expect(statuses['first-1000']).toBe(true);
  });

  it('unlocks planner from recurring auto-contribution setup', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Brokerage',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 10000,
          autoContributionAmount: 200,
          autoContributionAnchor: '15',
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
        {
          id: 'g2',
          name: 'Emergency Fund',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 4000,
          autoContributionAmount: 100,
          autoContributionAnchor: '03',
          createdAt: '2026-06-01T00:00:00.000Z',
          updatedAt: '2026-06-01T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses.planner).toBe(true);
  });

  it('unlocks goal-builder when 3 goals are created', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Brokerage',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 10000,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
        {
          id: 'g2',
          name: 'Emergency Fund',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 4000,
          createdAt: '2026-06-01T00:00:00.000Z',
          updatedAt: '2026-06-01T00:00:00.000Z',
        },
        {
          id: 'g3',
          name: 'Travel',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: false,
          recurringState: 'month',
          targetAmount: 3000,
          createdAt: '2026-07-01T00:00:00.000Z',
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['goal-builder']).toBe(true);
  });

  it('unlocks activity streak achievements from intentional manual contributions across months', () => {
    const data = buildData({
      progressEvents: [
        {
          id: 'm1',
          goalId: 'g1',
          amount: 20,
          eventDate: '2026-01-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-01-10T00:00:00.000Z',
        },
        {
          id: 'm2',
          goalId: 'g1',
          amount: 20,
          eventDate: '2026-02-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-02-10T00:00:00.000Z',
        },
        {
          id: 'm3',
          goalId: 'g1',
          amount: 20,
          eventDate: '2026-03-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-03-10T00:00:00.000Z',
        },
        {
          id: 'w1',
          goalId: 'g1',
          amount: 20,
          eventDate: '2026-04-01T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-04-01T00:00:00.000Z',
        },
        {
          id: 'w2',
          goalId: 'g1',
          amount: 20,
          eventDate: '2026-04-08T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-04-08T00:00:00.000Z',
        },
        {
          id: 'w3',
          goalId: 'g1',
          amount: 20,
          eventDate: '2026-04-15T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-04-15T00:00:00.000Z',
        },
        {
          id: 'w4',
          goalId: 'g1',
          amount: 20,
          eventDate: '2026-04-22T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-04-22T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['on-a-roll']).toBe(true);
    expect(statuses['weekly-streak']).toBe(true);
  });

  it('unlocks over-target when a goal exceeds 100 percent funded', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'House Fund',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 10000,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 12000,
          eventDate: '2026-05-01T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-05-01T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['over-target']).toBe(true);
  });

  it('unlocks nice when a contribution is exactly $69', () => {
    const data = buildData({
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 69,
          eventDate: '2026-06-01T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-06-01T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses.nice).toBe(true);
  });

  it('keeps nice locked when no contribution is exactly $69', () => {
    const data = buildData({
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 68,
          eventDate: '2026-06-01T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-06-01T00:00:00.000Z',
        },
      ],
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses.nice).toBe(false);
  });

  it('unlocks all-base-achievements when every base achievement is earned', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Primary Goal',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 100,
          autoContributionAmount: 10,
          autoContributionAnchor: '12',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'g2',
          name: 'Goal Two',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 100,
          createdAt: '2026-01-02T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
        {
          id: 'g3',
          name: 'Goal Three',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: false,
          recurringState: 'month',
          targetAmount: 100,
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 1200,
          eventDate: '2026-01-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-01-10T00:00:00.000Z',
        },
        {
          id: 'e2',
          goalId: 'g1',
          amount: 69,
          eventDate: '2026-02-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-02-10T00:00:00.000Z',
        },
        {
          id: 'e3',
          goalId: 'g2',
          amount: 10,
          eventDate: '2026-03-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-03-10T00:00:00.000Z',
        },
      ],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 5000,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
        logoTapCount: 1,
      },
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['all-base-achievements']).toBe(true);
  });

  it('keeps all-base-achievements locked when any base achievement is missing', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Primary Goal',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 100,
          autoContributionAmount: 10,
          autoContributionAnchor: '12',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 30,
          eventDate: '2026-01-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-01-10T00:00:00.000Z',
        },
      ],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 0,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
        logoTapCount: 0,
      },
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['all-base-achievements']).toBe(false);
  });

  it('unlocks all-secret-achievements when every other secret achievement is earned', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Primary Goal',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 100,
          autoContributionAmount: 10,
          autoContributionAnchor: '12',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'g2',
          name: 'Goal Two',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 100,
          createdAt: '2026-01-02T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
        {
          id: 'g3',
          name: 'Goal Three',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: false,
          recurringState: 'month',
          targetAmount: 100,
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 1200,
          eventDate: '2026-01-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-01-10T00:00:00.000Z',
        },
        {
          id: 'e2',
          goalId: 'g1',
          amount: 69,
          eventDate: '2026-02-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-02-10T00:00:00.000Z',
        },
        {
          id: 'e3',
          goalId: 'g2',
          amount: 10,
          eventDate: '2026-03-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-03-10T00:00:00.000Z',
        },
      ],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 5000,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
        logoTapCount: 1,
      },
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['all-secret-achievements']).toBe(true);
  });

  it('keeps all-secret-achievements locked when any secret achievement is missing', () => {
    const data = buildData({
      goals: [
        {
          id: 'g1',
          name: 'Primary Goal',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 100,
          autoContributionAmount: 10,
          autoContributionAnchor: '12',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'g2',
          name: 'Goal Two',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 100,
          createdAt: '2026-01-02T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
        {
          id: 'g3',
          name: 'Goal Three',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: false,
          recurringState: 'month',
          targetAmount: 100,
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'e1',
          goalId: 'g1',
          amount: 1200,
          eventDate: '2026-01-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-01-10T00:00:00.000Z',
        },
        {
          id: 'e2',
          goalId: 'g1',
          amount: 69,
          eventDate: '2026-02-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-02-10T00:00:00.000Z',
        },
        {
          id: 'e3',
          goalId: 'g2',
          amount: 10,
          eventDate: '2026-03-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-03-10T00:00:00.000Z',
        },
      ],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 5000,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
        logoTapCount: 0,
      },
    });

    const statuses = getAchievementStatuses(data);

    expect(statuses['all-secret-achievements']).toBe(false);
  });
});
