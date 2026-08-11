import { describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react-native', () => ({
  Award: 'Award',
  BadgeCheck: 'BadgeCheck',
  CalendarCheck2: 'CalendarCheck2',
  CircleDollarSign: 'CircleDollarSign',
  Gauge: 'Gauge',
  Goal: 'Goal',
  PiggyBank: 'PiggyBank',
  Pencil: 'Pencil',
  Plus: 'Plus',
  Settings2: 'Settings2',
  Star: 'Star',
  Target: 'Target',
  TrendingUp: 'TrendingUp',
  Trophy: 'Trophy',
  UserCheck: 'UserCheck',
}));

import { achievements } from './achievement-constants';

describe('achievement-constants', () => {
  it('keeps profile-complete and secret achievements tierless', () => {
    const tierlessIds = [
      'profile-complete',
      'nice',
      'logo-tap',
      'all-base-achievements',
      'all-secret-achievements',
    ] as const;

    for (const id of tierlessIds) {
      const achievement = achievements.find((entry) => entry.id === id);

      expect(achievement?.id).toBe(id);
      expect(achievement?.tier).toBeUndefined();

      if (id === 'profile-complete') {
        expect(achievement?.hidden).toBeUndefined();
        continue;
      }

      expect(achievement?.hidden).toBe(true);
    }
  });

  it('keeps the base achievements tiered', () => {
    const tieredIds = [
      'first-goal',
      'first-deposit',
      'planner',
      'quarter-tank',
      'halfway-there',
      'goal-crushed',
      'on-a-roll',
      'weekly-streak',
      'first-1000',
      'goal-builder',
      'over-target',
    ] as const;

    for (const id of tieredIds) {
      expect(achievements.find((achievement) => achievement.id === id)?.tier).toBe(1);
    }
  });
});
