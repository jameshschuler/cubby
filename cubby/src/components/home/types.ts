import { Goal, GoalDisplayFilter } from '../../types';

export interface ActualAmountModalProps {
  visible: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export interface HomeHeaderProps {
  subtitle: string;
}

export interface PeriodNavigatorProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
}

export interface ViewFilterTabsProps {
  selectedView: GoalDisplayFilter;
  onSelect: (view: GoalDisplayFilter) => void;
}

export interface HomeSummaryCardProps {
  selectedView: GoalDisplayFilter;
  totalSaved: number;
  targetSavedAmount: number;
  actualSavingsRate: number | null;
  targetLabel: string | null;
}

export interface HomeGoalsCardProps {
  selectedView: GoalDisplayFilter;
  visibleGoals: Goal[];
  getDisplayedGoalProgress: (goal: Goal) => number;
  onEditActual: (goal: Goal) => void;
}
