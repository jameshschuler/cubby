import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createElement, forwardRef } from 'react';
import type { ForwardedRef, ReactNode } from 'react';

import type { GoalDetailsInput, GoalsTemplatesCardProps } from '../components/goals/types';
import type { GoalDetailsModalProps } from '../components/goals/types';
import type { AppData, Goal } from '../core/types';

const { pushSpy, updateGoalSpy, deleteGoalSpy } = vi.hoisted(() => ({
  pushSpy: vi.fn(),
  updateGoalSpy: vi.fn(),
  deleteGoalSpy: vi.fn(),
}));

type MockComponentProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

const fixture = vi.hoisted(() => ({
  shouldShowOnboarding: true,
  data: {
    goals: [] as Goal[],
    progressEvents: [] as AppData['progressEvents'],
    settings: {
      defaultView: 'month',
      targetSavingsRate: 0.15,
      savingsTargetMode: 'rate',
      yearlySavingsGoalAmount: 0,
      incomeAmount: 0,
      incomeFrequency: 'monthly',
      hasCompletedOnboarding: true,
      logoTapCount: 0,
    },
  } satisfies AppData,
}));

vi.mock('expo-router', () => ({
  router: {
    push: pushSpy,
  },
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('react-native', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: MockComponentProps, ref: ForwardedRef<unknown>) =>
      React.createElement('mock-node', { componentName: name, ...props, ref }, children)
    );

  return {
    SafeAreaView: createHostComponent('SafeAreaView'),
    ScrollView: createHostComponent('ScrollView'),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
  };
});

vi.mock('../core/app-data-context', () => ({
  useAppData: () => ({
    data: fixture.data,
    updateGoal: updateGoalSpy,
    deleteGoal: deleteGoalSpy,
  }),
}));

vi.mock('../helpers/onboarding', () => ({
  shouldShowOnboarding: () => fixture.shouldShowOnboarding,
}));

vi.mock('../components/goals/GoalsHeader', () => ({
  default: ({ onAddGoal }: { onAddGoal: () => void }) => (
    <mock-node componentName="GoalsHeader" onAddGoal={onAddGoal} />
  ),
}));

vi.mock('../components/onboarding/FirstRunOnboardingCard', () => ({
  default: ({ onCreateGoal }: { onCreateGoal: () => void }) => (
    <mock-node componentName="FirstRunOnboardingCard" onCreateGoal={onCreateGoal} />
  ),
}));

vi.mock('../components/goals/GoalsTemplatesCard', () => ({
  default: ({ goals, onEditGoal, onDeleteGoal, onCreateGoal }: GoalsTemplatesCardProps) => (
    <mock-node
      componentName="GoalsTemplatesCard"
      goals={goals}
      onEditGoal={onEditGoal}
      onDeleteGoal={onDeleteGoal}
      onCreateGoal={onCreateGoal}
    />
  ),
}));

vi.mock('../components/goals/GoalDetailsModal', () => ({
  default: ({ goal, visible, onClose, onSave }: GoalDetailsModalProps) =>
    visible ? (
      <mock-node
        componentName="GoalDetailsModal"
        goal={goal}
        visible={visible}
        onClose={onClose}
        onSave={onSave}
      />
    ) : null,
}));

import GoalsScreen from './GoalsScreen';

describe('GoalsScreen', () => {
  beforeEach(() => {
    pushSpy.mockReset();
    updateGoalSpy.mockReset();
    deleteGoalSpy.mockReset();

    fixture.shouldShowOnboarding = true;
    fixture.data = {
      goals: [],
      progressEvents: [],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.15,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 0,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: true,
        logoTapCount: 0,
      },
    };
  });

  it('routes to add-goal from the header and onboarding card', () => {
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<GoalsScreen />);
    });

    const root = renderer!.root;

    act(() => {
      root.findByProps({ componentName: 'GoalsHeader' }).props.onAddGoal();
    });

    act(() => {
      root.findByProps({ componentName: 'FirstRunOnboardingCard' }).props.onCreateGoal();
    });

    expect(pushSpy).toHaveBeenCalledWith('/add-goal');
    expect(pushSpy).toHaveBeenCalledTimes(2);
  });

  it('opens the edit modal, saves changes, and deletes goals from the templates card', () => {
    fixture.shouldShowOnboarding = false;
    const goal: Goal = {
      id: 'goal-1',
      name: 'Emergency Fund',
      nickname: '',
      origin: '',
      cadence: 'monthly',
      targetAmount: 1000,
      isRecurring: true,
      recurringState: 'month',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    fixture.data = {
      goals: [goal],
      progressEvents: [],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.15,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 0,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: true,
        logoTapCount: 0,
      },
    };

    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<GoalsScreen />);
    });

    const root = renderer!.root;
    const templatesCard = root.findByProps({ componentName: 'GoalsTemplatesCard' });

    act(() => {
      templatesCard.props.onEditGoal(fixture.data.goals[0]);
    });

    let modal = root.findByProps({ componentName: 'GoalDetailsModal' });
    expect(modal.props.visible).toBe(true);
    expect(modal.props.goal.id).toBe('goal-1');

    const updatedInput: GoalDetailsInput = {
      name: 'Updated goal',
      nickname: '',
      origin: '',
      targetAmount: 1200,
      isRecurring: true,
      recurringState: 'month',
    };

    act(() => {
      modal.props.onSave('goal-1', updatedInput);
    });

    expect(updateGoalSpy).toHaveBeenCalledWith(
      'goal-1',
      expect.objectContaining({ name: 'Updated goal' })
    );
    expect(root.findAllByProps({ componentName: 'GoalDetailsModal' })).toHaveLength(0);

    act(() => {
      templatesCard.props.onDeleteGoal('goal-1', true);
    });

    expect(deleteGoalSpy).toHaveBeenCalledWith('goal-1', true);
    expect(root.findAllByProps({ componentName: 'GoalDetailsModal' })).toHaveLength(0);
  });
});
