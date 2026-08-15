import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Keyboard, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

import { useAppData } from '../core/app-data-context';
import GoalFormHeader from '../components/goals/GoalFormHeader';
import GoalFormStepper from '../components/goals/GoalFormStepper';
import OptionPicker from '../components/ui/OptionPicker';
import { goalFormStyles } from '../components/goals/goalFormStyles';
import {
  getDefaultAutoContributionAnchor,
  parseAutoContributionAnchor,
} from '../helpers/automatic-contributions';
import { AccountType, GoalCategory, RecurringState } from '../core/types';
import {
  accountTypeLabels,
  accountTypes,
  categories,
  categoryLabels,
  recurringStateContributionLabels,
  recurringStateContributionPlaceholders,
  recurringStateLabels,
  totalGoalFormSteps,
  weekDayLabels,
  yearDayOptions,
  yearMonthOptions,
} from '../components/goals/constants/constants';
import { ValidationErrors } from '../components/goals/types';
import {
  validateAutomaticContribution as validateGoalAutomaticContribution,
  validateGoalBasics,
} from '../components/goals/validation';

export default function AddGoalModal() {
  const router = useRouter();
  const { addGoal } = useAppData();
  const totalSteps = totalGoalFormSteps;

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
    const nextErrors = validateGoalBasics({ name, targetAmount });

    setErrors((current) => ({
      ...current,
      name: nextErrors.name,
      targetAmount: nextErrors.targetAmount,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const validateAutomaticContribution = () => {
    const nextErrors = validateGoalAutomaticContribution({
      isRecurring,
      hasAutomaticContribution,
      recurringState,
      autoContributionAmount,
      autoContributionAnchor,
    });

    if (!isRecurring || !hasAutomaticContribution) {
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

    if (currentStep === 1 && !isRecurring) {
      setCurrentStep(3);
      return;
    }

    if (currentStep === 2 && !validateAutomaticContribution()) {
      return;
    }

    setCurrentStep((current) => Math.min(current + 1, totalSteps));
  };

  const handleBack = () => {
    if (!isRecurring && currentStep === 3) {
      setCurrentStep(1);
      return;
    }

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

    const parsedTarget = Number(targetAmount.trim());
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
      <ScrollView contentContainerStyle={styles.content}>
        <GoalFormHeader
          title="New Account Goal"
          onDismiss={() => router.back()}
          accessibilityLabel="Close add goal modal"
        />

        <GoalFormStepper currentStep={currentStep} isRecurring={isRecurring} />

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
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
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
                      style={styles.input}
                    />

                    {renderFieldLabel('Contribution Schedule', 'Required')}
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

const styles = goalFormStyles;
