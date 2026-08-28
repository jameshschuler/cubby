import { fireEvent, render } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockAddGoal = jest.fn();
const mockRouterBack = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ back: mockRouterBack }),
}));
jest.mock('lucide-react-native', () => ({ X: () => null }));
jest.mock('../core/app-data-context', () => ({ useAppData: () => ({ addGoal: mockAddGoal }) }));

import AddGoalModal from './AddGoalModal';

describe('AddGoalModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the wizard on step 1 when required basics are invalid', () => {
    const screen = render(<AddGoalModal />);

    fireEvent.press(screen.getByText('Next'));

    expect(screen.getByText('Account name is required.')).toBeTruthy();
    expect(screen.getByText('Target amount must be greater than 0.')).toBeTruthy();
    expect(mockAddGoal).not.toHaveBeenCalled();
  });

  it('saves a recurring goal with automatic contribution details', () => {
    const screen = render(<AddGoalModal />);

    fireEvent.changeText(screen.getByPlaceholderText('Account name'), 'Vacation Fund');
    fireEvent.changeText(screen.getByPlaceholderText('Target amount'), '2500');
    fireEvent.press(screen.getByText('Next'));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Enable automatic contribution' }));
    fireEvent.changeText(screen.getByPlaceholderText('Automatic amount each month'), '125');
    fireEvent.changeText(screen.getByPlaceholderText('Day of month'), '15');
    fireEvent.press(screen.getByText('Next'));
    fireEvent.changeText(screen.getByPlaceholderText('Institution (Ally, Fidelity...)'), 'Ally');
    fireEvent.press(screen.getByText('Save Goal'));

    expect(mockAddGoal).toHaveBeenCalledWith(
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
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('saves a one-time goal without automatic contribution data', () => {
    const screen = render(<AddGoalModal />);

    fireEvent.changeText(screen.getByPlaceholderText('Account name'), 'Car Repair');
    fireEvent.changeText(screen.getByPlaceholderText('Target amount'), '900');
    fireEvent.press(screen.getByRole('button', { name: 'Set goal type to one time' }));
    fireEvent.press(screen.getByText('Next'));
    fireEvent.press(screen.getByText('Save Goal'));

    expect(mockAddGoal).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Car Repair',
        targetAmount: 900,
        autoContributionAmount: undefined,
        autoContributionAnchor: undefined,
        isRecurring: false,
        recurringState: 'month',
      })
    );
  });
});
