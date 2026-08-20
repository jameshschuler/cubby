import { act, create } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
  const React = await import('react');

  const createHostComponent = (name: string) =>
    React.forwardRef(({ children, ...props }: any, ref) =>
      React.createElement('mock-node', { type: name, props }, children)
    );

  return {
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

import StatsHeroCard from './StatsHeroCard';

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

describe('StatsHeroCard', () => {
  it('shows the updated stats subtitle', () => {
    let renderer: any;

    act(() => {
      renderer = create(<StatsHeroCard />);
    });

    const textContent = collectText(renderer!.toJSON());

    expect(textContent).toContain('Stats');
    expect(textContent).toContain('Review savings totals, yearly progress, and monthly trends.');
  });
});
