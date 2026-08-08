import { AccountType, GoalCategory, RecurringState } from '../../../core/types';

export const categories: GoalCategory[] = [
  'short-term savings',
  'long-term savings',
  'investing',
  'other',
];

export const categoryLabels: Record<GoalCategory, string> = {
  'short-term savings': 'Short Term',
  'long-term savings': 'Long Term',
  investing: 'Investing',
  other: 'Other',
};

export const accountTypes: AccountType[] = [
  'hysa',
  'individual brokerage',
  'roth ira',
  '401k',
  '529',
  'traditional ira',
  'utma',
  'hsa',
  'fidelity cash management',
  'crypto',
  'other',
];

export const accountTypeLabels: Record<AccountType, string> = {
  hysa: 'HYSA',
  'individual brokerage': 'Individual Brokerage',
  'roth ira': 'Roth IRA',
  '401k': '401k',
  '529': '529',
  'traditional ira': 'Traditional IRA',
  utma: 'UTMA',
  hsa: 'HSA',
  'fidelity cash management': 'Fidelity Cash Management',
  crypto: 'Crypto',
  other: 'Other',
};

export const recurringStateLabels: Record<RecurringState, string> = {
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

export const recurringStateContributionLabels: Record<RecurringState, string> = {
  week: 'Automatic Weekly Contribution',
  month: 'Automatic Monthly Contribution',
  year: 'Automatic Yearly Contribution',
};

export const recurringStateContributionErrorLabels: Record<RecurringState, string> = {
  week: 'Automatic weekly contribution',
  month: 'Automatic monthly contribution',
  year: 'Automatic yearly contribution',
};

export const recurringStateContributionPlaceholders: Record<RecurringState, string> = {
  week: 'Automatic amount each week',
  month: 'Automatic amount each month',
  year: 'Automatic amount each year',
};

export const weekDayLabels = [
  { label: 'Sunday', value: '0' },
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
] as const;

export const yearMonthOptions = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
] as const;

export const yearDayOptions = Array.from({ length: 31 }, (_, index) => ({
  label: String(index + 1),
  value: String(index + 1).padStart(2, '0'),
}));

export const totalGoalFormSteps = 3;

export const goalFormStepNames = ['Basics', 'Scheduling', 'Details'] as const;

export const recurringStateAutoContributionLabels = {
  week: 'each week',
  month: 'each month',
  year: 'each year',
} as const;

export const getProgressFillColor = (ratio: number) => {
  if (ratio >= 1) {
    return '#16a34a';
  }

  if (ratio >= 0.6) {
    return '#0284c7';
  }

  return '#38bdf8';
};
