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
  useAppData: () => ({
    data: mockData,
    replaceGoalProgress: jest.fn(),
    setDefaultView: jest.fn(),
    registerLogoTap: jest.fn(),
  }),
}));
jest.mock('../helpers/onboarding', () => ({ shouldShowOnboarding: () => true }));
jest.mock('../components/home/HomeHeader', () => ({
  __esModule: true,
  default: ({ onSettingsPress }: { onSettingsPress: () => void }) => {
    return (
      <MockPressable
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        onPress={onSettingsPress}
      />
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
jest.mock('../components/home/ViewFilterTabs', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/home/HomeSummaryCard', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/home/HomeGoalsCard', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/home/PeriodNavigator', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/home/ActualAmountModal', () => ({
  __esModule: true,
  default: () => null,
}));

import HomeScreen from './HomeScreen';

describe('HomeScreen', () => {
  it('routes to settings and goal creation from the available actions', () => {
    const screen = render(<HomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));
    fireEvent.press(screen.getByRole('button', { name: 'Create a goal' }));

    expect(mockPush).toHaveBeenNthCalledWith(1, '/settings');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/add-goal');
  });
});
