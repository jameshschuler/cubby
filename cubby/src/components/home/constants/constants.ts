import { GoalDisplayFilter } from '../../../core/types';

export const recurringStateAutoContributionLabels = {
  week: '/ week',
  month: '/ month',
  year: '/ year',
} as const;

export const goalFilters: GoalDisplayFilter[] = ['week', 'month', 'year', 'one-time'];

export const filterLabel: Record<GoalDisplayFilter, string> = {
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
  'one-time': 'One-time',
};

export const getProgressFillColor = (ratio: number) => {
  if (ratio >= 1) {
    return '#6f8f54';
  }

  if (ratio >= 0.6) {
    return '#b87a4a';
  }

  return '#7c4b2f';
};
