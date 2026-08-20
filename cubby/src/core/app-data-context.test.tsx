import { useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppDataProvider, useAppData } from './app-data-context';
import { defaultData } from './storage';

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));

vi.mock('expo-file-system/legacy', () => ({
  documentDirectory: '',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: vi.fn(),
}));

vi.mock('expo-sharing', () => ({
  shareAsync: vi.fn(),
}));

const { mockLoadAppData, mockSaveAppData } = vi.hoisted(() => ({
  mockLoadAppData: vi.fn(),
  mockSaveAppData: vi.fn(),
}));

vi.mock('./storage', async () => {
  const actual = await vi.importActual<any>('./storage');

  return {
    ...actual,
    loadAppData: mockLoadAppData,
    saveAppData: mockSaveAppData,
  };
});

function TestProbe({ onReady }: { onReady: (value: any) => void }) {
  const value = useAppData();

  useEffect(() => {
    onReady(value);
  }, [onReady, value]);

  return null;
}

async function renderWithAppData() {
  let renderer: any;
  const contextRef = { current: null as any };

  await act(async () => {
    renderer = create(
      <AppDataProvider>
        <TestProbe
          onReady={(value) => {
            contextRef.current = value;
          }}
        />
      </AppDataProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  return { renderer: renderer!, contextRef };
}

describe('AppDataProvider', () => {
  beforeEach(() => {
    mockLoadAppData.mockResolvedValue(defaultData);
    mockSaveAppData.mockResolvedValue(undefined);
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
});
