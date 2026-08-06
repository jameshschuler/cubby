export interface GoalFormNavigationConfig {
  showBack: boolean;
  primaryLabel: string;
  isPrimaryActionSave: boolean;
}

export function getGoalFormNavigationConfig(
  currentStep: number,
  totalSteps: number
): GoalFormNavigationConfig {
  if (currentStep < totalSteps) {
    return {
      showBack: currentStep > 1,
      primaryLabel: 'Next',
      isPrimaryActionSave: false,
    };
  }

  return {
    showBack: currentStep > 1,
    primaryLabel: 'Save Goal',
    isPrimaryActionSave: true,
  };
}
