import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { addGoalSpy, routerBackSpy } = vi.hoisted(() => ({
  addGoalSpy: vi.fn(),
  routerBackSpy: vi.fn(),
}));

vi.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    back: routerBackSpy,
  }),
}));

vi.mock('../core/app-data-context', () => ({
  useAppData: () => ({
    addGoal: addGoalSpy,
  }),
}));

vi.mock('react-native', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) =>
      React.createElement('mock-node', { componentName: name, ...props, ref }, children)
    );

  return {
    Keyboard: {
      dismiss: vi.fn(),
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

vi.mock('../components/goals/GoalFormHeader', () => ({
  default: ({ onDismiss }: { onDismiss: () => void }) => (
    <mock-node componentName="GoalFormHeader" onDismiss={onDismiss} />
  ),
}));

vi.mock('../components/goals/GoalFormStepper', () => ({
  default: ({ currentStep }: { currentStep: number }) => (
    <mock-node componentName="GoalFormStepper" currentStep={currentStep} />
  ),
}));

vi.mock('../components/ui/OptionPicker', () => ({
  default: ({
    value,
    onValueChange,
  }: {
    value: string;
    onValueChange: (value: string) => void;
  }) => <mock-node componentName="OptionPicker" value={value} onValueChange={onValueChange} />,
}));

import AddGoalModal from './AddGoalModal';

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

function findPressableByText(root: ReturnType<typeof create>['root'], text: string) {
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

function findInputByPlaceholder(root: ReturnType<typeof create>['root'], placeholder: string) {
  return root.find(
    (node: any) =>
      node.props?.componentName === 'TextInput' && node.props?.placeholder === placeholder
  );
}

function hasText(root: ReturnType<typeof create>['root'], text: string) {
  const textNodes = root.findAll((node: any) => node.props?.componentName === 'Text');
  return textNodes.some((node: any) => collectTextFromNode(node).includes(text));
}

function getCurrentStep(root: ReturnType<typeof create>['root']) {
  return root.findByProps({ componentName: 'GoalFormStepper' }).props.currentStep;
}

describe('AddGoalModal', () => {
  beforeEach(() => {
    addGoalSpy.mockReset();
    routerBackSpy.mockReset();
  });

  it('keeps the wizard on step 1 when required basics are invalid', () => {
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<AddGoalModal />);
    });

    const root = renderer!.root;
    expect(getCurrentStep(root)).toBe(1);

    act(() => {
      findPressableByText(root, 'Next').props.onPress();
    });

    expect(getCurrentStep(root)).toBe(1);
    expect(hasText(root, 'Account name is required.')).toBe(true);
    expect(hasText(root, 'Target amount must be greater than 0.')).toBe(true);
    expect(addGoalSpy).not.toHaveBeenCalled();
  });

  it('saves a recurring goal with automatic contribution details', () => {
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<AddGoalModal />);
    });

    const root = renderer!.root;

    act(() => {
      findInputByPlaceholder(root, 'Account name').props.onChangeText('Vacation Fund');
      findInputByPlaceholder(root, 'Target amount').props.onChangeText('2500');
    });

    act(() => {
      findPressableByText(root, 'Next').props.onPress();
    });
    expect(getCurrentStep(root)).toBe(2);

    act(() => {
      root.findByProps({ accessibilityLabel: 'Enable automatic contribution' }).props.onPress();
    });

    act(() => {
      findInputByPlaceholder(root, 'Automatic amount each month').props.onChangeText('125');
      findInputByPlaceholder(root, 'Day of month').props.onChangeText('15');
    });

    act(() => {
      findPressableByText(root, 'Next').props.onPress();
    });
    expect(getCurrentStep(root)).toBe(3);

    act(() => {
      findInputByPlaceholder(root, 'Institution (Ally, Fidelity...)').props.onChangeText('Ally');
    });

    act(() => {
      findPressableByText(root, 'Save Goal').props.onPress();
    });

    expect(addGoalSpy).toHaveBeenCalledTimes(1);
    expect(addGoalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Vacation Fund',
        origin: 'Ally',
        targetAmount: 2500,
        autoContributionAmount: 125,
        autoContributionAnchor: '15',
        isRecurring: true,
        recurringState: 'month',
      })
    );
    expect(routerBackSpy).toHaveBeenCalledTimes(1);
  });

  it('saves a one-time goal without automatic contribution data', () => {
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<AddGoalModal />);
    });

    const root = renderer!.root;

    act(() => {
      findInputByPlaceholder(root, 'Account name').props.onChangeText('Car Repair');
      findInputByPlaceholder(root, 'Target amount').props.onChangeText('900');
      root.findByProps({ accessibilityLabel: 'Set goal type to one time' }).props.onPress();
    });

    act(() => {
      findPressableByText(root, 'Next').props.onPress();
    });

    expect(getCurrentStep(root)).toBe(3);

    act(() => {
      findPressableByText(root, 'Save Goal').props.onPress();
    });

    expect(addGoalSpy).toHaveBeenCalledTimes(1);
    expect(addGoalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Car Repair',
        targetAmount: 900,
        autoContributionAmount: undefined,
        autoContributionAnchor: undefined,
        isRecurring: false,
      })
    );
  });
});
