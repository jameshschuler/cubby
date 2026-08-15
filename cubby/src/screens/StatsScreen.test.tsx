import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  pushSpy,
  setSelectedGoalIdSpy,
  setSelectedYearSpy,
  getIncomeAmountForSelectedYearSpy,
  getSavingsRateForSelectedYearSpy,
  getTargetSavedAmountForViewSpy,
} = vi.hoisted(() => ({
  pushSpy: vi.fn(),
  setSelectedGoalIdSpy: vi.fn(),
  setSelectedYearSpy: vi.fn(),
  getIncomeAmountForSelectedYearSpy: vi.fn(),
  getSavingsRateForSelectedYearSpy: vi.fn(),
  getTargetSavedAmountForViewSpy: vi.fn(),
}));

const fixture = vi.hoisted(() => ({
  shouldShowOnboarding: true,
  appData: {
    goals: [],
    progressEvents: [],
    settings: {
      defaultView: 'month',
      targetSavingsRate: 0.15,
      savingsTargetMode: 'rate',
      yearlySavingsGoalAmount: 0,
      incomeAmount: 0,
      incomeFrequency: 'monthly',
      hasCompletedOnboarding: false,
      logoTapCount: 0,
    },
  } as any,
  statsData: {
    goals: [],
    selection: {
      selectedGoalId: 'all',
      setSelectedGoalId: setSelectedGoalIdSpy,
      selectedYear: null,
      setSelectedYear: setSelectedYearSpy,
      effectiveSelectedGoalId: null,
      showAllGoals: true,
      selectedGoal: null,
    },
    totals: {
      totalSavedAllTime: 0,
      totalsByYear: [],
      effectiveSelectedYear: null,
      selectedYearTotal: 0,
    },
    history: {
      filteredEvents: [],
      goalNameById: new Map<string, string>(),
      monthlyStats: {
        averageSavedPerMonth: 0,
        medianSavedPerMonth: 0,
        bestMonth: null,
        weakestMonth: null,
      },
    },
  } as any,
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
    React.forwardRef(({ children, ...props }: any, ref) =>
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
    data: fixture.appData,
  }),
}));

vi.mock('../helpers/onboarding', () => ({
  shouldShowOnboarding: () => fixture.shouldShowOnboarding,
}));

vi.mock('../helpers/calculations', () => ({
  getIncomeAmountForSelectedYear: (...args: any[]) => getIncomeAmountForSelectedYearSpy(...args),
  getSavingsRateForSelectedYear: (...args: any[]) => getSavingsRateForSelectedYearSpy(...args),
  getTargetSavedAmountForView: (...args: any[]) => getTargetSavedAmountForViewSpy(...args),
}));

vi.mock('../components/stats/useStatsData', () => ({
  default: () => fixture.statsData,
}));

vi.mock('../components/stats/StatsHeroCard', () => ({
  default: () => <mock-node componentName="StatsHeroCard" />,
}));

vi.mock('../components/onboarding/FirstRunOnboardingCard', () => ({
  default: ({ onCreateGoal, title, body, buttonLabel }: any) => (
    <mock-node
      componentName="FirstRunOnboardingCard"
      onCreateGoal={onCreateGoal}
      title={title}
      body={body}
      buttonLabel={buttonLabel}
    />
  ),
}));

vi.mock('../components/stats/StatsSelectionCard', () => ({
  default: (props: any) => <mock-node componentName="StatsSelectionCard" {...props} />,
}));

vi.mock('../components/stats/StatsGoalSummaryCard', () => ({
  default: (props: any) => <mock-node componentName="StatsGoalSummaryCard" {...props} />,
}));

vi.mock('../components/stats/StatsSummaryGrid', () => ({
  default: (props: any) => <mock-node componentName="StatsSummaryGrid" {...props} />,
}));

vi.mock('../components/stats/StatsYearListCard', () => ({
  default: (props: any) => <mock-node componentName="StatsYearListCard" {...props} />,
}));

vi.mock('../components/stats/StatsMonthlyChartCard', () => ({
  default: (props: any) => <mock-node componentName="StatsMonthlyChartCard" {...props} />,
}));

vi.mock('../components/stats/StatsHistoryListCard', () => ({
  default: (props: any) => <mock-node componentName="StatsHistoryListCard" {...props} />,
}));

import StatsScreen from './StatsScreen';

