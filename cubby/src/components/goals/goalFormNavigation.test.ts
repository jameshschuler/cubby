import { describe, expect, it } from '@jest/globals';

import { getGoalFormNavigationConfig } from './goalFormNavigation';

describe('getGoalFormNavigationConfig', () => {
  it('returns next actions for intermediate steps', () => {
    expect(getGoalFormNavigationConfig(1, 3)).toEqual({
      showBack: false,
      primaryLabel: 'Next',
      isPrimaryActionSave: false,
    });
  });

  it('returns save actions on the final step', () => {
    expect(getGoalFormNavigationConfig(3, 3)).toEqual({
      showBack: true,
      primaryLabel: 'Save Goal',
      isPrimaryActionSave: true,
    });
  });
});
