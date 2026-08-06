import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { theme } from '../../theme';
import OptionPicker from '../ui/OptionPicker';
import { KEYBOARD_DONE_BAR_ID } from '../ui/KeyboardDoneBar';
import { getDefaultAutoContributionAnchor } from '../../automatic-contributions';
import {
  accountTypeLabels,
  accountTypes,
  categories,
  categoryLabels,
  recurringStateContributionLabels,
  recurringStateContributionPlaceholders,
  recurringStateLabels,
  weekDayLabels,
  yearDayOptions,
  yearMonthOptions,
} from './constants';
import { GoalDetailsInput, ValidationErrors } from './types';
import { RecurringState } from '../../types';

interface GoalFormFieldsProps {
  input: GoalDetailsInput;
  errors: ValidationErrors;
  hasAutomaticContribution: boolean;
  onChangeInput: (updater: (current: GoalDetailsInput) => GoalDetailsInput) => void;
  onSetHasAutomaticContribution: (value: boolean) => void;
  onSetErrors: (updater: (current: ValidationErrors) => ValidationErrors) => void;
  currentStep: number;
  isEditing?: boolean;
}

function renderFieldLabel(label: string, requirement: 'Required' | 'Optional') {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>
        {label}
        {requirement === 'Required' ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
    </View>
  );
}

