import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

jest.mock('lucide-react-native', () => ({
  SlidersHorizontal: () => null,
}));

import HomeHeader from './HomeHeader';

describe('HomeHeader', () => {
  it('renders the subtitle and triggers the header actions', () => {
    const onLogoPress = jest.fn();
    const onSettingsPress = jest.fn();
    const screen = render(
      <HomeHeader
        subtitle="One-time goal balances"
        onLogoPress={onLogoPress}
        onSettingsPress={onSettingsPress}
      />
    );

    expect(screen.getByText('Cubby')).toBeTruthy();
    expect(screen.getByText('One-time goal balances')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));
    fireEvent.press(screen.getByRole('button', { name: 'App logo' }));

    expect(onSettingsPress).toHaveBeenCalledTimes(1);
    expect(onLogoPress).toHaveBeenCalledTimes(1);
  });
});
