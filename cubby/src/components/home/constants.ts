import { GoalDisplayFilter } from '../../types';

export const recurringStateAutoContributionLabels = {
  week: '/ week',
  month: '/ month',
  year: '/ year',
} as const;

export const goalFilters: GoalDisplayFilter[] = ['week', 'month', 'year'];

export const filterLabel: Record<'week' | 'month' | 'year', string> = {
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
};

export const getProgressFillColor = (ratio: number) => {
  if (ratio >= 1) {
    return '#16a34a';
  }

  if (ratio >= 0.6) {
    return '#0284c7';
  }

  return '#38bdf8';
};