export default function GoalFormFields({
  input,
  errors,
  hasAutomaticContribution,
  onChangeInput,
  onSetHasAutomaticContribution,
  onSetErrors,
  currentStep,
  isEditing = false,
}: GoalFormFieldsProps) {
  const updateInput = (updater: (current: GoalDetailsInput) => GoalDetailsInput) => {
    onChangeInput(updater);
  };

  if (currentStep === 1) {
    return (
      <>
        {renderFieldLabel('Account Name', 'Required')}
        <TextInput
          value={input.name}
          onChangeText={(value) => {
            updateInput((current) => ({ ...current, name: value }));
            onSetErrors((current) => ({ ...current, name: undefined }));
          }}
          placeholder="Account name"
          inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
          style={styles.input}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        {renderFieldLabel('Target Amount', 'Required')}
        <TextInput
          value={input.targetAmount > 0 ? String(input.targetAmount) : ''}
          onChangeText={(value) => {
            const parsedValue = Number(value);
            updateInput((current) => ({
              ...current,
              targetAmount: Number.isNaN(parsedValue) ? 0 : parsedValue,
            }));
            onSetErrors((current) => ({ ...current, targetAmount: undefined }));
          }}
          placeholder="Target amount"
          keyboardType="numeric"
          inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
          style={styles.input}
        />
        {errors.targetAmount ? <Text style={styles.errorText}>{errors.targetAmount}</Text> : null}

        {renderFieldLabel('Goal Type', 'Required')}
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => {
              updateInput((current) => ({ ...current, isRecurring: true }));
              onSetErrors((current) => ({ ...current, autoContributionAmount: undefined }));
            }}
            style={[styles.pill, input.isRecurring && styles.pillActive]}
            accessibilityRole="button"
            accessibilityLabel="Set goal type to recurring"
          >
            <Text style={[styles.pillText, input.isRecurring && styles.pillTextActive]}>
              Recurring Goal
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              updateInput((current) => ({ ...current, isRecurring: false }));
              onSetHasAutomaticContribution(false);
              onSetErrors((current) => ({ ...current, autoContributionAmount: undefined }));
            }}
            style={[styles.pill, !input.isRecurring && styles.pillActive]}
            accessibilityRole="button"
            accessibilityLabel="Set goal type to one time"
          >
            <Text style={[styles.pillText, !input.isRecurring && styles.pillTextActive]}>
              One Time Goal
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (currentStep === 2) {
    return (
      <View style={styles.subSectionCard}>
        <View style={styles.subSectionHeader}>
          <Text style={styles.subSectionTitle}>Scheduling</Text>
        </View>
        {input.isRecurring ? (
          <>
            {renderFieldLabel('Frequency', 'Required')}
            <View style={styles.pillWrap}>
              {(['week', 'month', 'year'] as RecurringState[]).map((state) => (
                <Pressable
                  key={state}
                  onPress={() => {
                    updateInput((current) => ({
                      ...current,
                      recurringState: state,
                      autoContributionAnchor: getDefaultAutoContributionAnchor(state),
                    }));
                    onSetErrors((current) => ({
                      ...current,
                      autoContributionAmount: undefined,
                      autoContributionAnchor: undefined,
                    }));
                  }}
                  style={[styles.pill, input.recurringState === state && styles.pillActive]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      input.recurringState === state && styles.pillTextActive,
                    ]}
                  >
                    {recurringStateLabels[state]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.checkboxControlRow}>
              <Pressable
                onPress={() => {
                  onSetHasAutomaticContribution(!hasAutomaticContribution);
                  onSetErrors((current) => ({
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
                {renderFieldLabel(
                  recurringStateContributionLabels[input.recurringState],
                  'Required'
                )}
                <TextInput
                  value={
                    input.autoContributionAmount && input.autoContributionAmount > 0
                      ? String(input.autoContributionAmount)
                      : ''
                  }
                  onChangeText={(value) => {
                    const trimmedValue = value.trim();
                    const parsedValue = Number(trimmedValue);
                    updateInput((current) => ({
                      ...current,
                      autoContributionAmount: trimmedValue
                        ? Number.isNaN(parsedValue)
                          ? 0
                          : parsedValue
                        : undefined,
                    }));
                    onSetErrors((current) => ({ ...current, autoContributionAmount: undefined }));
                  }}
                  placeholder={recurringStateContributionPlaceholders[input.recurringState]}
                  keyboardType="numeric"
                  inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
                  style={styles.input}
                />

                {renderFieldLabel('Contribution Timing', 'Required')}
                {input.recurringState === 'week' ? (
                  <OptionPicker
                    value={input.autoContributionAnchor ?? '0'}
                    onValueChange={(value) => {
                      updateInput((current) => ({
                        ...current,
                        autoContributionAnchor: String(value),
                      }));
                      onSetErrors((current) => ({ ...current, autoContributionAnchor: undefined }));
                    }}
                    options={weekDayLabels}
                    style={styles.pickerWrap}
                    textStyle={styles.pickerText}
                  />
                ) : input.recurringState === 'year' ? (
                  <OptionPicker
                    value={input.autoContributionAnchor ?? '01-01'}
                    onValueChange={(value) => {
                      updateInput((current) => ({
                        ...current,
                        autoContributionAnchor: String(value),
                      }));
                      onSetErrors((current) => ({ ...current, autoContributionAnchor: undefined }));
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
                    value={input.autoContributionAnchor ?? ''}
                    onChangeText={(value) => {
                      const sanitizedValue = value.replace(/[^0-9]/g, '');
                      updateInput((current) => ({
                        ...current,
                        autoContributionAnchor: sanitizedValue,
                      }));
                      onSetErrors((current) => ({ ...current, autoContributionAnchor: undefined }));
                    }}
                    placeholder={input.recurringState === 'month' ? 'Day of month' : 'MM-DD'}
                    keyboardType={input.recurringState === 'month' ? 'numeric' : 'default'}
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
    );
  }

  return (
    <View style={styles.optionalSection}>
      <View style={styles.sectionDivider} />

      {renderFieldLabel('Institution', 'Optional')}
      <TextInput
        value={input.origin}
        onChangeText={(value) => updateInput((current) => ({ ...current, origin: value }))}
        placeholder="Institution (Ally, Fidelity...)"
        inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
        style={styles.input}
      />

      {renderFieldLabel('Category', 'Optional')}
      <View style={styles.pillWrap}>
        <Pressable
          onPress={() => updateInput((current) => ({ ...current, category: undefined }))}
          style={[styles.pill, !input.category && styles.pillActive]}
          accessibilityRole="button"
          accessibilityLabel="Clear category"
        >
          <Text style={[styles.pillText, !input.category && styles.pillTextActive]}>None</Text>
        </Pressable>
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => updateInput((current) => ({ ...current, category: item }))}
            style={[styles.pill, input.category === item && styles.pillActive]}
          >
            <Text style={[styles.pillText, input.category === item && styles.pillTextActive]}>
              {categoryLabels[item]}
            </Text>
          </Pressable>
        ))}
      </View>

      {renderFieldLabel('Account Type', 'Optional')}
      <View style={styles.pillWrap}>
        <Pressable
          onPress={() => updateInput((current) => ({ ...current, accountType: undefined }))}
          style={[styles.pill, !input.accountType && styles.pillActive]}
          accessibilityRole="button"
          accessibilityLabel="Clear account type"
        >
          <Text style={[styles.pillText, !input.accountType && styles.pillTextActive]}>None</Text>
        </Pressable>
        {accountTypes.map((item) => (
          <Pressable
            key={item}
            onPress={() => updateInput((current) => ({ ...current, accountType: item }))}
            style={[styles.pill, input.accountType === item && styles.pillActive]}
          >
            <Text style={[styles.pillText, input.accountType === item && styles.pillTextActive]}>
              {accountTypeLabels[item]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.surface,
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
    color: theme.accent,
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
    borderColor: theme.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.backgroundAlt,
  },
  pillActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  pillText: {
    color: theme.accent,
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
    borderColor: theme.border,
    backgroundColor: theme.surface,
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
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxControlRow: {
    marginTop: 8,
    marginBottom: 4,
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
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    borderColor: theme.accent,
    backgroundColor: theme.accent,
  },
  checkboxIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: theme.textOnAccent,
  },
  checkboxLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  optionalSection: {
    gap: 20,
    paddingTop: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 2,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  pickerText: {
    color: theme.text,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});
