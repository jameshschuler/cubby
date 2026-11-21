import { describe, expect, it } from '@jest/globals';

import {
  getDefaultAutoContributionAnchor,
  syncAutomaticContributionEvents,
} from './automatic-contributions';
import { createGoal, createProgressEvent } from './deleteGoalState';
import { AppData } from '../core/types';

const baseSettings: AppData['settings'] = {
  defaultView: 'month',
  targetSavingsRate: 0.15,
  savingsTargetMode: 'rate',
  yearlySavingsGoalAmount: 0,
  incomeAmount: 0,
  incomeFrequency: 'monthly',
  hasCompletedOnboarding: false,
  logoTapCount: 0,
};

describe('syncAutomaticContributionEvents', () => {
  it('defaults weekly contributions to Friday', () => {
    expect(getDefaultAutoContributionAnchor('week')).toBe('5');
  });

  it('adds automatic monthly events for active goals and keeps manual progress', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-1',
          isRecurring: true,
          recurringState: 'month',
          autoContributionAmount: 200,
          createdAt: '2024-01-15T12:00:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        }),
      ],
      progressEvents: [
        createProgressEvent({
          id: 'manual-1',
          goalId: 'goal-1',
          amount: 50,
          eventDate: '2024-03-18T12:00:00.000Z',
          createdAt: '2024-03-18T12:00:00.000Z',
        }),
      ],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date('2024-03-20T12:00:00.000Z'));

    // January 1 is before the goal was created on January 15, so the first contribution is February.
    expect(next.progressEvents.map((event) => event.id)).toEqual([
      'auto-goal-1-month-2024-02',
      'auto-goal-1-month-2024-03',
      'manual-1',
    ]);
    expect(next.progressEvents.slice(0, 2).every((event) => event.source === 'automatic')).toBe(
      true
    );
    expect(next.progressEvents.slice(0, 2).every((event) => event.amount === 200)).toBe(true);
  });

  it('uses a custom weekly anchor day when generating automatic contributions', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-week',
          isRecurring: true,
          recurringState: 'week',
          autoContributionAmount: 75,
          autoContributionAnchor: '3',
          createdAt: '2024-01-10T12:00:00.000Z',
          updatedAt: '2024-01-10T12:00:00.000Z',
        }),
      ],
      progressEvents: [],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date('2024-01-20T12:00:00.000Z'));

    expect(next.progressEvents[next.progressEvents.length - 1]?.eventDate).toBe(
      new Date(2024, 0, 17, 12).toISOString()
    );
  });

  it('uses a custom yearly anchor month and date when generating automatic contributions', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-year',
          isRecurring: true,
          recurringState: 'year',
          autoContributionAmount: 1200,
          autoContributionAnchor: '06-15',
          createdAt: '2024-01-10T12:00:00.000Z',
          updatedAt: '2024-01-10T12:00:00.000Z',
        }),
      ],
      progressEvents: [],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date('2024-06-20T12:00:00.000Z'));

    expect(next.progressEvents[0]?.eventDate).toBe(new Date(2024, 5, 15, 12).toISOString());
  });

  it('clamps monthly anchors that exceed the number of days in the month', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-month-end',
          isRecurring: true,
          recurringState: 'month',
          autoContributionAmount: 150,
          autoContributionAnchor: '31',
          createdAt: '2024-02-01T12:00:00.000Z',
          updatedAt: '2024-02-01T12:00:00.000Z',
        }),
      ],
      progressEvents: [],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date(2024, 2, 1, 12));

    expect(next.progressEvents.map((event) => event.eventDate)).toEqual([
      new Date(2024, 1, 29, 12).toISOString(),
    ]);
  });

  it('falls back to the default anchor when an existing weekly anchor is malformed', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-week-default',
          isRecurring: true,
          recurringState: 'week',
          autoContributionAmount: 60,
          autoContributionAnchor: 'oops',
          createdAt: '2024-01-10T12:00:00.000Z',
          updatedAt: '2024-01-10T12:00:00.000Z',
        }),
      ],
      progressEvents: [],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date('2024-01-20T12:00:00.000Z'));

    expect(next.progressEvents[next.progressEvents.length - 1]?.eventDate).toBe(
      new Date(2024, 0, 19, 12).toISOString()
    );
  });

  it('adds automatic weekly and yearly events based on the goal recurrence', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-week',
          isRecurring: true,
          recurringState: 'week',
          autoContributionAmount: 75,
          createdAt: '2024-01-10T12:00:00.000Z',
          updatedAt: '2024-01-10T12:00:00.000Z',
        }),
        createGoal({
          id: 'goal-year',
          isRecurring: true,
          recurringState: 'year',
          autoContributionAmount: 1200,
          createdAt: '2023-05-20T12:00:00.000Z',
          updatedAt: '2023-05-20T12:00:00.000Z',
        }),
      ],
      progressEvents: [],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date('2024-01-20T12:00:00.000Z'));

    expect(next.progressEvents.map((event) => event.id)).toEqual([
      'auto-goal-week-week-2024-01-07',
      'auto-goal-week-week-2024-01-14',
      'auto-goal-year-year-2024',
    ]);
    expect(
      next.progressEvents.find((event) => event.id === 'auto-goal-week-week-2024-01-07')?.note
    ).toBe('Scheduled weekly contribution');
    expect(
      next.progressEvents.find((event) => event.id === 'auto-goal-year-year-2024')?.amount
    ).toBe(1200);
  });

  it('keeps recorded automatic events when a goal stops contributing', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-1',
          isRecurring: true,
          recurringState: 'month',
          autoContributionAmount: undefined,
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
        }),
      ],
      progressEvents: [
        createProgressEvent({
          id: 'auto-goal-1-month-2024-01',
          goalId: 'goal-1',
          amount: 100,
          eventDate: '2024-01-01T12:00:00.000Z',
          createdAt: '2024-01-01T12:00:00.000Z',
          source: 'automatic',
        }),
        createProgressEvent({
          id: 'auto-goal-2-month-2024-01',
          goalId: 'goal-2',
          amount: 80,
          eventDate: '2024-01-01T12:00:00.000Z',
          createdAt: '2024-01-01T12:00:00.000Z',
          source: 'automatic',
        }),
      ],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date('2024-01-20T12:00:00.000Z'));

    expect(next.progressEvents.map((event) => event.id)).toEqual([
      'auto-goal-1-month-2024-01',
      'auto-goal-2-month-2024-01',
    ]);
  });

  it('does not rewrite past contributions when the amount changes', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-1',
          isRecurring: true,
          recurringState: 'month',
          autoContributionAmount: 250,
          autoContributionAnchor: '1',
          autoContributionStartAt: new Date(2024, 2, 10, 9).toISOString(),
          createdAt: new Date(2024, 0, 1, 9).toISOString(),
          updatedAt: new Date(2024, 2, 10, 9).toISOString(),
        }),
      ],
      progressEvents: ['01', '02', '03'].map((month) =>
        createProgressEvent({
          id: `auto-goal-1-month-2024-${month}`,
          goalId: 'goal-1',
          amount: 100,
          eventDate: new Date(2024, Number(month) - 1, 1, 12).toISOString(),
          source: 'automatic',
        })
      ),
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date(2024, 4, 15, 12));

    expect(next.progressEvents.map((event) => [event.id, event.amount])).toEqual([
      ['auto-goal-1-month-2024-04', 250],
      ['auto-goal-1-month-2024-05', 250],
      ['auto-goal-1-month-2024-01', 100],
      ['auto-goal-1-month-2024-02', 100],
      ['auto-goal-1-month-2024-03', 100],
    ]);
  });

  it('does not duplicate a recorded contribution whose id format has changed', () => {
    const eventDate = new Date(2024, 0, 12, 12).toISOString();
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-week',
          isRecurring: true,
          recurringState: 'week',
          autoContributionAmount: 75,
          createdAt: new Date(2024, 0, 8, 9).toISOString(),
          updatedAt: new Date(2024, 0, 8, 9).toISOString(),
        }),
      ],
      progressEvents: [
        createProgressEvent({
          id: 'auto-goal-week-week-2024-01-06',
          goalId: 'goal-week',
          amount: 75,
          eventDate,
          source: 'automatic',
        }),
      ],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date(2024, 0, 13, 12));

    expect(next.progressEvents.map((event) => event.id)).toEqual([
      'auto-goal-week-week-2024-01-06',
    ]);
  });

  it('does not record a contribution before its scheduled date', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-1',
          isRecurring: true,
          recurringState: 'month',
          autoContributionAmount: 100,
          autoContributionAnchor: '28',
          createdAt: new Date(2024, 0, 2, 9).toISOString(),
          updatedAt: new Date(2024, 0, 2, 9).toISOString(),
        }),
      ],
      progressEvents: [
        // Written by an older version that counted the month's contribution early.
        createProgressEvent({
          id: 'auto-goal-1-month-2024-02',
          goalId: 'goal-1',
          amount: 100,
          eventDate: new Date(2024, 1, 28, 12).toISOString(),
          source: 'automatic',
        }),
      ],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date(2024, 1, 5, 12));

    expect(next.progressEvents.map((event) => event.id)).toEqual(['auto-goal-1-month-2024-01']);
  });

  it('records a contribution on its scheduled day', () => {
    const data: AppData = {
      goals: [
        createGoal({
          id: 'goal-1',
          isRecurring: true,
          recurringState: 'month',
          autoContributionAmount: 100,
          autoContributionAnchor: '5',
          createdAt: new Date(2024, 1, 5, 18).toISOString(),
          updatedAt: new Date(2024, 1, 5, 18).toISOString(),
        }),
      ],
      progressEvents: [],
      settings: baseSettings,
    };

    const next = syncAutomaticContributionEvents(data, new Date(2024, 1, 5, 8));

    expect(next.progressEvents.map((event) => event.id)).toEqual(['auto-goal-1-month-2024-02']);
  });
});
