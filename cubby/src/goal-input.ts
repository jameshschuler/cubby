import { RecurringState } from './types';

export function getCadenceForRecurringState(recurringState: RecurringState) {
  if (recurringState === 'week') {
    return 'weekly' as const;
  }

  if (recurringState === 'year') {
    return 'yearly' as const;
  }

  return 'monthly' as const;
}

export function sanitizeAutoContributionAmount(
  isRecurring: boolean,
  autoContributionAmount?: number
) {
  if (!isRecurring) {
    return undefined;
  }

  if (
    typeof autoContributionAmount !== 'number' ||
    Number.isNaN(autoContributionAmount) ||
    !Number.isFinite(autoContributionAmount) ||
    autoContributionAmount <= 0
  ) {
    return undefined;
  }

  return autoContributionAmount;
}

export function sanitizeAutoContributionAnchor(
  isRecurring: boolean,
  autoContributionAnchor?: string
) {
  if (!isRecurring || !autoContributionAnchor) {
    return undefined;
  }

  const trimmedAnchor = autoContributionAnchor.trim();
  return trimmedAnchor || undefined;
}
