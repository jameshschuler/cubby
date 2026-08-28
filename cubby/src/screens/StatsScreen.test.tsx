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
jest.mock('../core/app-data-context', () => ({ useAppData: () => ({ data: mockData }) }));
jest.mock('../helpers/onboarding', () => ({ shouldShowOnboarding: () => true }));
jest.mock('../components/stats/useStatsData', () => ({
  __esModule: true,
  default: () => ({ goals: [], selection: {}, totals: {}, history: {} }),
}));
jest.mock('../components/stats/StatsHeroCard', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/onboarding/FirstRunOnboardingCard', () => ({
  __esModule: true,
  default: ({ title, onCreateGoal }: { title: string; onCreateGoal: () => void }) => {
    return (
      <MockPressable accessibilityRole="button" onPress={onCreateGoal}>
        <MockText>{title}</MockText>
      </MockPressable>
    );
  },
}));
jest.mock('../components/stats/StatsGoalSummaryCard', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../components/stats/StatsSelectionCard', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../components/stats/StatsHistoryListCard', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../components/stats/StatsMonthlyChartCard', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../components/stats/StatsSummaryGrid', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../components/stats/StatsYearListCard', () => ({
  __esModule: true,
  default: () => null,
}));

import StatsScreen from './StatsScreen';

describe('StatsScreen', () => {
  it('shows the onboarding state and routes to add a goal when no stats exist', () => {
    const screen = render(<StatsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Build your first stats view' }));

    expect(mockPush).toHaveBeenCalledWith('/add-goal');
  });
});
