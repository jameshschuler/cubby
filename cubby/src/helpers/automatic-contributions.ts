import { AppData, Goal, ProgressEvent, ViewPeriod } from '../core/types';

const AUTOMATIC_CONTRIBUTION_NOTES: Record<ViewPeriod, string> = {
  week: 'Scheduled weekly contribution',
  month: 'Scheduled monthly contribution',
  year: 'Scheduled yearly contribution',
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
    // Local date, so the key (and the event id) doesn't depend on the UTC offset.
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getEndOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function buildAutomaticEventsForGoal(goal: Goal, asOf: Date): ProgressEvent[] {
  if (!isAutomaticContributionGoal(goal)) {
    return [];
  }

  const scheduleStart = new Date(goal.autoContributionStartAt ?? goal.createdAt);
  if (Number.isNaN(scheduleStart.getTime())) {
    return [];
  }

  const view = goal.recurringState;
  const earliestEventTime = getStartOfDay(scheduleStart).getTime();
  const latestEventTime = getEndOfDay(asOf).getTime();
  const currentPeriod = getPeriodStart(view, asOf);
  const events: ProgressEvent[] = [];

  for (
    let cursor = getPeriodStart(view, scheduleStart);
    cursor.getTime() <= currentPeriod.getTime();
    cursor = getNextPeriodStart(view, cursor)
  ) {
    const event = buildAutomaticEvent(goal, new Date(cursor));
    const eventTime = new Date(event.eventDate).getTime();

    // Skip contributions scheduled before the schedule began or later than today.
    if (eventTime >= earliestEventTime && eventTime <= latestEventTime) {
      events.push(event);
    }
  }

  return events;
}

/**
 * Adds automatic contributions that have come due since the last sync.
 *
 * Recorded automatic events are history: they are kept as-is when a goal's schedule changes or
 * stops, so editing a contribution only affects future periods.
 */
export function syncAutomaticContributionEvents(data: AppData, asOf = new Date()): AppData {
  const latestEventTime = getEndOfDay(asOf).getTime();
  // Older versions recorded the current period's contribution before its date arrived.
  const preservedProgressEvents = data.progressEvents.filter(
    (event) =>
      event.source !== 'automatic' || new Date(event.eventDate).getTime() <= latestEventTime
  );
  const recordedEventIds = new Set(preservedProgressEvents.map((event) => event.id));
  // Also match on goal and date: ids from older versions (and after a timezone change) can
  // differ for the same contribution.
  const recordedContributionKeys = new Set(
    preservedProgressEvents
      .filter((event) => event.source === 'automatic')
      .map((event) => `${event.goalId}|${event.eventDate}`)
  );

  const newAutomaticEvents = data.goals
    .flatMap((goal) => buildAutomaticEventsForGoal(goal, asOf))
    .filter(
      (event) =>
        !recordedEventIds.has(event.id) &&
        !recordedContributionKeys.has(`${event.goalId}|${event.eventDate}`)
    );

  return {
    ...data,
    progressEvents: [...newAutomaticEvents, ...preservedProgressEvents],
  };
}
