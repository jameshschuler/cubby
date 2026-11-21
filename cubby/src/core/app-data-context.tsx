import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import {
  parseAutoContributionAnchor,
  syncAutomaticContributionEvents,
} from '../helpers/automatic-contributions';
import { getEntryDateForView, isInView } from '../helpers/calculations';
import { deleteGoalState } from '../helpers/deleteGoalState';
import {
  getCadenceForRecurringState,
  sanitizeAutoContributionAmount,
  sanitizeAutoContributionAnchor,
} from '../helpers/goal-input';
import { clearAppData, defaultData, loadAppData, saveAppData } from './storage';
import {
  AccountType,
  AppData,
  Goal,
  GoalCategory,
  GoalDisplayFilter,
  IncomeFrequency,
  ProgressEvent,
  RecurringState,
  SavingsTargetMode,
  ViewPeriod,
} from './types';

interface AddGoalInput {
  name: string;
  nickname: string;
  origin: string;
  category?: GoalCategory;
  accountType?: AccountType;
  targetAmount: number;
  autoContributionAmount?: number;
  autoContributionAnchor?: string;
  isRecurring: boolean;
  recurringState: RecurringState;
}

type UpdateGoalInput = AddGoalInput;

interface AppDataContextValue {
  data: AppData;
  isReady: boolean;
  addGoal: (input: AddGoalInput) => void;
  updateGoal: (goalId: string, input: UpdateGoalInput) => void;
  deleteGoal: (goalId: string, removeAssociatedData?: boolean) => void;
  completeOnboarding: () => void;
  addProgress: (
    goalId: string,
    amount: number,
    selectedView: GoalDisplayFilter,
    anchorDate: Date
  ) => void;
  replaceGoalProgress: (
    goalId: string,
    amount: number,
    selectedView: GoalDisplayFilter,
    anchorDate: Date
  ) => void;
  saveTargetRate: (ratio: number) => void;
  saveSavingsTargetSettings: (mode: SavingsTargetMode, yearlyGoalAmount: number) => void;
  saveIncomeSettings: (amount: number, frequency: IncomeFrequency) => void;
  setDefaultView: (view: ViewPeriod) => void;
  registerLogoTap: () => void;
  exportJson: () => Promise<void>;
  resetAppData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const EXPORT_FILE_PREFIX = 'cubby-export-';

function createId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function createManualProgressEvent(
  goalId: string,
  amount: number,
  eventDate: string
): ProgressEvent {
  return {
    id: createId(),
    goalId,
    amount,
    eventDate,
    source: 'manual',
    createdAt: new Date().toISOString(),
  };
}

function hasContributionScheduleChanged(
  goal: Goal,
  isRecurring: boolean,
  recurringState: RecurringState,
  autoContributionAmount?: number,
  autoContributionAnchor?: string
) {
  return (
    goal.isRecurring !== isRecurring ||
    goal.recurringState !== recurringState ||
    goal.autoContributionAmount !== autoContributionAmount ||
    // Older goals may have no stored anchor, which means the default for their frequency.
    parseAutoContributionAnchor(goal.recurringState, goal.autoContributionAnchor)
      .normalizedValue !==
      parseAutoContributionAnchor(recurringState, autoContributionAnchor).normalizedValue
  );
}

function deleteExportFiles() {
  // Earlier versions wrote exports to the document directory and never removed them.
  for (const directory of [Paths.cache, Paths.document]) {
    if (!directory.exists) {
      continue;
    }

    for (const entry of directory.list()) {
      if (entry instanceof File && entry.name.startsWith(EXPORT_FILE_PREFIX)) {
        entry.delete();
      }
    }
  }
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppData>(defaultData);
  const [isReady, setIsReady] = useState(false);
  // Stays false if loading failed, so the empty in-memory state never overwrites saved data.
  const [canPersist, setCanPersist] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const loaded = await loadAppData();
      setData(syncAutomaticContributionEvents(loaded));
      setCanPersist(true);
      setIsReady(true);
    };

