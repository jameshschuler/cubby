import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../core/theme';
import { goalFormStepNames, totalGoalFormSteps } from './constants/constants';

interface GoalFormStepperProps {
  currentStep: number;
}

export default function GoalFormStepper({ currentStep }: GoalFormStepperProps) {
  const totalSteps = totalGoalFormSteps;
  const stepNames = goalFormStepNames;

  return (
    <View style={styles.stepperRow}>
      {[1, 2, 3].map((step) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

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
                  {step}
                </Text>
              </View>
              {step < totalSteps ? (
                <View
                  style={[
                    styles.stepperConnector,
                    step < currentStep && styles.stepperConnectorActive,
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[styles.stepperLabel, (isActive || isCompleted) && styles.stepperLabelActive]}
            >
              {stepNames[step - 1]}
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
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 6,
  },
  stepperItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepperTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepperLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
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
    flex: 1,
    height: 2,
    backgroundColor: theme.border,
    marginHorizontal: 8,
  },
  stepperConnectorActive: {
    backgroundColor: theme.accent,
  },
});
