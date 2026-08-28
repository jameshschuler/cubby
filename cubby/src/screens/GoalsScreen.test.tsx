import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { Pressable as MockPressable, Text as MockText } from 'react-native';

const mockPush = jest.fn();
const mockData = {
  goals: [],
  progressEvents: [],
  settings: {
    defaultView: 'month' as const,
    targetSavingsRate: 0.15,
    savingsTargetMode: 'rate' as const,
    yearlySavingsGoalAmount: 0,
    incomeAmount: 0,
    incomeFrequency: 'monthly' as const,
    hasCompletedOnboarding: false,
    logoTapCount: 0,
  },
};

jest.mock('expo-router', () => ({ router: { push: (...args: unknown[]) => mockPush(...args) } }));
jest.mock('../core/app-data-context', () => ({
  useAppData: () => ({ data: mockData, updateGoal: jest.fn(), deleteGoal: jest.fn() }),
}));
jest.mock('../helpers/onboarding', () => ({ shouldShowOnboarding: () => true }));
jest.mock('../components/goals/GoalsHeader', () => ({
  __esModule: true,
  default: ({ onAddGoal }: { onAddGoal: () => void }) => {
    return (
      <MockPressable accessibilityRole="button" onPress={onAddGoal}>
        <MockText>Add goal</MockText>
      </MockPressable>
    );
  },
}));
jest.mock('../components/onboarding/FirstRunOnboardingCard', () => ({
  __esModule: true,
  default: ({ onCreateGoal }: { onCreateGoal: () => void }) => {
    return (
      <MockPressable accessibilityRole="button" onPress={onCreateGoal}>
        <MockText>Create a goal</MockText>
      </MockPressable>
    );
  },
}));
jest.mock('../components/goals/GoalDetailsModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../components/goals/GoalsTemplatesCard', () => ({
  __esModule: true,
  default: () => null,
}));

import GoalsScreen from './GoalsScreen';

describe('GoalsScreen', () => {
  it('routes to goal creation from the header and onboarding', () => {
    const screen = render(<GoalsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Add goal' }));
    fireEvent.press(screen.getByRole('button', { name: 'Create a goal' }));

    expect(mockPush).toHaveBeenCalledWith('/add-goal');
    expect(mockPush).toHaveBeenCalledTimes(2);
  });
});
