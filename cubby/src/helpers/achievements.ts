import { AppData, Goal, ProgressEvent } from '../core/types';

export type AchievementId =
  | 'first-goal'
  | 'first-deposit'
  | 'profile-complete'
  | 'planner'
  | 'quarter-tank'
  | 'halfway-there'
  | 'goal-crushed'
  | 'on-a-roll'
  | 'weekly-streak'
  | 'first-1000'
  | 'goal-builder'
  | 'over-target'
  | 'nice'
  | 'logo-tap'
  | 'all-base-achievements'
  | 'all-secret-achievements';

export type AchievementStatusMap = Record<AchievementId, boolean>;
type BaseAchievementId = Exclude<
  AchievementId,
  'nice' | 'logo-tap' | 'all-base-achievements' | 'all-secret-achievements'
>;
type SecretAchievementId = Exclude<AchievementId, BaseAchievementId>;

const BASE_ACHIEVEMENT_IDS: BaseAchievementId[] = [
  'first-goal',
  'first-deposit',
  'profile-complete',
  'planner',
  'quarter-tank',
  'halfway-there',
  'goal-crushed',
  'on-a-roll',
  'weekly-streak',
  'first-1000',
  'goal-builder',
  'over-target',
];

const SECRET_ACHIEVEMENT_IDS_EXCEPT_ALL_SECRET: Array<
  Exclude<SecretAchievementId, 'all-secret-achievements'>
> = ['nice', 'logo-tap', 'all-base-achievements'];

function getMonthIndex(isoDate: string): number {
  const date = new Date(isoDate);
  return date.getFullYear() * 12 + date.getMonth();
}

function hasConsecutiveRun(values: number[], runLength: number): boolean {
  if (values.length < runLength) {
    return false;
  }

  const sortedUnique = Array.from(new Set(values)).sort((a, b) => a - b);
  let streak = 1;

  for (let i = 1; i < sortedUnique.length; i += 1) {
    if (sortedUnique[i] === sortedUnique[i - 1] + 1) {
      streak += 1;
      if (streak >= runLength) {
        return true;
      }
      continue;
    }

    streak = 1;
  }

  return false;
}

function getGoalTotals(goals: Goal[], progressEvents: ProgressEvent[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const goal of goals) {
    totals.set(goal.id, 0);
  }

  for (const event of progressEvents) {
    totals.set(event.goalId, (totals.get(event.goalId) ?? 0) + event.amount);
  }

  return totals;
}

export function getAchievementStatuses(data: AppData): AchievementStatusMap {
  const { goals, progressEvents, settings } = data;
  const goalTotals = getGoalTotals(goals, progressEvents);
  const totalSaved = progressEvents.reduce((sum, event) => sum + event.amount, 0);
  const manualProgressEvents = progressEvents.filter(
    (event) => event.source === 'manual' && event.amount > 0
  );

  const hasQuarterGoal = goals.some((goal) => {
    if (goal.targetAmount <= 0) {
      return false;
    }
    return (goalTotals.get(goal.id) ?? 0) / goal.targetAmount >= 0.25;
  });

  const hasHalfGoal = goals.some((goal) => {
    if (goal.targetAmount <= 0) {
      return false;
    }
    return (goalTotals.get(goal.id) ?? 0) / goal.targetAmount >= 0.5;
  });

  const hasCompletedGoal = goals.some((goal) => {
    if (goal.targetAmount <= 0) {
      return false;
    }
    return (goalTotals.get(goal.id) ?? 0) / goal.targetAmount >= 1;
  });

  const monthIndexes = manualProgressEvents.map((event) => getMonthIndex(event.eventDate));

  const plannerGoals = goals.filter(
    (goal) =>
      goal.isRecurring && (goal.autoContributionAmount ?? 0) > 0 && !!goal.autoContributionAnchor
  );

  const hasGoalBuilder = goals.length >= 3;

  const hasOverTargetGoal = goals.some((goal) => {
    if (goal.targetAmount <= 0) {
      return false;
    }

    return (goalTotals.get(goal.id) ?? 0) / goal.targetAmount > 1;
  });

  const hasNiceContribution = progressEvents.some((event) => event.amount === 69);
  const hasLogoTap = settings.logoTapCount > 0;

  const profileComplete =
    settings.incomeAmount > 0 &&
    (settings.savingsTargetMode === 'rate'
      ? settings.targetSavingsRate > 0
      : settings.yearlySavingsGoalAmount > 0);

  const baseStatuses: Record<BaseAchievementId, boolean> = {
    'first-goal': goals.length > 0,
    'first-deposit': progressEvents.length > 0,
    'profile-complete': profileComplete,
    planner: plannerGoals.length > 0,
    'quarter-tank': hasQuarterGoal,
    'halfway-there': hasHalfGoal,
    'goal-crushed': hasCompletedGoal,
    'on-a-roll': manualProgressEvents.length >= 3,
    'weekly-streak': hasConsecutiveRun(monthIndexes, 3),
    'first-1000': totalSaved >= 1000,
    'goal-builder': hasGoalBuilder,
    'over-target': hasOverTargetGoal,
  };

  const hasAllBaseAchievements = BASE_ACHIEVEMENT_IDS.every((id) => baseStatuses[id]);

  const statusesWithoutAllSecret: Omit<AchievementStatusMap, 'all-secret-achievements'> = {
    ...baseStatuses,
    nice: hasNiceContribution,
    'logo-tap': hasLogoTap,
    'all-base-achievements': hasAllBaseAchievements,
  };

  const hasAllSecretAchievements = SECRET_ACHIEVEMENT_IDS_EXCEPT_ALL_SECRET.every(
    (id) => statusesWithoutAllSecret[id]
  );

  return {
    ...statusesWithoutAllSecret,
    'all-secret-achievements': hasAllSecretAchievements,
  };
}
