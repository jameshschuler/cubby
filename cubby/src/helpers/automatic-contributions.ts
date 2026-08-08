import { AppData, Goal, ProgressEvent, ViewPeriod } from '../core/types';

const AUTOMATIC_CONTRIBUTION_NOTES: Record<ViewPeriod, string> = {
  week: 'Automatic weekly contribution',
  month: 'Automatic monthly contribution',
  year: 'Automatic yearly contribution',
};

function isAutomaticContributionGoal(goal: Goal) {
  return goal.isRecurring && (goal.autoContributionAmount ?? 0) > 0;
}

function getPeriodStart(view: ViewPeriod, date: Date) {
  if (view === 'week') {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (view === 'year') {
    return new Date(date.getFullYear(), 0, 1);
  }

  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatPeriodKey(view: ViewPeriod, date: Date) {
  if (view === 'week') {
    return date.toISOString().slice(0, 10);
  }

  if (view === 'year') {
    return String(date.getFullYear());
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getNextPeriodStart(view: ViewPeriod, date: Date) {
  const next = new Date(date);

  if (view === 'week') {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (view === 'year') {
    next.setFullYear(next.getFullYear() + 1);
    return next;
  }

  next.setMonth(next.getMonth() + 1);
  return next;
}

export function getDefaultAutoContributionAnchor(recurringState: ViewPeriod): string {
  if (recurringState === 'week') {
    return '5';
  }

  if (recurringState === 'year') {
    return '01-01';
  }

  return '1';
}

export function parseAutoContributionAnchor(recurringState: ViewPeriod, anchor?: string) {
  if (!anchor) {
    return { isValid: true, normalizedValue: getDefaultAutoContributionAnchor(recurringState) };
  }

  if (recurringState === 'week') {
    const parsed = Number.parseInt(anchor, 10);
    if (Number.isNaN(parsed)) {
      return { isValid: false };
    }

    const normalized = Math.max(0, Math.min(6, parsed));
    return { isValid: true, normalizedValue: String(normalized) };
  }

  if (recurringState === 'month') {
    const parsed = Number.parseInt(anchor, 10);
    if (Number.isNaN(parsed)) {
      return { isValid: false };
    }

    const normalized = Math.max(1, Math.min(31, parsed));
    return { isValid: true, normalizedValue: String(normalized) };
  }

  const [monthPart, dayPart] = anchor.split('-');
  const month = Number.parseInt(monthPart ?? '', 10);
  const day = Number.parseInt(dayPart ?? '', 10);

  if (Number.isNaN(month) || Number.isNaN(day)) {
    return { isValid: false };
  }

  const normalizedMonth = Math.max(1, Math.min(12, month));
  const maxDay = new Date(2000, normalizedMonth, 0).getDate();
  const normalizedDay = Math.max(1, Math.min(maxDay, day));

  return {
    isValid: true,
    normalizedValue: `${String(normalizedMonth).padStart(2, '0')}-${String(normalizedDay).padStart(2, '0')}`,
  };
}

function getEventDateForGoal(goal: Goal, periodStart: Date): string {
  const view = goal.recurringState;
  const anchor = parseAutoContributionAnchor(view, goal.autoContributionAnchor);
  const resolvedAnchor = anchor.isValid
    ? anchor.normalizedValue
    : getDefaultAutoContributionAnchor(view);

  if (view === 'week') {
    const eventDate = new Date(periodStart);
    const day = Number.parseInt(resolvedAnchor ?? '0', 10);
    eventDate.setDate(periodStart.getDate() + day);
    eventDate.setHours(12, 0, 0, 0);
    return eventDate.toISOString();
  }

  if (view === 'month') {
    const day = Number.parseInt(resolvedAnchor ?? '1', 10);
    const eventDate = new Date(periodStart.getFullYear(), periodStart.getMonth(), day, 12, 0, 0, 0);
    if (eventDate.getMonth() !== periodStart.getMonth()) {
      eventDate.setDate(0);
    }
    return eventDate.toISOString();
  }

  const [monthPart, dayPart] = (resolvedAnchor ?? '01-01').split('-');
  const month = Number.parseInt(monthPart ?? '1', 10);
  const day = Number.parseInt(dayPart ?? '1', 10);
  const eventDate = new Date(periodStart.getFullYear(), month - 1, day, 12, 0, 0, 0);
  return eventDate.toISOString();
}

function buildAutomaticEvent(goal: Goal, periodStart: Date): ProgressEvent {
  const view = goal.recurringState;
  const periodKey = formatPeriodKey(view, periodStart);
  const eventDate = getEventDateForGoal(goal, periodStart);

  return {
    id: `auto-${goal.id}-${view}-${periodKey}`,
    goalId: goal.id,
    amount: goal.autoContributionAmount ?? 0,
    eventDate,
    note: AUTOMATIC_CONTRIBUTION_NOTES[view],
    source: 'automatic',
    createdAt: eventDate,
  };
}

function buildAutomaticEventsForGoal(goal: Goal, asOf: Date): ProgressEvent[] {
  if (!isAutomaticContributionGoal(goal)) {
    return [];
  }

  const createdAt = new Date(goal.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    return [];
  }

  const view = goal.recurringState;
  const currentPeriod = getPeriodStart(view, asOf);
  const firstPeriod = getPeriodStart(view, createdAt);

  if (firstPeriod.getTime() > currentPeriod.getTime()) {
    return [];
  }

  const events: ProgressEvent[] = [];

  for (let cursor = new Date(firstPeriod); cursor.getTime() <= currentPeriod.getTime();) {
    events.push(buildAutomaticEvent(goal, new Date(cursor)));
    cursor = getNextPeriodStart(view, cursor);
  }

  return events;
}

export function syncAutomaticContributionEvents(data: AppData, asOf = new Date()): AppData {
  const activeGoalIds = new Set(data.goals.map((goal) => goal.id));
  const preservedProgressEvents = data.progressEvents.filter(
    (event) => event.source !== 'automatic' || !activeGoalIds.has(event.goalId)
  );

  const automaticProgressEvents = data.goals.flatMap((goal) =>
    buildAutomaticEventsForGoal(goal, asOf)
  );

  return {
    ...data,
    progressEvents: [...automaticProgressEvents, ...preservedProgressEvents],
  };
}
