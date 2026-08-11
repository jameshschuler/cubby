import {
  Award,
  BadgeCheck,
  CalendarCheck2,
  CircleDollarSign,
  Gauge,
  Goal,
  PiggyBank,
  Pencil,
  Plus,
  Settings2,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
} from 'lucide-react-native';

import type { AchievementId } from '../helpers/achievements';

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  tier?: 1;
  icon: any;
  hidden?: boolean;
};

export const achievements: AchievementDefinition[] = [
  {
    id: 'first-goal',
    title: 'First Goal',
    description: 'Create your first savings goal.',
    tier: 1,
    icon: Target,
  },
  {
    id: 'first-deposit',
    title: 'First Deposit',
    description: 'Log your first contribution.',
    tier: 1,
    icon: CircleDollarSign,
  },
  {
    id: 'profile-complete',
    title: 'Profile Complete',
    description: 'Set income and savings target settings.',
    icon: UserCheck,
  },
  {
    id: 'planner',
    title: 'Planner',
    description: 'Configure automatic contributions on one goal.',
    tier: 1,
    icon: Settings2,
  },
  {
    id: 'quarter-tank',
    title: 'Quarter Tank',
    description: 'Reach 25% progress on any goal.',
    tier: 1,
    icon: Gauge,
  },
  {
    id: 'halfway-there',
    title: 'Halfway There',
    description: 'Reach 50% progress on any goal.',
    tier: 1,
    icon: Goal,
  },
  {
    id: 'goal-crushed',
    title: 'Goal Crushed',
    description: 'Complete a goal.',
    tier: 1,
    icon: Trophy,
  },
  {
    id: 'on-a-roll',
    title: 'Three Logs',
    description: 'Log 3 manual contributions.',
    tier: 1,
    icon: Pencil,
  },
  {
    id: 'weekly-streak',
    title: 'Monthly Check-In',
    description: 'Log a manual contribution in 3 consecutive months.',
    tier: 1,
    icon: CalendarCheck2,
  },
  {
    id: 'first-1000',
    title: 'First 1000',
    description: 'Save $1,000 total across all goals.',
    tier: 1,
    icon: Award,
  },
  {
    id: 'goal-builder',
    title: 'Goal Builder',
    description: 'Create 3 goals.',
    tier: 1,
    icon: Plus,
  },
  {
    id: 'over-target',
    title: 'Over Target',
    description: 'Contribute more than 100% to any goal.',
    tier: 1,
    icon: TrendingUp,
  },
  {
    id: 'nice',
    title: 'Nice',
    description: 'Contribute exactly $69 to any goal.',
    icon: Star,
    hidden: true,
  },
  {
    id: 'logo-tap',
    title: 'Boop',
    description: 'Tap the Cubby logo.',
    icon: PiggyBank,
    hidden: true,
  },
  {
    id: 'all-base-achievements',
    title: 'Base Camp',
    description: 'Earn every base achievement.',
    icon: BadgeCheck,
    hidden: true,
  },
  {
    id: 'all-secret-achievements',
    title: 'Full Set',
    description: 'Earn every secret achievement.',
    icon: BadgeCheck,
    hidden: true,
  },
];
