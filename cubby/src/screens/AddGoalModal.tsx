import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppData } from '../app-data-context';
import KeyboardDoneBar, { KEYBOARD_DONE_BAR_ID } from '../components/ui/KeyboardDoneBar';
import OptionPicker from '../components/ui/OptionPicker';
import {
  getDefaultAutoContributionAnchor,
  parseAutoContributionAnchor,
} from '../automatic-contributions';
import { AccountType, GoalCategory, RecurringState } from '../types';
import {
  accountTypeLabels,
  accountTypes,
  categories,
  categoryLabels,
  goalFormStepNames,
  recurringStateContributionErrorLabels,
  recurringStateContributionLabels,
  recurringStateContributionPlaceholders,
  recurringStateLabels,
  totalGoalFormSteps,
  weekDayLabels,
  yearDayOptions,
  yearMonthOptions,
} from '../components/goals/constants';
import { ValidationErrors } from '../components/goals/types';

export default function AddGoalModal() {
  const router = useRouter();
  const { addGoal } = useAppData();
  const totalSteps = totalGoalFormSteps;
  const stepNames = goalFormStepNames;

  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [autoContributionAmount, setAutoContributionAmount] = useState('');
  const [autoContributionAnchor, setAutoContributionAnchor] = useState(
    getDefaultAutoContributionAnchor('month')
  );
  const [category, setCategory] = useState<GoalCategory | undefined>(undefined);
  const [accountType, setAccountType] = useState<AccountType | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(true);
  const [hasAutomaticContribution, setHasAutomaticContribution] = useState(false);
  const [recurringState, setRecurringState] = useState<RecurringState>('month');
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateBasics = () => {
    const nextErrors: ValidationErrors = {};
    const parsedTarget = Number(targetAmount);

    if (!name.trim()) {
      nextErrors.name = 'Account name is required.';
    }

    if (Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      nextErrors.targetAmount = 'Target amount must be greater than 0.';
    }

    setErrors((current) => ({
      ...current,
      name: nextErrors.name,
      targetAmount: nextErrors.targetAmount,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const validateAutomaticContribution = () => {
    if (!isRecurring || !hasAutomaticContribution) {
      setErrors((current) => ({
        ...current,
        autoContributionAmount: undefined,
        autoContributionAnchor: undefined,
      }));
      return true;
    }

    const nextErrors: ValidationErrors = {};
    const trimmedAutoContributionAmount = autoContributionAmount.trim();
    const parsedAutoContributionAmount = trimmedAutoContributionAmount
      ? Number(trimmedAutoContributionAmount)
      : undefined;
    const parsedAutoContributionAnchor = parseAutoContributionAnchor(
      recurringState,
      autoContributionAnchor
    );

    if (
      !trimmedAutoContributionAmount ||
      parsedAutoContributionAmount === undefined ||
      Number.isNaN(parsedAutoContributionAmount) ||
      parsedAutoContributionAmount <= 0
    ) {
      nextErrors.autoContributionAmount = `${recurringStateContributionErrorLabels[recurringState]} must be greater than 0.`;
    }

    if (!parsedAutoContributionAnchor.isValid || !parsedAutoContributionAnchor.normalizedValue) {
      nextErrors.autoContributionAnchor = 'Choose a valid contribution timing for this frequency.';
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

    if (currentStep === 2 && !validateAutomaticContribution()) {
      return;
    }

    setCurrentStep((current) => Math.min(current + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep((current) => Math.max(current - 1, 1));
  };

  const handleSave = () => {
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

    const parsedTarget = Number(targetAmount);
    const trimmedAutoContributionAmount = autoContributionAmount.trim();
    const parsedAutoContributionAmount =
      isRecurring && hasAutomaticContribution && trimmedAutoContributionAmount
        ? Number(trimmedAutoContributionAmount)
        : undefined;
    const parsedAutoContributionAnchor =
      isRecurring && hasAutomaticContribution
        ? parseAutoContributionAnchor(recurringState, autoContributionAnchor)
        : { isValid: false, normalizedValue: undefined };

    addGoal({
      name,
      nickname: '',
      origin,
      category,
      accountType,
      targetAmount: parsedTarget,
      autoContributionAmount:
        isRecurring && hasAutomaticContribution ? parsedAutoContributionAmount : undefined,
      autoContributionAnchor:
        isRecurring && hasAutomaticContribution && parsedAutoContributionAnchor.isValid
          ? parsedAutoContributionAnchor.normalizedValue
          : undefined,
      isRecurring,
      recurringState,
    });
    router.back();
  };

  const renderFieldLabel = (label: string, requirement: 'Required' | 'Optional') => (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>
        {label}
        {requirement === 'Required' ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Add Goal' }} />
      <KeyboardDoneBar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>New Account Goal</Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={styles.dismissButton}
            accessibilityRole="button"
            accessibilityLabel="Close add goal modal"
            hitSlop={10}
          >
            <X color="#0f172a" size={18} />
          </Pressable>
        </View>

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
                  style={[
                    styles.stepperLabel,
                    (isActive || isCompleted) && styles.stepperLabelActive,
                  ]}
                >
                  {stepNames[step - 1]}
                </Text>
              </View>
            );
          })}
        </View>

        {currentStep === 1 ? (
          <>
            {renderFieldLabel('Account Name', 'Required')}
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="Account name"
              inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
              style={styles.input}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            {renderFieldLabel('Target Amount', 'Required')}
            <TextInput
              value={targetAmount}
              onChangeText={(value) => {
                setTargetAmount(value);
                setErrors((current) => ({ ...current, targetAmount: undefined }));
              }}
              placeholder="Target amount"
              keyboardType="numeric"
              inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
              style={styles.input}
            />
            {errors.targetAmount ? (
              <Text style={styles.errorText}>{errors.targetAmount}</Text>
            ) : null}

            {renderFieldLabel('Goal Type', 'Required')}
            <View style={styles.toggleRow}>
              <Pressable
                onPress={() => {
                  setIsRecurring(true);
                  setErrors((current) => ({ ...current, autoContributionAmount: undefined }));
                }}
                style={[styles.pill, isRecurring && styles.pillActive]}
                accessibilityRole="button"
                accessibilityLabel="Set goal type to recurring"
              >
                <Text style={[styles.pillText, isRecurring && styles.pillTextActive]}>
                  Recurring Goal
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsRecurring(false);
                  setHasAutomaticContribution(false);
                  setErrors((current) => ({
                    ...current,
                    autoContributionAmount: undefined,
                    autoContributionAnchor: undefined,
                  }));
                }}
                style={[styles.pill, !isRecurring && styles.pillActive]}
                accessibilityRole="button"
                accessibilityLabel="Set goal type to one time"
              >
                <Text style={[styles.pillText, !isRecurring && styles.pillTextActive]}>
                  One Time Goal
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {currentStep === 2 ? (
          <View style={styles.subSectionCard}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>Scheduling</Text>
            </View>
            {isRecurring ? (
              <>
                {renderFieldLabel('Frequency', 'Required')}
                <View style={styles.pillWrap}>
                  {(['week', 'month', 'year'] as RecurringState[]).map((state) => (
                    <Pressable
                      key={state}
                      onPress={() => {
                        setRecurringState(state);
                        setAutoContributionAnchor(getDefaultAutoContributionAnchor(state));
                        setErrors((current) => ({
                          ...current,
                          autoContributionAmount: undefined,
                          autoContributionAnchor: undefined,
                        }));
                      }}
                      style={[styles.pill, recurringState === state && styles.pillActive]}
                    >
                      <Text
                        style={[styles.pillText, recurringState === state && styles.pillTextActive]}
                      >
                        {recurringStateLabels[state]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.checkboxControlRow}>
                  <Pressable
                    onPress={() => {
                      setHasAutomaticContribution((current) => !current);
                      setErrors((current) => ({
                        ...current,
                        autoContributionAmount: undefined,
                        autoContributionAnchor: undefined,
                      }));
                    }}
                    style={styles.checkboxRow}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: hasAutomaticContribution }}
                    accessibilityLabel="Enable automatic contribution"
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        hasAutomaticContribution && styles.checkboxBoxChecked,
                      ]}
                    >
                      {hasAutomaticContribution ? <View style={styles.checkboxIndicator} /> : null}
                    </View>
                    <Text style={styles.checkboxLabel}>Configure Automatic Contributions</Text>
                  </Pressable>
                </View>

                {hasAutomaticContribution ? (
                  <>
                    {renderFieldLabel(recurringStateContributionLabels[recurringState], 'Required')}
                    <TextInput
                      value={autoContributionAmount}
                      onChangeText={(value) => {
                        setAutoContributionAmount(value);
                        setErrors((current) => ({ ...current, autoContributionAmount: undefined }));
                      }}
                      placeholder={recurringStateContributionPlaceholders[recurringState]}
                      keyboardType="numeric"
                      inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
                      style={styles.input}
                    />

                    {renderFieldLabel('Contribution Timing', 'Required')}
                    {recurringState === 'week' ? (
                      <OptionPicker
                        value={autoContributionAnchor}
                        onValueChange={(value) => {
                          setAutoContributionAnchor(value);
                          setErrors((current) => ({
                            ...current,
                            autoContributionAnchor: undefined,
                          }));
                        }}
                        options={weekDayLabels}
                        style={styles.pickerWrap}
                        textStyle={styles.pickerText}
                      />
                    ) : recurringState === 'year' ? (
                      <OptionPicker
                        value={autoContributionAnchor}
                        onValueChange={(value) => {
                          setAutoContributionAnchor(value);
                          setErrors((current) => ({
                            ...current,
                            autoContributionAnchor: undefined,
                          }));
                        }}
                        mode="month-day"
                        monthOptions={yearMonthOptions}
                        dayOptions={yearDayOptions}
                        style={styles.pickerWrap}
                        textStyle={styles.pickerText}
                        placeholder="Select month/day"
                      />
                    ) : (
                      <TextInput
                        value={autoContributionAnchor}
                        onChangeText={(value) => {
                          const sanitizedValue = value.replace(/[^0-9]/g, '');
                          setAutoContributionAnchor(sanitizedValue);
                          setErrors((current) => ({
                            ...current,
                            autoContributionAnchor: undefined,
                          }));
                        }}
                        placeholder="Day of month"
                        keyboardType="numeric"
                        inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
                        style={styles.input}
                      />
                    )}

                    {errors.autoContributionAmount ? (
                      <Text style={styles.errorText}>{errors.autoContributionAmount}</Text>
                    ) : null}
                    {errors.autoContributionAnchor ? (
                      <Text style={styles.errorText}>{errors.autoContributionAnchor}</Text>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}

        {currentStep === 3 ? (
          <View style={styles.optionalSection}>
            <View style={styles.sectionDivider} />

            {renderFieldLabel('Institution', 'Optional')}
            <TextInput
              value={origin}
              onChangeText={setOrigin}
              placeholder="Institution (Ally, Fidelity...)"
              inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
              style={styles.input}
            />

            {renderFieldLabel('Category', 'Optional')}
            <View style={styles.pillWrap}>
              <Pressable
                onPress={() => setCategory(undefined)}
                style={[styles.pill, !category && styles.pillActive]}
                accessibilityRole="button"
                accessibilityLabel="Clear category"
              >
                <Text style={[styles.pillText, !category && styles.pillTextActive]}>None</Text>
              </Pressable>
              {categories.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.pill, category === item && styles.pillActive]}
                >
                  <Text style={[styles.pillText, category === item && styles.pillTextActive]}>
                    {categoryLabels[item]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {renderFieldLabel('Account Type', 'Optional')}
            <View style={styles.pillWrap}>
              <Pressable
                onPress={() => setAccountType(undefined)}
                style={[styles.pill, !accountType && styles.pillActive]}
                accessibilityRole="button"
                accessibilityLabel="Clear account type"
              >
                <Text style={[styles.pillText, !accountType && styles.pillTextActive]}>None</Text>
              </Pressable>
              {accountTypes.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setAccountType(item)}
                  style={[styles.pill, accountType === item && styles.pillActive]}
                >
                  <Text style={[styles.pillText, accountType === item && styles.pillTextActive]}>
                    {accountTypeLabels[item]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.navigationRow}>
          {currentStep > 1 ? (
            <Pressable
              style={[styles.navigationButton, styles.secondaryButton]}
              onPress={handleBack}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.navigationButton} />
          )}

          {currentStep < totalSteps ? (
            <Pressable style={[styles.navigationButton, styles.primaryButton]} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.navigationButton, styles.primaryButton]} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Save Goal</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef7fb',
  },
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#082f49',
  },
  checkboxControlRow: {
    marginTop: 8,
    marginBottom: 4,
  },
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
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  stepperLabelActive: {
    color: '#0f172a',
  },
  stepperCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#94a3b8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleActive: {
    borderColor: '#0369a1',
    backgroundColor: '#0369a1',
  },
  stepperCircleText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  stepperCircleTextActive: {
    color: '#fff',
  },
  stepperConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  stepperConnectorActive: {
    backgroundColor: '#0369a1',
  },
  dismissButton: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  dismissButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fieldLabel: {
    color: '#0c4a6e',
    fontSize: 13,
    fontWeight: '700',
  },
  requiredMark: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '700',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#f0f9ff',
  },
  pillActive: {
    backgroundColor: '#0369a1',
    borderColor: '#0369a1',
  },
  pillText: {
    color: '#0c4a6e',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  subSectionCard: {
    borderWidth: 1,
    borderColor: '#d5e7f3',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginTop: 2,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  subSectionTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  subSectionHelper: {
    color: '#475569',
    fontSize: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingVertical: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#94a3b8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    borderColor: '#0369a1',
    backgroundColor: '#0369a1',
  },
  checkboxIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  checkboxLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  optionalSection: {
    gap: 20,
    paddingTop: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#dbe7f0',
    marginVertical: 2,
  },
  primaryButton: {
    backgroundColor: '#0369a1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  navigationButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    backgroundColor: '#f8fafc',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pickerText: {
    color: '#0f172a',
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});
