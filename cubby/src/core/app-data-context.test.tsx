import { useEffect } from 'react';
import { act, render as create } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AppDataProvider, useAppData } from './app-data-context';
import { AppData } from './types';

const mockDefaultData = {
  goals: [],
  progressEvents: [],
  settings: {
    defaultView: 'month' as const,
    targetSavingsRate: 0.15,
    savingsTargetMode: 'rate' as const,
    yearlySavingsGoalAmount: 0,
    incomeAmount: 0,
    incomeFrequency: 'monthly' as const,
    hasCompletedOnboarding: false,
    logoTapCount: 0,
  },
};

const mockLoadAppData = jest.fn<() => Promise<AppData>>();
const mockSaveAppData = jest.fn<() => Promise<void>>();
const mockShareAsync = jest.fn<() => Promise<void>>();
const mockWriteAsStringAsync = jest.fn<() => Promise<void>>();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: (...args: Parameters<typeof mockWriteAsStringAsync>) =>
    mockWriteAsStringAsync(...args),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: (...args: Parameters<typeof mockShareAsync>) => mockShareAsync(...args),
}));

jest.mock('./storage', () => ({
  get defaultData() {
    return mockDefaultData;
  },
  get loadAppData() {
    return mockLoadAppData;
  },
  get saveAppData() {
    return mockSaveAppData;
  },
}));

function TestProbe({ onReady }: { onReady: (value: any) => void }) {
  const value = useAppData();

  useEffect(() => {
    onReady(value);
  }, [onReady, value]);

  return null;
}

async function renderWithAppData() {
  const contextRef = { current: null as any };

  create(
    <AppDataProvider>
      <TestProbe
        onReady={(value) => {
          contextRef.current = value;
        }}
      />
    </AppDataProvider>
  );

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  return { contextRef };
}

describe('AppDataProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAppData.mockResolvedValue(mockDefaultData);
    mockSaveAppData.mockResolvedValue(undefined);
    mockWriteAsStringAsync.mockResolvedValue(undefined);
    mockShareAsync.mockResolvedValue(undefined);
  });

  it('supports creating, editing, deleting a goal, and updating a contribution', async () => {
    const { contextRef } = await renderWithAppData();
    const getContext = () => contextRef.current!;

    expect(getContext().isReady).toBe(true);

    act(() => {
      getContext().addGoal({
        name: 'Emergency fund',
        nickname: 'Rainy day',
        origin: 'Salary',
        category: 'short-term savings',
        accountType: 'hysa',
        targetAmount: 2500,
        autoContributionAmount: 100,
        autoContributionAnchor: '15',
        isRecurring: true,
        recurringState: 'month',
      });
    });

    expect(getContext().data.goals).toHaveLength(1);
    const goalId = getContext().data.goals[0].id;
    expect(getContext().data.goals[0].name).toBe('Emergency fund');

    act(() => {
      getContext().updateGoal(goalId, {
        name: 'Vacation fund',
        nickname: 'Holiday',
        origin: 'Bonus',
        category: 'other',
        accountType: 'hsa',
        targetAmount: 3000,
        autoContributionAmount: 200,
        autoContributionAnchor: '20',
        isRecurring: true,
        recurringState: 'month',
      });
    });

    expect(getContext().data.goals[0].name).toBe('Vacation fund');
    expect(getContext().data.goals[0].targetAmount).toBe(3000);

    act(() => {
      getContext().addProgress(goalId, 120, 'one-time', new Date('2026-07-10'));
    });

    const manualEventsAfterAdd = getContext().data.progressEvents.filter(
      (event: { source: string }) => event.source === 'manual'
    );
    expect(manualEventsAfterAdd).toHaveLength(1);
    expect(manualEventsAfterAdd[0].amount).toBe(120);

    act(() => {
      getContext().replaceGoalProgress(goalId, 180, 'one-time', new Date('2026-07-10'));
    });

    const manualEventsAfterReplace = getContext().data.progressEvents.filter(
      (event: { source: string }) => event.source === 'manual'
    );
    expect(manualEventsAfterReplace).toHaveLength(1);
    expect(manualEventsAfterReplace[0].amount).toBe(180);

    act(() => {
      getContext().deleteGoal(goalId);
    });

    expect(getContext().data.goals).toHaveLength(0);
    expect(getContext().data.progressEvents).toHaveLength(0);
  });

  it('exports the complete local dataset as JSON through the system share sheet', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-26T12:00:00.000Z'));

    try {
      const { contextRef } = await renderWithAppData();

      await act(async () => {
        await contextRef.current!.exportJson();
      });

      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
        'cubby-export-2026-08-26.json',
        JSON.stringify(mockDefaultData, null, 2),
        { encoding: 'utf8' }
      );
      expect(mockShareAsync).toHaveBeenCalledWith('cubby-export-2026-08-26.json', {
        mimeType: 'application/json',
        dialogTitle: 'Export Cubby data',
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
