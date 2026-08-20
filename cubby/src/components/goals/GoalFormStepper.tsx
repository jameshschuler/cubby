import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../core/theme';
import { goalFormStepNames } from './constants/constants';

interface GoalFormStepperProps {
  currentStep: number;
  isRecurring?: boolean;
}

export default function GoalFormStepper({ currentStep, isRecurring = true }: GoalFormStepperProps) {
  const stepNames = isRecurring ? goalFormStepNames : [goalFormStepNames[0], goalFormStepNames[2]];
  const visibleSteps = isRecurring ? [1, 2, 3] : [1, 3];
  const displayCurrentStep = isRecurring ? currentStep : currentStep > 1 ? 2 : 1;

  return (
    <View style={styles.stepperRow}>
      <View style={styles.trackLine} />
      {visibleSteps.map((step, index) => {
        const displayStep = index + 1;
        const isActive = displayStep === displayCurrentStep;
        const isCompleted = displayStep < displayCurrentStep;

        return (
          <View key={step} style={styles.stepperItem}>
            <View
              style={[
                styles.stepperCircle,
                (isActive || isCompleted) && styles.stepperCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.stepperCircleText,
                  (isActive || isCompleted) && styles.stepperCircleTextActive,
                ]}
              >
                {displayStep}
              </Text>
            </View>
            <Text
              style={[styles.stepperLabel, (isActive || isCompleted) && styles.stepperLabelActive]}
            >
              {stepNames[index]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    width: '100%',
    marginTop: -4,
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  trackLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 12,
    height: 2,
    backgroundColor: theme.border,
    borderRadius: 999,
  },
  stepperItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    minWidth: 0,
    zIndex: 1,
  },
  stepperLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    minHeight: 30,
  },
  stepperLabelActive: {
    color: theme.text,
  },
  stepperCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepperCircleActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accent,
  },
  stepperCircleText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  stepperCircleTextActive: {
    color: '#fff',
  },
});
