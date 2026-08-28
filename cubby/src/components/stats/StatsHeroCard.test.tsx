import { render } from '@testing-library/react-native';
import { describe, expect, it } from '@jest/globals';

import StatsHeroCard from './StatsHeroCard';

describe('StatsHeroCard', () => {
  it('shows the stats subtitle', () => {
    const screen = render(<StatsHeroCard />);

    expect(screen.getByText('Stats')).toBeTruthy();
    expect(
      screen.getByText('Review savings totals, yearly progress, and monthly trends.')
    ).toBeTruthy();
  });
});
