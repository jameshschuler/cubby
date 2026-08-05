import { AppData, Goal, ProgressEvent } from './types';

export function deleteGoalState(
  data: AppData,
  goalId: string,
  removeAssociatedData = true
): AppData {
  return {
    ...data,
    goals: data.goals.filter((goal) => goal.id !== goalId),
    progressEvents: removeAssociatedData
      ? data.progressEvents.filter((event) => event.goalId !== goalId)
      : data.progressEvents,
  };
}

export function createGoal(overrides: Partial<Goal> = {}): Goal {
  const now = new Date().toISOString();

  return {
    id: overrides.id ?? `goal-${now}`,
    name: overrides.name ?? 'Goal',
    nickname: overrides.nickname ?? '',
    origin: overrides.origin ?? '',
    category: overrides.category,
    accountType: overrides.accountType,
    cadence: overrides.cadence ?? 'monthly',
    isRecurring: overrides.isRecurring ?? false,
    recurringState: overrides.recurringState ?? 'month',
    targetAmount: overrides.targetAmount ?? 100,
    autoContributionAmount: overrides.autoContributionAmount,
    autoContributionAnchor: overrides.autoContributionAnchor,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

export function createProgressEvent(overrides: Partial<ProgressEvent> = {}): ProgressEvent {
  const now = new Date().toISOString();

  return {
    id: overrides.id ?? `event-${now}`,
    goalId: overrides.goalId ?? 'goal-1',
    amount: overrides.amount ?? 50,
    eventDate: overrides.eventDate ?? now,
    note: overrides.note,
    source: overrides.source ?? 'manual',
    createdAt: overrides.createdAt ?? now,
  };
}
