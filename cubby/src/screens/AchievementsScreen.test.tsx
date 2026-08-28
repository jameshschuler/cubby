import { render } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockFixture = {
  statuses: { 'first-goal': false, 'logo-tap': false } as Record<string, boolean>,
};

jest.mock('lucide-react-native', () => ({ Lock: () => null }));
jest.mock('../constants/achievement-constants', () => ({
  achievements: [
    {
      id: 'first-goal',
      title: 'First Goal',
      description: 'Create your first savings goal.',
      tier: 1,
      icon: () => null,
    },
    {
      id: 'logo-tap',
      title: 'Boop',
      description: 'Tap the Cubby logo.',
      hidden: true,
      icon: () => null,
    },
  ],
}));
jest.mock('../core/app-data-context', () => ({ useAppData: () => ({ data: {} }) }));
jest.mock('../helpers/achievements', () => ({
  getAchievementStatuses: () => mockFixture.statuses,
}));

import AchievementsScreen from './AchievementsScreen';

describe('AchievementsScreen', () => {
  beforeEach(() => {
    mockFixture.statuses = { 'first-goal': false, 'logo-tap': false };
  });

  it('masks hidden achievements until they are earned', () => {
    const screen = render(<AchievementsScreen />);

    expect(screen.getByText('Hidden Achievement')).toBeTruthy();
    expect(screen.queryByText('Boop')).toBeNull();
  });

  it('reveals hidden achievement details once earned', () => {
    mockFixture.statuses = { 'first-goal': false, 'logo-tap': true };
    const screen = render(<AchievementsScreen />);

    expect(screen.getByText('Boop')).toBeTruthy();
    expect(screen.getByText('Tap the Cubby logo.')).toBeTruthy();
  });
});