describe('StatsScreen', () => {
  beforeEach(() => {
    pushSpy.mockReset();
    setSelectedGoalIdSpy.mockReset();
    setSelectedYearSpy.mockReset();
    getIncomeAmountForSelectedYearSpy.mockReset();
    getSavingsRateForSelectedYearSpy.mockReset();
    getTargetSavedAmountForViewSpy.mockReset();

    getIncomeAmountForSelectedYearSpy.mockReturnValue(0);
    getSavingsRateForSelectedYearSpy.mockReturnValue(null);
    getTargetSavedAmountForViewSpy.mockReturnValue(0);

    fixture.shouldShowOnboarding = true;
    fixture.appData = {
      goals: [],
      progressEvents: [],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.15,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 0,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: false,
        logoTapCount: 0,
      },
    };
    fixture.statsData = {
      goals: [],
      selection: {
        selectedGoalId: 'all',
        setSelectedGoalId: setSelectedGoalIdSpy,
        selectedYear: null,
        setSelectedYear: setSelectedYearSpy,
        effectiveSelectedGoalId: null,
        showAllGoals: true,
        selectedGoal: null,
      },
      totals: {
        totalSavedAllTime: 0,
        totalsByYear: [],
        effectiveSelectedYear: null,
        selectedYearTotal: 0,
      },
      history: {
        filteredEvents: [],
        goalNameById: new Map<string, string>(),
        monthlyStats: {
          averageSavedPerMonth: 0,
          medianSavedPerMonth: 0,
          bestMonth: null,
          weakestMonth: null,
        },
      },
    };
  });

  it('shows onboarding when no stats exist and routes to add-goal', () => {
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<StatsScreen />);
    });

    const onboarding = renderer!.root.findByProps({ componentName: 'FirstRunOnboardingCard' });
    expect(onboarding.props.title).toBe('Build your first stats view');

    act(() => {
      onboarding.props.onCreateGoal();
    });

    expect(pushSpy).toHaveBeenCalledWith('/add-goal');
    expect(renderer!.root.findAllByProps({ componentName: 'StatsSelectionCard' })).toHaveLength(0);
  });

  it('renders stats cards when data exists and forwards selection handlers', () => {
    fixture.shouldShowOnboarding = false;
    fixture.appData = {
      goals: [
        {
          id: 'goal-1',
          name: 'Emergency Fund',
          nickname: '',
          origin: '',
          cadence: 'monthly',
          isRecurring: true,
          recurringState: 'month',
          targetAmount: 1000,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      progressEvents: [
        {
          id: 'event-1',
          goalId: 'goal-1',
          amount: 300,
          eventDate: '2026-03-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-03-10T00:00:00.000Z',
        },
      ],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 10000,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: true,
        logoTapCount: 0,
      },
    };

    fixture.statsData = {
      goals: fixture.appData.goals,
      selection: {
        selectedGoalId: 'goal-1',
        setSelectedGoalId: setSelectedGoalIdSpy,
        selectedYear: 2026,
        setSelectedYear: setSelectedYearSpy,
        effectiveSelectedGoalId: 'goal-1',
        showAllGoals: false,
        selectedGoal: fixture.appData.goals[0],
      },
      totals: {
        totalSavedAllTime: 300,
        totalsByYear: [{ year: 2026, total: 300 }],
        effectiveSelectedYear: 2026,
        selectedYearTotal: 300,
      },
      history: {
        filteredEvents: fixture.appData.progressEvents,
        goalNameById: new Map([['goal-1', 'Emergency Fund']]),
        monthlyStats: {
          averageSavedPerMonth: 300,
          medianSavedPerMonth: 300,
          bestMonth: { month: '2026-03', total: 300 },
          weakestMonth: { month: '2026-03', total: 300 },
        },
      },
    };

    getIncomeAmountForSelectedYearSpy.mockReturnValue(120000);
    getSavingsRateForSelectedYearSpy.mockReturnValue(0.25);
    getTargetSavedAmountForViewSpy.mockReturnValue(24000);

    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<StatsScreen />);
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ componentName: 'FirstRunOnboardingCard' })).toHaveLength(0);

    const summary = root.findByProps({ componentName: 'StatsSummaryGrid' });
    expect(summary.props.overallYearSavedTotal).toBe(300);
    expect(summary.props.overallYearIncomeTotal).toBe(120000);
    expect(summary.props.overallYearSavingsRate).toBe(0.25);
    expect(summary.props.targetSavedAmount).toBe(24000);

    act(() => {
      root.findByProps({ componentName: 'StatsSelectionCard' }).props.onSelectGoal('all');
      root.findByProps({ componentName: 'StatsYearListCard' }).props.onSelectYear(2025);
    });

    expect(setSelectedGoalIdSpy).toHaveBeenCalledWith('all');
    expect(setSelectedYearSpy).toHaveBeenCalledWith(2025);
  });

  it('hides monthly stats when a one-time goal is selected', () => {
    const oneTimeGoal = {
      id: 'goal-ot-1',
      name: 'Vacation Fund',
      nickname: '',
      origin: '',
      cadence: 'monthly',
      isRecurring: false,
      recurringState: 'month',
      targetAmount: 1500,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    fixture.shouldShowOnboarding = false;
    fixture.appData = {
      goals: [oneTimeGoal],
      progressEvents: [
        {
          id: 'event-1',
          goalId: 'goal-ot-1',
          amount: 300,
          eventDate: '2026-03-10T00:00:00.000Z',
          source: 'manual',
          createdAt: '2026-03-10T00:00:00.000Z',
        },
      ],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.2,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 10000,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: true,
        logoTapCount: 0,
      },
    };

    fixture.statsData = {
      goals: fixture.appData.goals,
      selection: {
        selectedGoalId: 'goal-ot-1',
        setSelectedGoalId: setSelectedGoalIdSpy,
        selectedYear: 2026,
        setSelectedYear: setSelectedYearSpy,
        effectiveSelectedGoalId: 'goal-ot-1',
        showAllGoals: false,
        selectedGoal: oneTimeGoal,
      },
      totals: {
        totalSavedAllTime: 300,
        totalsByYear: [{ year: 2026, total: 300 }],
        effectiveSelectedYear: 2026,
        selectedYearTotal: 300,
      },
      history: {
        filteredEvents: fixture.appData.progressEvents,
        goalNameById: new Map([['goal-ot-1', 'Vacation Fund']]),
        monthlyStats: {
          averageSavedPerMonth: 300,
          medianSavedPerMonth: 300,
          bestMonth: { month: '2026-03', total: 300 },
          weakestMonth: { month: '2026-03', total: 300 },
        },
      },
    };

    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<StatsScreen />);
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ componentName: 'StatsMonthlyChartCard' })).toHaveLength(0);
  });
});
