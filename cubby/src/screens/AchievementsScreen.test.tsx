import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createElement, forwardRef } from 'react';
import type { ForwardedRef, ReactNode } from 'react';

import type { AppData } from '../core/types';

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
  } as AppData,
  statuses: {
    'first-goal': false,
    planner: false,
    'logo-tap': false,
  } as Record<string, boolean>,
}));

type MockComponentProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('react-native-safe-area-context', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: MockComponentProps, ref: ForwardedRef<unknown>) =>
      React.createElement('mock-node', { componentName: name, ...props, ref }, children)
    );

  return {
    SafeAreaView: createHostComponent('SafeAreaView'),
  };
});

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
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

vi.mock('lucide-react-native', () => ({
  Lock: (props: MockComponentProps) => <mock-node componentName="LockIcon" {...props} />,
}));

vi.mock('react-native-svg', () => ({
  default: ({ children, ...props }: MockComponentProps) => (
    <mock-node componentName="Svg" {...props}>
      {children}
    </mock-node>
  ),
  Circle: ({ children, ...props }: MockComponentProps) => (
    <mock-node componentName="SvgCircle" {...props}>
      {children}
    </mock-node>
  ),
}));

vi.mock('../constants/achievement-constants', () => ({
  achievements: [
    {
      id: 'first-goal',
      title: 'First Goal',
      description: 'Create your first savings goal.',
      tier: 1,
      icon: (props: MockComponentProps) => <mock-node componentName="FirstGoalIcon" {...props} />,
    },
    {
      id: 'planner',
      title: 'Planner',
      description: 'Configure automatic contributions on one goal.',
      icon: (props: MockComponentProps) => <mock-node componentName="PlannerIcon" {...props} />,
    },
    {
      id: 'logo-tap',
      title: 'Boop',
      description: 'Tap the Cubby logo.',
      hidden: true,
      icon: (props: MockComponentProps) => <mock-node componentName="BoopIcon" {...props} />,
    },
  ],
}));

vi.mock('../core/app-data-context', () => ({
  useAppData: () => ({
    data: fixture.data,
  }),
}));

vi.mock('../helpers/achievements', () => ({
  getAchievementStatuses: () => fixture.statuses,
}));

import AchievementsScreen from './AchievementsScreen';

function collectText(node: unknown): string {
  if (typeof node === 'string') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child) => collectText(child)).join('');
  }

  if (!node || typeof node !== 'object' || !('children' in node)) {
    return '';
  }

  const candidate = node as { children?: unknown[] };
  return candidate.children?.map((child) => collectText(child)).join('') ?? '';
}

describe('AchievementsScreen', () => {
  beforeEach(() => {
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
    fixture.statuses = {
      'first-goal': false,
      planner: false,
      'logo-tap': false,
    };
  });

  it('shows completion counts and keeps hidden achievements masked while locked', () => {
    fixture.statuses = {
      'first-goal': true,
      planner: true,
      'logo-tap': false,
    };

    let renderer: any;

    act(() => {
      renderer = create(<AchievementsScreen />);
    });

    const root = renderer!.root;
    const text = collectText(renderer!.toJSON());

    expect(text).toContain('2 of 3 complete');
    expect(text).toContain('First Goal');
    expect(text).toContain('Tier 1');
    expect(text).toContain('Hidden Achievement');
    expect(text).toContain('Keep contributing to reveal this one.');

    expect(root.findAllByProps({ componentName: 'LockIcon' })).toHaveLength(1);
    expect(root.findAllByProps({ componentName: 'BoopIcon' })).toHaveLength(0);
  });

  it('reveals hidden achievement details once completed', () => {
    fixture.statuses = {
      'first-goal': false,
      planner: false,
      'logo-tap': true,
    };

    let renderer: any;

    act(() => {
      renderer = create(<AchievementsScreen />);
    });

    const root = renderer!.root;
    const text = collectText(renderer!.toJSON());

    expect(text).toContain('1 of 3 complete');
    expect(text).toContain('Boop');
    expect(text).toContain('Tap the Cubby logo.');
    expect(text).not.toContain('Hidden Achievement');

    expect(root.findAllByProps({ componentName: 'BoopIcon' })).toHaveLength(1);
    expect(root.findAllByProps({ componentName: 'LockIcon' })).toHaveLength(0);
  });
});
