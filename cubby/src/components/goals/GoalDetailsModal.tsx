import { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { parseAutoContributionAnchor } from '../../helpers/automatic-contributions';
import GoalFormHeader from './GoalFormHeader';
import GoalFormFields from './GoalFormFields';
import GoalFormStepper from './GoalFormStepper';
import { goalFormStyles } from './goalFormStyles';
import { Goal } from '../../core/types';
import { totalGoalFormSteps } from './constants/constants';
import { GoalDetailsInput, GoalDetailsModalProps, ValidationErrors } from './types';
import { getGoalFormNavigationConfig } from './goalFormNavigation';
import {
  validateAutomaticContribution as validateGoalAutomaticContribution,
  validateGoalBasics,
} from './validation';

function createInputFromGoal(goal: Goal | null): GoalDetailsInput {
  if (!goal) {
    return {
      name: '',
      nickname: '',
      origin: '',
      category: undefined,
      accountType: undefined,
      targetAmount: 0,
      autoContributionAmount: undefined,
      autoContributionAnchor: undefined,
      isRecurring: true,
      recurringState: 'month',
    };
  }

  return {
    name: goal.name,
    nickname: goal.nickname,
    origin: goal.origin,
    category: goal.category,
    accountType: goal.accountType,
    targetAmount: goal.targetAmount,
    autoContributionAmount: goal.autoContributionAmount,
    autoContributionAnchor: goal.autoContributionAnchor,
    isRecurring: goal.isRecurring,
    recurringState: goal.recurringState,
  };
}

export default function GoalDetailsModal({
  goal,
  visible,
  onClose,
  onSave,
}: GoalDetailsModalProps) {
  const [input, setInput] = useState<GoalDetailsInput>(() => createInputFromGoal(goal));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = totalGoalFormSteps;
  const [hasAutomaticContribution, setHasAutomaticContribution] = useState(
    Boolean(input.autoContributionAmount && input.autoContributionAmount > 0)
  );

  const validateBasics = () => {
    const nextErrors = validateGoalBasics({
      name: input.name,
      targetAmount: input.targetAmount,
    });

    setErrors((current) => ({
      ...current,
      name: nextErrors.name,
      targetAmount: nextErrors.targetAmount,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const validateAutomaticContribution = () => {
    const nextErrors = validateGoalAutomaticContribution({
      isRecurring: input.isRecurring,
      hasAutomaticContribution,
      recurringState: input.recurringState,
      autoContributionAmount: input.autoContributionAmount,
      autoContributionAnchor: input.autoContributionAnchor,
    });

    if (!input.isRecurring || !hasAutomaticContribution) {
      setErrors((current) => ({
        ...current,
        autoContributionAmount: undefined,
        autoContributionAnchor: undefined,
      }));
      return true;
    }

    setErrors((current) => ({
      ...current,
      autoContributionAmount: nextErrors.autoContributionAmount,
      autoContributionAnchor: nextErrors.autoContributionAnchor,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateBasics()) {
      return;
    }

    if (currentStep === 1 && !input.isRecurring) {
      setCurrentStep(3);
      return;
    }

    if (currentStep === 2 && !validateAutomaticContribution()) {
      return;
    }

    setCurrentStep((current) => Math.min(current + 1, totalSteps));
  };

  const handleBack = () => {
    if (!input.isRecurring && currentStep === 3) {
      setCurrentStep(1);
      return;
    }

    setCurrentStep((current) => Math.max(current - 1, 1));
  };

  const handleSave = () => {
    if (!goal) {
      return;
    }

    const basicsAreValid = validateBasics();
    const automaticContributionIsValid = validateAutomaticContribution();

    if (!basicsAreValid) {
      setCurrentStep(1);
      return;
    }

    if (!automaticContributionIsValid) {
      setCurrentStep(2);
      return;
    }

    const parsedAutoContributionAnchor = parseAutoContributionAnchor(
      input.recurringState,
      input.autoContributionAnchor
    );

    onSave(goal.id, {
      ...input,
      name: input.name.trim(),
      nickname: input.nickname.trim(),
      origin: input.origin.trim(),
      autoContributionAmount:
        input.isRecurring && hasAutomaticContribution ? input.autoContributionAmount : undefined,
      autoContributionAnchor:
        input.isRecurring && hasAutomaticContribution && parsedAutoContributionAnchor.isValid
          ? parsedAutoContributionAnchor.normalizedValue
          : undefined,
    });
  };

  const navigationConfig = getGoalFormNavigationConfig(currentStep, totalSteps);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <GoalFormHeader title="Edit Account Goal" onDismiss={onClose} />

          <GoalFormStepper currentStep={currentStep} isRecurring={input.isRecurring} />

          <GoalFormFields
            input={input}
            errors={errors}
            hasAutomaticContribution={hasAutomaticContribution}
            onChangeInput={setInput}
            onSetHasAutomaticContribution={setHasAutomaticContribution}
            onSetErrors={setErrors}
            currentStep={currentStep}
            isEditing
          />

          <View style={styles.navigationRow}>
            {navigationConfig.showBack ? (
              <Pressable
                style={[styles.navigationButton, styles.secondaryButton]}
                onPress={handleBack}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            ) : (
              <View style={styles.navigationButton} />
            )}

            {navigationConfig.isPrimaryActionSave ? (
              <Pressable
                style={[styles.navigationButton, styles.primaryButton]}
                onPress={handleSave}
              >
                <Text style={styles.primaryButtonText}>{navigationConfig.primaryLabel}</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.navigationButton, styles.primaryButton]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>{navigationConfig.primaryLabel}</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = goalFormStyles;
