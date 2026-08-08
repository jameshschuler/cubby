import { Goal, IncomeFrequency, ProgressEvent, SavingsTargetMode, ViewPeriod } from '../core/types';

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function getBounds(view: ViewPeriod, anchor: Date): { start: Date; end: Date } {
  if (view === 'week') {
    return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
  }

  if (view === 'year') {
    return { start: startOfYear(anchor), end: endOfYear(anchor) };
  }

  return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
}

export function isInView(isoDate: string, view: ViewPeriod, anchorDate: Date): boolean {
  const date = new Date(isoDate);
  const bounds = getBounds(view, anchorDate);
  return date >= bounds.start && date <= bounds.end;
}

export function getGoalProgress(
  goal: Goal,
  progressEvents: ProgressEvent[],
  view: ViewPeriod,
  anchorDate: Date
): number {
  return progressEvents
    .filter((event) => event.goalId === goal.id && isInView(event.eventDate, view, anchorDate))
    .reduce((total, event) => total + event.amount, 0);
}

export function getViewLabel(view: ViewPeriod, anchorDate: Date): string {
  if (view === 'week') {
    const start = startOfWeek(anchorDate);
    return `Week of ${start.toLocaleDateString()}`;
  }

  if (view === 'year') {
    return `${anchorDate.getFullYear()}`;
  }

  return anchorDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function shiftAnchorDate(view: ViewPeriod, anchorDate: Date, direction: -1 | 1): Date {
  const nextDate = new Date(anchorDate);

  if (view === 'week') {
    nextDate.setDate(nextDate.getDate() + direction * 7);
    return nextDate;
  }

  if (view === 'year') {
    nextDate.setFullYear(nextDate.getFullYear() + direction);
    return nextDate;
  }

  nextDate.setMonth(nextDate.getMonth() + direction);
  return nextDate;
}

export function getEntryDateForView(view: ViewPeriod, anchorDate: Date): string {
  if (view === 'week') {
    const entryDate = startOfWeek(anchorDate);
    entryDate.setHours(12, 0, 0, 0);
    return entryDate.toISOString();
  }

  if (view === 'year') {
    const entryDate = startOfYear(anchorDate);
    entryDate.setHours(12, 0, 0, 0);
    return entryDate.toISOString();
  }

  const entryDate = startOfMonth(anchorDate);
  entryDate.setHours(12, 0, 0, 0);
  return entryDate.toISOString();
}

export function getTargetSavedAmountForView(
  settings: {
    incomeAmount: number;
    incomeFrequency: IncomeFrequency;
    targetSavingsRate: number;
    savingsTargetMode: SavingsTargetMode;
    yearlySavingsGoalAmount: number;
  },
  view: ViewPeriod | 'one-time',
  visibleGoals: Goal[]
): number {
  if (view === 'one-time') {
    return visibleGoals.reduce((total, goal) => total + goal.targetAmount, 0);
  }

  if (settings.savingsTargetMode === 'yearly-goal') {
    if (settings.yearlySavingsGoalAmount <= 0) {
      return 0;
    }

    if (view === 'year') {
      return settings.yearlySavingsGoalAmount;
    }

    if (view === 'month') {
      return settings.yearlySavingsGoalAmount / 12;
    }

    return settings.yearlySavingsGoalAmount / 52;
  }

  const viewIncome = getIncomeAmountForView(settings.incomeAmount, settings.incomeFrequency, view);

  return viewIncome * settings.targetSavingsRate;
}

export function getSavingsRateForView(
  savedAmount: number,
  incomeAmount: number,
  incomeFrequency: IncomeFrequency,
  view: ViewPeriod | 'one-time'
): number | null {
  if (view === 'one-time' || incomeAmount <= 0) {
    return null;
  }

  const incomeForView = getIncomeAmountForView(incomeAmount, incomeFrequency, view);
  if (incomeForView <= 0) {
    return null;
  }

  return savedAmount / incomeForView;
}

export function getIncomeAmountForSelectedYear(
  incomeAmount: number,
  incomeFrequency: IncomeFrequency,
  selectedYear: number | null,
  referenceDate = new Date()
): number | null {
  if (selectedYear === null || incomeAmount <= 0) {
    return null;
  }

  const monthsInScope =
    selectedYear === referenceDate.getFullYear() ? referenceDate.getMonth() + 1 : 12;

  if (monthsInScope <= 0) {
    return null;
  }

  const monthlyIncome = getIncomeAmountForView(incomeAmount, incomeFrequency, 'month');
  if (monthlyIncome <= 0) {
    return null;
  }

  return monthlyIncome * monthsInScope;
}

export function getSavingsRateForSelectedYear(
  savedAmount: number,
  incomeAmount: number,
  incomeFrequency: IncomeFrequency,
  selectedYear: number | null,
  referenceDate = new Date()
): number | null {
  const selectedYearIncome = getIncomeAmountForSelectedYear(
    incomeAmount,
    incomeFrequency,
    selectedYear,
    referenceDate
  );

  if (!selectedYearIncome) {
    return null;
  }

  return savedAmount / selectedYearIncome;
}

export function getIncomeAmountForView(
  incomeAmount: number,
  incomeFrequency: 'monthly' | 'yearly',
  view: ViewPeriod
): number {
  if (incomeAmount <= 0) {
    return 0;
  }

  if (view === 'year') {
    return incomeFrequency === 'yearly' ? incomeAmount : incomeAmount * 12;
  }

  if (view === 'month') {
    return incomeFrequency === 'yearly' ? incomeAmount / 12 : incomeAmount;
  }

  return incomeFrequency === 'yearly' ? incomeAmount / 52 : incomeAmount / 4.3333333333;
}
