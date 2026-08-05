import { AccountType, Goal, GoalCategory, ProgressEvent, RecurringState } from '../../types';

export type ValidationErrors = {
  name?: string;
  targetAmount?: string;
  autoContributionAmount?: string;
  autoContributionAnchor?: string;
};

export interface GoalDetailsInput {
  name: string;
  nickname: string;
  origin: string;
  category?: GoalCategory;
  accountType?: AccountType;
  targetAmount: number;
  autoContributionAmount?: number;
  autoContributionAnchor?: string;
  isRecurring: boolean;
  recurringState: RecurringState;
}

export interface GoalDetailsModalProps {
  goal: Goal | null;
  visible: boolean;
  onClose: () => void;
  onSave: (goalId: string, input: GoalDetailsInput) => void;
}

export interface GoalsTemplatesCardProps {
  goals: Goal[];
  progressEvents: ProgressEvent[];
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string, removeAssociatedData: boolean) => void;
}

export interface GoalsHeaderProps {
  onAddGoal: () => void;
}
