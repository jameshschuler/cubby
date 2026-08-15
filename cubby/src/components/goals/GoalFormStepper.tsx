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
      {visibleSteps.map((step, index) => {
        const displayStep = index + 1;
        const isActive = displayStep === displayCurrentStep;
        const isCompleted = displayStep < displayCurrentStep;

        return (
          <View key={step} style={styles.stepperItem}>
            <View style={styles.stepperTopRow}>
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
              {index < visibleSteps.length - 1 ? (
                <View
                  style={[
                    styles.stepperConnector,
                    displayStep < displayCurrentStep && styles.stepperConnectorActive,
                  ]}
                />
              ) : null}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -4,
    marginBottom: 6,
  },
  stepperItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  stepperTopRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 26,
  },
  stepperLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
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
  stepperConnector: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    top: 12,
    height: 2,
    backgroundColor: theme.border,
    zIndex: 0,
  },
  stepperConnectorActive: {
    backgroundColor: theme.accent,
  },
});
