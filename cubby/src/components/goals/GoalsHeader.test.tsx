import { act, create } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) => {
      const element = React.createElement(name, { ...props, ref });
      return React.createElement('mock-node', { type: name, props }, children);
    });

  return {
    Image: createHostComponent('Image'),
    Pressable: createHostComponent('Pressable'),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

vi.mock('lucide-react-native', () => ({
  Plus: () => null,
}));

import GoalsHeader from './GoalsHeader';

function collectText(node: any): string[] {
  if (!node) {
    return [];
  }

  if (typeof node === 'string') {
    return [node];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => collectText(child));
  }

  const children = Array.isArray(node.children) ? node.children : [];
  const textValues = children.flatMap((child: any) => collectText(child));

  if (typeof node.props?.children === 'string') {
    return [...textValues, node.props.children];
  }

  if (Array.isArray(node.props?.children)) {
    return [...textValues, ...collectText(node.props.children)];
  }

  return textValues;
}

describe('GoalsHeader', () => {
  it('shows the updated goals subtitle and triggers add goal', () => {
    const onAddGoal = vi.fn();
    let renderer: any;

    act(() => {
      renderer = create(<GoalsHeader onAddGoal={onAddGoal} />);
    });

    const textContent = collectText(renderer!.toJSON());

    expect(textContent).toContain('Goals');
    expect(textContent).toContain('Create, organize, and update every savings goal in one place.');

    act(() => {
      renderer!.root.findByProps({ accessibilityLabel: 'Add goal' }).props.onPress();
    });

    expect(onAddGoal).toHaveBeenCalledTimes(1);
  });
});
