import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { syncAutomaticContributionEvents } from '../helpers/automatic-contributions';
import { getEntryDateForView, isInView } from '../helpers/calculations';
import { deleteGoalState } from '../helpers/deleteGoalState';
import {
  getCadenceForRecurringState,
  sanitizeAutoContributionAmount,
  sanitizeAutoContributionAnchor,
} from '../helpers/goal-input';
import { defaultData, loadAppData, saveAppData } from './storage';
import {
  AccountType,
  AppData,
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
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

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

export function AppDataProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppData>(defaultData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const loaded = await loadAppData();
      setData(syncAutomaticContributionEvents(loaded));
      setIsReady(true);
    };

    hydrate().catch(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveAppData(data).catch(() => {
      // Keep the UI usable if a local save fails.
    });
  }, [data, isReady]);

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
    const fileUri = `${FileSystem.documentDirectory}cubby-export-${new Date().toISOString().slice(0, 10)}.json`;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Cubby data',
    });
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
