import { act, fireEvent, render } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Alert } from 'react-native';

const mockRouterBack = jest.fn();
const mockExportJson = jest.fn<() => Promise<void>>();
const mockSaveIncomeSettings = jest.fn();
const mockSaveSavingsTargetSettings = jest.fn();
const mockAlert = jest.fn();

jest.mock('expo-router', () => ({ router: { back: () => mockRouterBack() } }));
jest.mock('lucide-react-native', () => ({
  Download: () => null,
  Goal: () => null,
  X: () => null,
}));
jest.mock('../core/app-data-context', () => ({
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
    exportJson: mockExportJson,
    saveIncomeSettings: mockSaveIncomeSettings,
    saveSavingsTargetSettings: mockSaveSavingsTargetSettings,
  }),
}));

import SettingsScreen from './SettingsScreen';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExportJson.mockResolvedValue(undefined);
    jest.spyOn(Alert, 'alert').mockImplementation(mockAlert);
  });

  it('closes settings from the close button', () => {
    const screen = render(<SettingsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Close settings' }));

    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('alerts when exporting data fails', async () => {
    mockExportJson.mockRejectedValueOnce(new Error('no permission'));
    const screen = render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Export JSON'));
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockExportJson).toHaveBeenCalledTimes(1);
    expect(mockAlert).toHaveBeenCalledWith(
      'Export failed',
      'Could not export JSON data from this device.'
    );
  });

  it('saves income and a yearly savings target', () => {
    const screen = render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Income'));
    fireEvent.changeText(screen.getByPlaceholderText('Income amount'), '120000');
    fireEvent.press(screen.getByText('Yearly'));
    fireEvent.press(screen.getByText('Save Income'));

    expect(mockSaveIncomeSettings).toHaveBeenCalledWith(120000, 'yearly');

    fireEvent.press(screen.getByText('Savings Target'));
    fireEvent.press(screen.getByText('Yearly goal'));
    fireEvent.changeText(screen.getByPlaceholderText('Yearly savings goal'), '36000');
    fireEvent.press(screen.getByText('Save Target'));

    expect(mockSaveSavingsTargetSettings).toHaveBeenCalledWith('yearly-goal', 36000);
  });
});
