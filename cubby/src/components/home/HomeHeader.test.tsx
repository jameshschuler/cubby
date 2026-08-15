import { act, create } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) =>
      React.createElement('mock-node', { type: name, props }, children)
    );

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
  SlidersHorizontal: () => null,
}));

vi.mock('../../../assets/icon.png', () => ({ default: 1 }));

import HomeHeader from './HomeHeader';

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

describe('HomeHeader', () => {
  it('renders the subtitle and triggers the header actions', () => {
    const onLogoPress = vi.fn();
    const onSettingsPress = vi.fn();
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(
        <HomeHeader
          subtitle="One-time goal balances"
          onLogoPress={onLogoPress}
          onSettingsPress={onSettingsPress}
        />
      );
    });

    const textContent = collectText(renderer!.toJSON());

    expect(textContent).toContain('Cubby');
    expect(textContent).toContain('One-time goal balances');

    act(() => {
      renderer!.root.findByProps({ accessibilityLabel: 'Open settings' }).props.onPress();
    });
    expect(onSettingsPress).toHaveBeenCalledTimes(1);

    act(() => {
      renderer!.root.findByProps({ accessibilityLabel: 'App logo' }).props.onPress();
    });
    expect(onLogoPress).toHaveBeenCalledTimes(1);
  });
});
