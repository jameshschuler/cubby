import { Goal, ProgressEvent, SavingsTargetMode } from '../../types';

export interface MonthTotal {
  month: string;
  total: number;
}

export interface MonthlyStats {
  averageSavedPerMonth: number;
  medianSavedPerMonth: number;
  bestMonth: MonthTotal | null;
  weakestMonth: MonthTotal | null;
}

export interface YearTotal {
  year: number;
  total: number;
}

export interface StatsHistoryListCardProps {
  filteredEvents: ProgressEvent[];
  showAllGoals: boolean;
  goalNameById: Map<string, string>;
}

export interface StatsGoalSummaryCardProps {
  showAllGoals: boolean;
  selectedGoal: Goal | null;
}

export interface StatsSummaryGridProps {
  totalSavedAllTime: number;
  selectedYearTotal: number;
  effectiveSelectedYear: number | null;
  overallYearSavedTotal: number;
  overallYearIncomeTotal: number | null;
  overallYearSavingsRate: number | null;
  targetSavedAmount: number;
  actualSavingsRate: number | null;
  savingsTargetMode: SavingsTargetMode;
}

export interface StatsYearListCardProps {
  totalsByYear: YearTotal[];
  effectiveSelectedYear: number | null;
  onSelectYear: (year: number) => void;
}

export interface StatsSelectionCardProps {
  goals: Goal[];
  showAllGoals: boolean;
  effectiveSelectedGoalId: string | 'all' | null;
  onSelectGoal: (goalId: string | 'all') => void;
}

export interface StatsMonthlyChartCardProps {
  effectiveSelectedYear: number | null;
  filteredEvents: ProgressEvent[];
  monthlyStats: MonthlyStats;
}
