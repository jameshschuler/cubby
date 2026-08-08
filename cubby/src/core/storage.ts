import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppData, Goal, ProgressEvent } from './types';

const STORAGE_KEY = 'cubby.app-data.v1';

export const defaultData: AppData = {
  goals: [],
  progressEvents: [],
  settings: {
    defaultView: 'month',
    targetSavingsRate: 0.15,
    savingsTargetMode: 'rate',
    yearlySavingsGoalAmount: 0,
    incomeAmount: 0,
    incomeFrequency: 'monthly',
    hasCompletedOnboarding: false,
    logoTapCount: 0,
  },
};

function normalizeAppData(parsed: Partial<AppData>): AppData {
  return {
    goals: (parsed.goals ?? []).map((goal) => normalizeGoal(goal)),
    progressEvents: (parsed.progressEvents ?? []).map((event) => normalizeProgressEvent(event)),
    settings: {
      defaultView: parsed.settings?.defaultView ?? 'month',
      targetSavingsRate: parsed.settings?.targetSavingsRate ?? 0.15,
      savingsTargetMode:
        parsed.settings?.savingsTargetMode === 'yearly-goal' ? 'yearly-goal' : 'rate',
      yearlySavingsGoalAmount: parsed.settings?.yearlySavingsGoalAmount ?? 0,
      incomeAmount: parsed.settings?.incomeAmount ?? 0,
      incomeFrequency: parsed.settings?.incomeFrequency ?? 'monthly',
      hasCompletedOnboarding: parsed.settings?.hasCompletedOnboarding ?? false,
      logoTapCount: parsed.settings?.logoTapCount ?? 0,
    },
  };
}

function normalizeGoal(goal: Partial<Goal>): Goal {
  const now = new Date().toISOString();

  return {
    id: goal.id ?? `goal-${now}`,
    name: goal.name ?? '',
    nickname: goal.nickname ?? '',
    origin: goal.origin ?? '',
    category: goal.category,
    accountType: goal.accountType,
    cadence: goal.cadence ?? 'monthly',
    isRecurring: goal.isRecurring ?? false,
    recurringState: goal.recurringState ?? 'month',
    targetAmount: goal.targetAmount ?? 0,
    autoContributionAmount:
      typeof goal.autoContributionAmount === 'number' && goal.autoContributionAmount > 0
        ? goal.autoContributionAmount
        : undefined,
    autoContributionAnchor: goal.autoContributionAnchor?.trim() || undefined,
    createdAt: goal.createdAt ?? now,
    updatedAt: goal.updatedAt ?? now,
  };
}

function normalizeProgressEvent(event: Partial<ProgressEvent>): ProgressEvent {
  const now = new Date().toISOString();

  return {
    id: event.id ?? `event-${now}`,
    goalId: event.goalId ?? '',
    amount: typeof event.amount === 'number' ? event.amount : 0,
    eventDate: event.eventDate ?? now,
    note: event.note,
    source: event.source === 'automatic' ? 'automatic' : 'manual',
    createdAt: event.createdAt ?? event.eventDate ?? now,
  };
}

export async function loadAppData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultData;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return normalizeAppData(parsed);
  } catch {
    return defaultData;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
