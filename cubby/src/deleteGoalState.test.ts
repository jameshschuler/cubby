import { describe, expect, it } from 'vitest';
import { createGoal, createProgressEvent, deleteGoalState } from './deleteGoalState';
import { AppData } from './types';

describe('deleteGoalState', () => {
  function buildData(): AppData {
    const goal = createGoal({ id: 'goal-1', name: 'Emergency Fund' });
    const otherGoal = createGoal({ id: 'goal-2', name: 'Vacation' });

    return {
      goals: [goal, otherGoal],
      progressEvents: [
        createProgressEvent({ id: 'event-1', goalId: 'goal-1', amount: 10 }),
        createProgressEvent({ id: 'event-2', goalId: 'goal-2', amount: 20 }),
      ],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 5000,
        incomeFrequency: 'monthly',
        incomeIsGross: true,
        hasCompletedOnboarding: false,
        useSeededDemoData: false,
      },
    };
  }

  it('removes the goal but preserves progress events when deleteAssociatedData is false', () => {
    const data = buildData();

    const next = deleteGoalState(data, 'goal-1', false);

    expect(next.goals.map((goal) => goal.id)).toEqual(['goal-2']);
    expect(next.progressEvents.map((event) => event.id)).toEqual(['event-1', 'event-2']);
    expect(next.progressEvents.find((event) => event.id === 'event-1')?.goalId).toBe('goal-1');
  });

  it('removes the goal and its progress events when deleteAssociatedData is true', () => {
    const data = buildData();

    const next = deleteGoalState(data, 'goal-1', true);

    expect(next.goals.map((goal) => goal.id)).toEqual(['goal-2']);
    expect(next.progressEvents.map((event) => event.id)).toEqual(['event-2']);
    expect(next.progressEvents.find((event) => event.id === 'event-2')?.goalId).toBe('goal-2');
  });
});
