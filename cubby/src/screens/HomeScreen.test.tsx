import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { alertSpy, pushSpy, replaceGoalProgressSpy, setDefaultViewSpy, registerLogoTapSpy } =
  vi.hoisted(() => ({
    alertSpy: vi.fn(),
    pushSpy: vi.fn(),
    replaceGoalProgressSpy: vi.fn(),
    setDefaultViewSpy: vi.fn(),
    registerLogoTapSpy: vi.fn(),
  }));

vi.mock('react-native', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) =>
      React.createElement('mock-node', { type: name, ref, ...props }, children)
    );

  return {
    Alert: {
      alert: alertSpy,
    },
    SafeAreaView: createHostComponent('SafeAreaView'),
    ScrollView: createHostComponent('ScrollView'),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
  };
});

vi.mock('expo-router', () => ({
  router: {
    push: pushSpy,
  },
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('react-native-safe-area-context', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) =>
      React.createElement('mock-node', { componentName: name, ...props, ref }, children)
    );

  return {
    SafeAreaView: createHostComponent('SafeAreaView'),
  };
});

vi.mock('../helpers/calculations', () => ({
  getGoalProgress: () => 150,
  getSavingsRateForView: () => 0.1,
  getTargetSavedAmountForView: () => 200,
  getViewLabel: () => 'August 2026',
  shiftAnchorDate: (_view: string, current: Date) => current,
}));

vi.mock('../helpers/onboarding', () => ({
  shouldShowOnboarding: () => false,
}));

vi.mock('../core/app-data-context', () => ({
  useAppData: () => ({
    data: {
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
      progressEvents: [],
      settings: {
        defaultView: 'month',
        targetSavingsRate: 0.15,
        savingsTargetMode: 'rate',
        yearlySavingsGoalAmount: 0,
        incomeAmount: 5000,
        incomeFrequency: 'monthly',
        hasCompletedOnboarding: true,
        logoTapCount: 0,
      },
    },
    replaceGoalProgress: replaceGoalProgressSpy,
    setDefaultView: setDefaultViewSpy,
    registerLogoTap: registerLogoTapSpy,
  }),
}));

vi.mock('../components/home/HomeHeader', () => ({
  default: ({ subtitle, onLogoPress, onSettingsPress }: any) => (
    <mock-node
      testID="home-header"
      subtitle={subtitle}
      onLogoPress={onLogoPress}
      onSettingsPress={onSettingsPress}
    />
  ),
}));

vi.mock('../components/home/ViewFilterTabs', () => ({
  default: ({ onSelect }: any) => (
    <mock-node>
      <mock-node testID="select-month" onPress={() => onSelect('month')} />
      <mock-node testID="select-one-time" onPress={() => onSelect('one-time')} />
    </mock-node>
  ),
}));

vi.mock('../components/home/PeriodNavigator', () => ({
  default: ({ label, onPrevious, onNext }: any) => (
    <mock-node testID="period-nav" label={label} onPrevious={onPrevious} onNext={onNext} />
  ),
}));

vi.mock('../components/home/HomeSummaryCard', () => ({
  default: () => <mock-node testID="summary" />,
}));

vi.mock('../components/onboarding/FirstRunOnboardingCard', () => ({
  default: ({ onCreateGoal }: any) => <mock-node testID="onboarding" onCreateGoal={onCreateGoal} />,
}));

vi.mock('../components/home/HomeGoalsCard', () => ({
  default: ({ visibleGoals, onEditActual, onCreateGoal }: any) => (
    <mock-node>
      <mock-node testID="edit-actual" onPress={() => onEditActual(visibleGoals[0])} />
      <mock-node testID="create-goal" onPress={onCreateGoal} />
    </mock-node>
  ),
}));

vi.mock('../components/home/ActualAmountModal', () => ({
  default: ({ visible, amount, onAmountChange, onSave, onCancel }: any) =>
    visible ? (
      <mock-node
        testID="actual-modal"
        amount={amount}
        onAmountChange={onAmountChange}
        onSave={onSave}
        onCancel={onCancel}
      />
    ) : null,
}));

import HomeScreen from './HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    alertSpy.mockReset();
    pushSpy.mockReset();
    replaceGoalProgressSpy.mockReset();
    setDefaultViewSpy.mockReset();
    registerLogoTapSpy.mockReset();
  });

  it('opens settings, handles create-goal actions, and registers logo taps', () => {
    let renderer: any;

    act(() => {
      renderer = create(<HomeScreen />);
    });

    const root = renderer!.root;

    act(() => {
      root.findByProps({ testID: 'home-header' }).props.onSettingsPress();
    });
    expect(pushSpy).toHaveBeenCalledWith('/settings');

    act(() => {
      root.findByProps({ testID: 'home-header' }).props.onLogoPress();
    });
    expect(registerLogoTapSpy).toHaveBeenCalledTimes(1);

    act(() => {
      root.findByProps({ testID: 'create-goal' }).props.onPress();
    });
    expect(pushSpy).toHaveBeenCalledWith('/add-goal');
  });

  it('validates and saves edited actual contribution amounts', () => {
    let renderer: any;

    act(() => {
      renderer = create(<HomeScreen />);
    });

    const root = renderer!.root;

    act(() => {
      root.findByProps({ testID: 'edit-actual' }).props.onPress();
    });

    expect(root.findByProps({ testID: 'actual-modal' }).props.amount).toBe('150');

    act(() => {
      root.findByProps({ testID: 'actual-modal' }).props.onAmountChange('-1');
    });
    act(() => {
      root.findByProps({ testID: 'actual-modal' }).props.onSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Invalid amount',
      'Please enter a valid amount greater than or equal to zero.'
    );
    expect(replaceGoalProgressSpy).not.toHaveBeenCalled();

    act(() => {
      root.findByProps({ testID: 'actual-modal' }).props.onAmountChange('200');
    });
    act(() => {
      root.findByProps({ testID: 'actual-modal' }).props.onSave();
    });

    expect(replaceGoalProgressSpy).toHaveBeenCalledTimes(1);
    expect(replaceGoalProgressSpy).toHaveBeenCalledWith('goal-1', 200, 'month', expect.any(Date));
  });

  it('switches to one-time view without updating the default recurring view setting', () => {
    let renderer: any;

    act(() => {
      renderer = create(<HomeScreen />);
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ testID: 'period-nav' })).toHaveLength(1);

    act(() => {
      root.findByProps({ testID: 'select-one-time' }).props.onPress();
    });

    expect(setDefaultViewSpy).not.toHaveBeenCalled();
    expect(root.findAllByProps({ testID: 'period-nav' })).toHaveLength(0);
  });
});