    hydrate().catch(() => {
      setIsReady(true);
      Alert.alert(
        'Could not load your data',
        "Cubby couldn't read the data saved on this device, so changes made now won't be saved. Close and reopen Cubby to try again."
      );
    });
  }, []);

  useEffect(() => {
    if (!canPersist) {
      return;
    }

    saveAppData(data).catch(() => {
      // Keep the UI usable if a local save fails.
    });
  }, [data, canPersist]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isReady) {
        setData((current) => syncAutomaticContributionEvents(current));
      }
    });

    return () => subscription.remove();
  }, [isReady]);

  const completeOnboarding = () => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        hasCompletedOnboarding: true,
      },
    }));
  };

  const addGoal = (input: AddGoalInput) => {
    const now = new Date().toISOString();
    const autoContributionAmount = sanitizeAutoContributionAmount(
      input.isRecurring,
      input.autoContributionAmount
    );
    const autoContributionAnchor = sanitizeAutoContributionAnchor(
      input.isRecurring,
      input.autoContributionAnchor
    );

    setData((current) =>
      syncAutomaticContributionEvents({
        ...current,
        settings: {
          ...current.settings,
          hasCompletedOnboarding: true,
        },
        goals: [
          {
            id: createId(),
            name: input.name.trim(),
            nickname: input.nickname.trim(),
            origin: input.origin.trim(),
            category: input.category,
            accountType: input.accountType,
            cadence: input.isRecurring
              ? getCadenceForRecurringState(input.recurringState)
              : 'monthly',
            isRecurring: input.isRecurring,
            recurringState: input.recurringState,
            targetAmount: input.targetAmount,
            autoContributionAmount,
            autoContributionAnchor,
            autoContributionStartAt: now,
            createdAt: now,
            updatedAt: now,
          },
          ...current.goals,
        ],
      })
    );
  };

  const updateGoal = (goalId: string, input: UpdateGoalInput) => {
    const now = new Date().toISOString();
    const autoContributionAmount = sanitizeAutoContributionAmount(
      input.isRecurring,
      input.autoContributionAmount
    );
    const autoContributionAnchor = sanitizeAutoContributionAnchor(
      input.isRecurring,
      input.autoContributionAnchor
    );

    setData((current) =>
      syncAutomaticContributionEvents({
        ...current,
        goals: current.goals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                name: input.name.trim(),
                nickname: input.nickname.trim(),
                origin: input.origin.trim(),
                category: input.category,
                accountType: input.accountType,
                cadence: input.isRecurring
                  ? getCadenceForRecurringState(input.recurringState)
                  : 'monthly',
                isRecurring: input.isRecurring,
                recurringState: input.recurringState,
                targetAmount: input.targetAmount,
                autoContributionAmount,
                autoContributionAnchor,
                autoContributionStartAt: hasContributionScheduleChanged(
                  goal,
                  input.isRecurring,
                  input.recurringState,
                  autoContributionAmount,
                  autoContributionAnchor
                )
                  ? now
                  : goal.autoContributionStartAt,
                updatedAt: now,
              }
            : goal
        ),
      })
    );
  };

  const deleteGoal = (goalId: string, removeAssociatedData = true) => {
    setData((current) => deleteGoalState(current, goalId, removeAssociatedData));
  };

  const addProgress = (
    goalId: string,
    amount: number,
    selectedView: GoalDisplayFilter,
    anchorDate: Date
  ) => {
    const eventDate =
      selectedView === 'one-time'
        ? new Date().toISOString()
        : getEntryDateForView(selectedView, anchorDate);

    setData((current) => ({
      ...current,
      progressEvents: [
        createManualProgressEvent(goalId, amount, eventDate),
        ...current.progressEvents,
      ],
    }));
  };

  const replaceGoalProgress = (
    goalId: string,
    amount: number,
    selectedView: GoalDisplayFilter,
    anchorDate: Date
  ) => {
    const eventDate =
      selectedView === 'one-time'
        ? new Date().toISOString()
        : getEntryDateForView(selectedView, anchorDate);

    setData((current) => {
      const automaticTotalForView =
        selectedView === 'one-time'
          ? 0
          : current.progressEvents
              .filter(
                (event) =>
                  event.goalId === goalId &&
                  event.source === 'automatic' &&
                  isInView(event.eventDate, selectedView, anchorDate)
              )
              .reduce((total, event) => total + event.amount, 0);
      const manualAmount = amount - automaticTotalForView;

      return {
        ...current,
        progressEvents: [
          ...(manualAmount !== 0
            ? [createManualProgressEvent(goalId, manualAmount, eventDate)]
            : []),
          ...current.progressEvents.filter((event) => {
            if (event.goalId !== goalId) {
              return true;
            }

            if (event.source === 'automatic') {
              return true;
            }

            if (selectedView === 'one-time') {
              return false;
            }

            return !isInView(event.eventDate, selectedView, anchorDate);
          }),
        ],
      };
    });
  };

  const saveTargetRate = (ratio: number) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        targetSavingsRate: ratio,
      },
    }));
  };

  const saveSavingsTargetSettings = (mode: SavingsTargetMode, value: number) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        savingsTargetMode: mode,
        yearlySavingsGoalAmount:
          mode === 'yearly-goal' ? value : current.settings.yearlySavingsGoalAmount,
        targetSavingsRate: mode === 'rate' ? value : current.settings.targetSavingsRate,
      },
    }));
  };

  const saveIncomeSettings = (amount: number, frequency: IncomeFrequency) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        incomeAmount: amount,
        incomeFrequency: frequency,
      },
    }));
  };

  const setDefaultView = (view: ViewPeriod) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        defaultView: view,
      },
    }));
  };

  const registerLogoTap = () => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        logoTapCount: current.settings.logoTapCount + 1,
      },
    }));
  };

  const exportJson = async () => {
    deleteExportFiles();
    const file = new File(
      Paths.cache,
      `${EXPORT_FILE_PREFIX}${new Date().toISOString().slice(0, 10)}.json`
    );
    file.write(JSON.stringify(data, null, 2));

    try {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Cubby data',
      });
    } finally {
      // iOS resolves once the share sheet has finished with the file, so it is safe to remove.
      // Android may still be reading it; that copy is removed on the next export or erase.
      if (Platform.OS === 'ios' && file.exists) {
        file.delete();
      }
    }
  };

  const resetAppData = async () => {
    await clearAppData();
    setData(defaultData);

    try {
      deleteExportFiles();
    } catch {
      // Leftover export files are best-effort cleanup; the app data itself is already gone.
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        data,
        isReady,
        addGoal,
        updateGoal,
        deleteGoal,
        completeOnboarding,
        addProgress,
        replaceGoalProgress,
        saveTargetRate,
        saveSavingsTargetSettings,
        saveIncomeSettings,
        setDefaultView,
        registerLogoTap,
        exportJson,
        resetAppData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }

  return context;
}
