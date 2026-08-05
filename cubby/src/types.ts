export type Cadence = 'weekly' | 'monthly' | 'bi-monthly' | 'yearly';

export type GoalCategory = 'short-term savings' | 'long-term savings' | 'investing' | 'other';

export type AccountType =
  | 'hysa'
  | 'individual brokerage'
  | 'roth ira'
  | '401k'
  | '529'
  | 'traditional ira'
  | 'utma'
  | 'hsa'
  | 'fidelity cash management'
  | 'crypto'
  | 'other';

export type ViewPeriod = 'week' | 'month' | 'year';

export type RecurringState = ViewPeriod;

export type GoalDisplayFilter = ViewPeriod | 'one-time';

export type IncomeFrequency = 'monthly' | 'yearly';

export type SavingsTargetMode = 'rate' | 'yearly-goal';

export type ProgressEventSource = 'manual' | 'automatic';

export interface Goal {
  id: string;
  name: string;
  nickname: string;
  origin: string;
  category?: GoalCategory;
  accountType?: AccountType;
  cadence: Cadence;
  isRecurring: boolean;
  recurringState: RecurringState;
  targetAmount: number;
  autoContributionAmount?: number;
  autoContributionAnchor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressEvent {
  id: string;
  goalId: string;
  amount: number;
  eventDate: string;
  note?: string;
  source: ProgressEventSource;
  createdAt: string;
}

export interface UserSettings {
  defaultView: ViewPeriod;
  targetSavingsRate: number;
  savingsTargetMode: SavingsTargetMode;
  yearlySavingsGoalAmount: number;
  incomeAmount: number;
  incomeFrequency: IncomeFrequency;
  incomeIsGross: boolean;
  hasCompletedOnboarding: boolean;
  useSeededDemoData: boolean;
}

export interface AppData {
  goals: Goal[];
  progressEvents: ProgressEvent[];
  settings: UserSettings;
}
