import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultData, loadAppData, saveAppData } from './storage';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const asyncStorageMock = vi.mocked(AsyncStorage);

describe('loadAppData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default data when storage is empty', async () => {
    asyncStorageMock.getItem.mockResolvedValueOnce(null);

    await expect(loadAppData()).resolves.toEqual(defaultData);
  });

  it('normalizes saved goals, progress events, and settings', async () => {
    asyncStorageMock.getItem.mockResolvedValueOnce(
      JSON.stringify({
        goals: [
          {
            id: 'goal-1',
            name: 'Brokerage',
            isRecurring: true,
            recurringState: 'month',
            targetAmount: 12000,
            autoContributionAmount: -10,
            autoContributionAnchor: ' 15 ',
          },
        ],
        progressEvents: [
          {
            id: 'event-1',
            goalId: 'goal-1',
            amount: '500',
            source: 'automatic',
          },
        ],
        settings: {
          defaultView: 'year',
          targetSavingsRate: 0.25,
          savingsTargetMode: 'yearly-goal',
          yearlySavingsGoalAmount: 24000,
          incomeAmount: 120000,
          incomeFrequency: 'yearly',
          hasCompletedOnboarding: true,
          logoTapCount: 4,
        },
      })
    );

    const data = await loadAppData();

    expect(data.goals[0]).toMatchObject({
      id: 'goal-1',
      name: 'Brokerage',
      autoContributionAmount: undefined,
      autoContributionAnchor: '15',
      targetAmount: 12000,
    });
    expect(data.progressEvents[0]).toMatchObject({
      id: 'event-1',
      goalId: 'goal-1',
      amount: 0,
      source: 'automatic',
    });
    expect(data.settings).toEqual({
      defaultView: 'year',
      targetSavingsRate: 0.25,
      savingsTargetMode: 'yearly-goal',
      yearlySavingsGoalAmount: 24000,
      incomeAmount: 120000,
      incomeFrequency: 'yearly',
      hasCompletedOnboarding: true,
      logoTapCount: 4,
    });
  });

  it('falls back to defaults when stored JSON is invalid', async () => {
    asyncStorageMock.getItem.mockResolvedValueOnce('{bad json');

    await expect(loadAppData()).resolves.toEqual(defaultData);
  });

  it('serializes app data when saving', async () => {
    await saveAppData(defaultData);

    expect(asyncStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
      'cubby.app-data.v1',
      JSON.stringify(defaultData)
    );
  });
});
