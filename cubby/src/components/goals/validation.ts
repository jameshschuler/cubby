import { parseAutoContributionAnchor } from '../../automatic-contributions';
import { RecurringState } from '../../types';
import { recurringStateContributionErrorLabels } from './constants';
import { ValidationErrors } from './types';

type GoalTargetInput = number | string;
type AutoContributionAmountInput = number | string | undefined;

interface GoalBasicsValidationInput {
  name: string;
  targetAmount: GoalTargetInput;
}

interface AutomaticContributionValidationInput {
  isRecurring: boolean;
  hasAutomaticContribution: boolean;
  recurringState: RecurringState;
  autoContributionAmount: AutoContributionAmountInput;
  autoContributionAnchor?: string;
}

function parseNumericInput(value: GoalTargetInput | AutoContributionAmountInput) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  return Number(trimmedValue);
}

export function validateGoalBasics({ name, targetAmount }: GoalBasicsValidationInput) {
  const errors: Pick<ValidationErrors, 'name' | 'targetAmount'> = {};
  const parsedTargetAmount = parseNumericInput(targetAmount);

  if (!name.trim()) {
    errors.name = 'Account name is required.';
  }

  if (
    parsedTargetAmount === undefined ||
    !Number.isFinite(parsedTargetAmount) ||
    parsedTargetAmount <= 0
  ) {
    errors.targetAmount = 'Target amount must be greater than 0.';
  }

  return errors;
}

export function validateAutomaticContribution({
  isRecurring,
  hasAutomaticContribution,
  recurringState,
  autoContributionAmount,
  autoContributionAnchor,
}: AutomaticContributionValidationInput) {
  if (!isRecurring || !hasAutomaticContribution) {
    return {} as Pick<ValidationErrors, 'autoContributionAmount' | 'autoContributionAnchor'>;
  }

  const errors: Pick<ValidationErrors, 'autoContributionAmount' | 'autoContributionAnchor'> = {};
  const parsedAutoContributionAmount = parseNumericInput(autoContributionAmount);
  const parsedAutoContributionAnchor = parseAutoContributionAnchor(
    recurringState,
    autoContributionAnchor
  );

  if (
    parsedAutoContributionAmount === undefined ||
    !Number.isFinite(parsedAutoContributionAmount) ||
    parsedAutoContributionAmount <= 0
  ) {
    errors.autoContributionAmount = `${recurringStateContributionErrorLabels[recurringState]} must be greater than 0.`;
  }

  if (!parsedAutoContributionAnchor.isValid || !parsedAutoContributionAnchor.normalizedValue) {
    errors.autoContributionAnchor = 'Choose a valid contribution timing for this frequency.';
  }

  return errors;
}
