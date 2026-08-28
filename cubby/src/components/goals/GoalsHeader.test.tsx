import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

jest.mock('lucide-react-native', () => ({
  Plus: () => null,
}));

import GoalsHeader from './GoalsHeader';

describe('GoalsHeader', () => {
  it('shows the goals subtitle and triggers add goal', () => {
    const onAddGoal = jest.fn();
    const screen = render(<GoalsHeader onAddGoal={onAddGoal} />);

    expect(screen.getByText('Goals')).toBeTruthy();
    expect(
      screen.getByText('Create, organize, and update every savings goal in one place.')
    ).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Add goal' }));

    expect(onAddGoal).toHaveBeenCalledTimes(1);
  });
});
