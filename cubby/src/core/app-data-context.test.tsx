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
const mockClearAppData = jest.fn<() => Promise<void>>();
const mockShareAsync = jest.fn<(uri: string, options: object) => Promise<void>>();
const mockFileWrite = jest.fn<(uri: string, content: string) => void>();
const mockFileDelete = jest.fn<(uri: string) => void>();
const mockDirectoryFiles: Record<string, string[]> = {};

jest.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    name: string;
    exists = true;

    constructor(directory: { uri: string }, name: string) {
      this.uri = `${directory.uri}${name}`;
      this.name = name;
    }

    write(content: string) {
      mockFileWrite(this.uri, content);
    }

    delete() {
      mockFileDelete(this.uri);
    }
  }

  const createDirectory = (uri: string) => ({
    uri,
    exists: true,
    list: () => (mockDirectoryFiles[uri] ?? []).map((name) => new MockFile({ uri }, name)),
  });

  return {
    File: MockFile,
    Paths: { cache: createDirectory('cache/'), document: createDirectory('document/') },
  };
});

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
  get clearAppData() {
    return mockClearAppData;
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
    mockClearAppData.mockResolvedValue(undefined);
    mockShareAsync.mockResolvedValue(undefined);
    for (const uri of Object.keys(mockDirectoryFiles)) {
      delete mockDirectoryFiles[uri];
    }
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

      expect(mockFileWrite).toHaveBeenCalledWith(
        'cache/cubby-export-2026-08-26.json',
        JSON.stringify(mockDefaultData, null, 2)
      );
      expect(mockShareAsync).toHaveBeenCalledWith('cache/cubby-export-2026-08-26.json', {
        mimeType: 'application/json',
        dialogTitle: 'Export Cubby data',
      });
      expect(mockFileDelete).toHaveBeenCalledWith('cache/cubby-export-2026-08-26.json');
    } finally {
      jest.useRealTimers();
    }
  });

  it('resets the local dataset and clears persisted data', async () => {
    const { contextRef } = await renderWithAppData();

    act(() => {
      contextRef.current!.addGoal({
        name: 'Emergency fund',
        nickname: '',
        origin: 'Salary',
        targetAmount: 2500,
        isRecurring: false,
        recurringState: 'none',
      });
    });
    expect(contextRef.current!.data.goals).toHaveLength(1);

    await act(async () => {
      await contextRef.current!.resetAppData();
    });

    expect(mockClearAppData).toHaveBeenCalledTimes(1);
    expect(contextRef.current!.data).toEqual(mockDefaultData);
  });

  it('deletes leftover export files when resetting', async () => {
    mockDirectoryFiles['document/'] = ['cubby-export-2026-08-01.json', 'other.json'];
    mockDirectoryFiles['cache/'] = ['cubby-export-2026-09-01.json'];
    const { contextRef } = await renderWithAppData();

    await act(async () => {
      await contextRef.current!.resetAppData();
    });

    expect(mockFileDelete.mock.calls.map(([uri]) => uri).sort()).toEqual([
      'cache/cubby-export-2026-09-01.json',
      'document/cubby-export-2026-08-01.json',
    ]);
  });

  it('never saves over stored data when loading fails', async () => {
    mockLoadAppData.mockRejectedValue(new Error('storage unavailable'));
    const { contextRef } = await renderWithAppData();

    expect(contextRef.current!.isReady).toBe(true);

    act(() => {
      contextRef.current!.addGoal({
        name: 'Emergency fund',
        nickname: '',
        origin: '',
        targetAmount: 2500,
        isRecurring: false,
        recurringState: 'month',
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSaveAppData).not.toHaveBeenCalled();
  });

  it('restarts the contribution schedule only when contribution settings change', async () => {
    const { contextRef } = await renderWithAppData();
    const goalInput = {
      name: 'Emergency fund',
      nickname: '',
      origin: '',
      targetAmount: 2500,
      autoContributionAmount: 100,
      autoContributionAnchor: '1',
      isRecurring: true,
      recurringState: 'month' as const,
    };

    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
      act(() => {
        contextRef.current!.addGoal(goalInput);
      });
      const goalId = contextRef.current!.data.goals[0].id;
      expect(contextRef.current!.data.goals[0].autoContributionStartAt).toBe(
        '2026-01-10T12:00:00.000Z'
      );

      jest.setSystemTime(new Date('2026-02-10T12:00:00.000Z'));
      act(() => {
        contextRef.current!.updateGoal(goalId, { ...goalInput, name: 'Rainy day fund' });
      });
      expect(contextRef.current!.data.goals[0].autoContributionStartAt).toBe(
        '2026-01-10T12:00:00.000Z'
      );

      act(() => {
        contextRef.current!.updateGoal(goalId, { ...goalInput, autoContributionAmount: 250 });
      });
      expect(contextRef.current!.data.goals[0].autoContributionStartAt).toBe(
        '2026-02-10T12:00:00.000Z'
      );
    } finally {
      jest.useRealTimers();
    }
  });
});
