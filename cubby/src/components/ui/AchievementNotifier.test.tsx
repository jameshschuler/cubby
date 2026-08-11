import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AchievementId } from '../../helpers/achievements';

const { pushSpy, vibrateSpy, getItemSpy, setItemSpy } = vi.hoisted(() => ({
  pushSpy: vi.fn(),
  vibrateSpy: vi.fn(),
  getItemSpy: vi.fn(),
  setItemSpy: vi.fn(),
}));

const fixture = vi.hoisted(() => ({
  data: {
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
  },
  isReady: true,
  statuses: {} as Record<AchievementId, boolean>,
}));

function buildStatuses(overrides: Partial<Record<AchievementId, boolean>> = {}) {
  return {
    'first-goal': false,
    'first-deposit': false,
    'profile-complete': false,
    planner: false,
    'quarter-tank': false,
    'halfway-there': false,
    'goal-crushed': false,
    'on-a-roll': false,
    'weekly-streak': false,
    'first-1000': false,
    'goal-builder': false,
    'over-target': false,
    nice: false,
    'logo-tap': false,
    'all-base-achievements': false,
    'all-secret-achievements': false,
    ...overrides,
  };
}

vi.mock('expo-router', () => ({
  router: {
    push: pushSpy,
  },
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: getItemSpy,
    setItem: setItemSpy,
  },
}));

vi.mock('../../core/app-data-context', () => ({
  useAppData: () => ({
    data: fixture.data,
    isReady: fixture.isReady,
  }),
}));

vi.mock('../../helpers/achievements', async () => {
  const actual = await vi.importActual<typeof import('../../helpers/achievements')>(
    '../../helpers/achievements'
  );

  return {
    ...actual,
    getAchievementStatuses: () => fixture.statuses,
  };
});

vi.mock('react-native', async () => {
  const React = await import('react');

  class MockAnimatedValue {
    value: number;

    constructor(value: number) {
      this.value = value;
    }

    setValue(next: number) {
      this.value = next;
    }
  }

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) =>
      React.createElement('mock-node', { componentName: name, ...props, ref }, children)
    );

  const animatedView = createHostComponent('AnimatedView');

  return {
    Animated: {
      Value: MockAnimatedValue,
      View: animatedView,
      timing: () => ({
        start: (cb?: () => void) => cb?.(),
      }),
      parallel: () => ({
        start: (cb?: () => void) => cb?.(),
      }),
    },
    Easing: {
      in: (v: unknown) => v,
      out: (v: unknown) => v,
      quad: 'quad',
      cubic: 'cubic',
    },
    Platform: {
      OS: 'ios',
    },
    Pressable: createHostComponent('Pressable'),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
    Text: createHostComponent('Text'),
    Vibration: {
      vibrate: vibrateSpy,
    },
    View: createHostComponent('View'),
  };
});

import AchievementNotifier from './AchievementNotifier';

function collectText(node: any): string {
  if (typeof node === 'string') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(collectText).join('');
  }

  if (!node || !node.children) {
    return '';
  }

  return node.children.map(collectText).join('');
}

describe('AchievementNotifier', () => {
  beforeEach(() => {
    pushSpy.mockReset();
    vibrateSpy.mockReset();
    getItemSpy.mockReset();
    setItemSpy.mockReset();

    getItemSpy.mockResolvedValue(null);
    setItemSpy.mockResolvedValue(undefined);

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
    fixture.isReady = true;
    fixture.statuses = buildStatuses();
  });

  it('renders a toast when an achievement is newly unlocked', async () => {
    let renderer: ReturnType<typeof create>;

    await act(async () => {
      renderer = create(<AchievementNotifier />);
      await Promise.resolve();
    });

    fixture.statuses = buildStatuses({ 'first-goal': true });
    fixture.data = { ...fixture.data };

    await act(async () => {
      renderer!.update(<AchievementNotifier />);
      await Promise.resolve();
    });

    const toastText = collectText(renderer!.toJSON());
    expect(toastText).toContain('Achievement Unlocked');
    expect(toastText).toContain('First Goal');
    expect(vibrateSpy).toHaveBeenCalledWith(18);
  });

  it('navigates to achievements when pressing the view button', async () => {
    let renderer: ReturnType<typeof create>;

    await act(async () => {
      renderer = create(<AchievementNotifier />);
      await Promise.resolve();
    });

    fixture.statuses = buildStatuses({ 'first-goal': true });
    fixture.data = { ...fixture.data };

    await act(async () => {
      renderer!.update(<AchievementNotifier />);
      await Promise.resolve();
    });

    act(() => {
      renderer!.root.findByProps({ accessibilityLabel: 'View achievements' }).props.onPress();
    });

    expect(pushSpy).toHaveBeenCalledWith('/(tabs)/achievements');
  });

  it('does not notify again for achievements already saved in AsyncStorage', async () => {
    getItemSpy.mockResolvedValue(JSON.stringify(['first-goal']));
    let renderer: ReturnType<typeof create>;

    await act(async () => {
      renderer = create(<AchievementNotifier />);
      await Promise.resolve();
    });

    fixture.statuses = buildStatuses({ 'first-goal': true });
    fixture.data = { ...fixture.data };

    await act(async () => {
      renderer!.update(<AchievementNotifier />);
      await Promise.resolve();
    });

    expect(renderer!.toJSON()).toBeNull();
  });
});
