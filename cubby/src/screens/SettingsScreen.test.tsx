import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { backSpy, alertSpy, exportJsonSpy, saveIncomeSettingsSpy, saveSavingsTargetSettingsSpy } =
  vi.hoisted(() => ({
    backSpy: vi.fn(),
    alertSpy: vi.fn(),
    exportJsonSpy: vi.fn(),
    saveIncomeSettingsSpy: vi.fn(),
    saveSavingsTargetSettingsSpy: vi.fn(),
  }));

vi.mock('expo-router', () => ({
  router: {
    back: backSpy,
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

vi.mock('lucide-react-native', () => ({
  Download: () => null,
  Goal: () => null,
  X: () => null,
}));

vi.mock('../core/app-data-context', () => ({
  useAppData: () => ({
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
    exportJson: exportJsonSpy,
    saveIncomeSettings: saveIncomeSettingsSpy,
    saveSavingsTargetSettings: saveSavingsTargetSettingsSpy,
  }),
}));

vi.mock('../components/settings/SettingsCard', () => ({
  default: ({ title, onPress, children }: any) => (
    <mock-node componentName="SettingsCard" title={title} onPress={onPress}>
      {children}
    </mock-node>
  ),
}));

vi.mock('../components/settings/SettingsModalShell', () => ({
  default: ({ title, visible, onClose, children }: any) =>
    visible ? (
      <mock-node componentName="SettingsModalShell" title={title} onClose={onClose}>
        {children}
      </mock-node>
    ) : null,
}));

vi.mock('react-native', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) =>
      React.createElement('mock-node', { componentName: name, ...props, ref }, children)
    );

  return {
    Alert: {
      alert: alertSpy,
    },
    Pressable: createHostComponent('Pressable'),
    SafeAreaView: createHostComponent('SafeAreaView'),
    ScrollView: createHostComponent('ScrollView'),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
    Text: createHostComponent('Text'),
    TextInput: createHostComponent('TextInput'),
    View: createHostComponent('View'),
  };
});

import SettingsScreen from './SettingsScreen';

function collectTextFromNode(node: any): string {
  if (typeof node === 'string') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(collectTextFromNode).join('');
  }

  if (!node || !node.children) {
    return '';
  }

  return node.children.map(collectTextFromNode).join('');
}

function findPressableByText(root: any, text: string) {
  const pressables = root.findAll(
    (node: any) =>
      node.props?.componentName === 'Pressable' && typeof node.props?.onPress === 'function'
  );

  const matched = pressables.find((node: any) => collectTextFromNode(node).includes(text));
  if (!matched) {
    throw new Error(`Pressable with text "${text}" not found`);
  }

  return matched;
}

function findInputByPlaceholder(root: any, placeholder: string) {
  return root.find(
    (node: any) =>
      node.props?.componentName === 'TextInput' && node.props?.placeholder === placeholder
  );
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    backSpy.mockReset();
    alertSpy.mockReset();
    exportJsonSpy.mockReset();
    saveIncomeSettingsSpy.mockReset();
    saveSavingsTargetSettingsSpy.mockReset();
  });

  it('closes the modal screen from the hero close button', () => {
    let renderer: any;

    act(() => {
      renderer = create(<SettingsScreen />);
    });

    act(() => {
      renderer!.root.findByProps({ accessibilityLabel: 'Close settings' }).props.onPress();
    });

    expect(backSpy).toHaveBeenCalledTimes(1);
  });

  it('alerts when export fails', async () => {
    exportJsonSpy.mockRejectedValueOnce(new Error('no permission'));
    let renderer: any;

    await act(async () => {
      renderer = create(<SettingsScreen />);
    });

    await act(async () => {
      findPressableByText(renderer!.root, 'Export JSON').props.onPress();
    });

    expect(exportJsonSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(
      'Export failed',
      'Could not export JSON data from this device.'
    );
  });

  it('saves income and yearly-goal target from the modal forms', () => {
    let renderer: any;

    act(() => {
      renderer = create(<SettingsScreen />);
    });

    const root = renderer!.root;

    act(() => {
      root.findByProps({ componentName: 'SettingsCard', title: 'Income' }).props.onPress();
    });

    act(() => {
      findInputByPlaceholder(root, 'Income amount').props.onChangeText('120000');
    });
    act(() => {
      findPressableByText(root, 'Yearly').props.onPress();
    });
    act(() => {
      findPressableByText(root, 'Save Income').props.onPress();
    });

    expect(saveIncomeSettingsSpy).toHaveBeenCalledWith(120000, 'yearly');

    act(() => {
      root.findByProps({ componentName: 'SettingsCard', title: 'Savings Target' }).props.onPress();
    });

    act(() => {
      findPressableByText(root, 'Yearly goal').props.onPress();
    });
    act(() => {
      findInputByPlaceholder(root, 'Yearly savings goal').props.onChangeText('36000');
    });
    act(() => {
      findPressableByText(root, 'Save Target').props.onPress();
    });

    expect(saveSavingsTargetSettingsSpy).toHaveBeenCalledWith('yearly-goal', 36000);
  });
});
