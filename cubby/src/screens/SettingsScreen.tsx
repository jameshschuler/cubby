import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Download, Goal } from 'lucide-react-native';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getIncomeAmountForView } from '../calculations';
import { formatCurrency, formatPercent } from '../formatters';
import { useAppData } from '../app-data-context';
import { IncomeFrequency, SavingsTargetMode } from '../types';
import SettingsCard from '../components/settings/SettingsCard';
import SettingsModalShell from '../components/settings/SettingsModalShell';
import { theme } from '../theme';

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
}: {
  options: SegmentedOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.segmentedControl}>
      {options.map((option) => {
        const isActive = option.value === selectedValue;

        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.segmentOption, isActive && styles.segmentOptionActive]}
          >
            <Text style={[styles.segmentOptionText, isActive && styles.segmentOptionTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface SettingsContentProps {
  data: ReturnType<typeof useAppData>['data'];
  exportJson: ReturnType<typeof useAppData>['exportJson'];
  saveIncomeSettings: ReturnType<typeof useAppData>['saveIncomeSettings'];
  saveSavingsTargetSettings: ReturnType<typeof useAppData>['saveSavingsTargetSettings'];
}

function SettingsContent({
  data,
  exportJson,
  saveIncomeSettings,
  saveSavingsTargetSettings,
}: SettingsContentProps) {
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [savingsTargetModalVisible, setSavingsTargetModalVisible] = useState(false);

  const [targetRatePercent, setTargetRatePercent] = useState(
    String(Math.round(data.settings.targetSavingsRate * 100))
  );
  const [savingsTargetMode, setSavingsTargetMode] = useState<SavingsTargetMode>(
    data.settings.savingsTargetMode
  );
  const [yearlySavingsGoalAmount, setYearlySavingsGoalAmount] = useState(
    String(data.settings.yearlySavingsGoalAmount || '')
  );
  const [incomeAmount, setIncomeAmount] = useState(String(data.settings.incomeAmount || ''));
  const [incomeFrequency, setIncomeFrequency] = useState<IncomeFrequency>(
    data.settings.incomeFrequency
  );

  const incomePreview = useMemo(() => {
    const amount = Number(incomeAmount);
    if (Number.isNaN(amount) || amount < 0) {
      return { monthly: 0, yearly: 0 };
    }
    return {
      monthly: getIncomeAmountForView(amount, incomeFrequency, 'month'),
      yearly: getIncomeAmountForView(amount, incomeFrequency, 'year'),
    };
  }, [incomeAmount, incomeFrequency]);

  const handleSaveSavingsTarget = () => {
    if (savingsTargetMode === 'rate') {
      const percent = Number(targetRatePercent);
      if (Number.isNaN(percent) || percent < 0 || percent > 100) {
        Alert.alert('Invalid target', 'Use a target savings rate between 0 and 100.');
        return;
      }
      saveSavingsTargetSettings('rate', percent / 100);
      setSavingsTargetModalVisible(false);
      return;
    }

    const amount = Number(yearlySavingsGoalAmount);
    if (Number.isNaN(amount) || amount < 0) {
      Alert.alert('Invalid target', 'Enter a yearly savings goal of 0 or greater.');
      return;
    }
    saveSavingsTargetSettings('yearly-goal', amount);
    setSavingsTargetModalVisible(false);
  };

  const handleSaveIncome = () => {
    const amount = Number(incomeAmount);
    if (Number.isNaN(amount) || amount < 0) {
      Alert.alert('Invalid income', 'Enter a valid income amount.');
      return;
    }
    saveIncomeSettings(amount, incomeFrequency);
    setIncomeModalVisible(false);
  };

  const handleExport = async () => {
    try {
      await exportJson();
    } catch {
      Alert.alert('Export failed', 'Could not export JSON data from this device.');
    }
  };

  const incomeSummary =
    data.settings.incomeAmount > 0
      ? `${formatCurrency(data.settings.incomeAmount)} · ${data.settings.incomeFrequency === 'monthly' ? 'Monthly' : 'Yearly'}`
      : 'Not set';

  const targetSummary = (() => {
    if (data.settings.savingsTargetMode === 'rate' && data.settings.targetSavingsRate > 0) {
      return `${formatPercent(data.settings.targetSavingsRate)} savings rate`;
    }
    if (
      data.settings.savingsTargetMode === 'yearly-goal' &&
      data.settings.yearlySavingsGoalAmount > 0
    ) {
      return `${formatCurrency(data.settings.yearlySavingsGoalAmount)} yearly goal`;
    }
    return 'Not set';
  })();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <SettingsCard
          title="Income"
          subtitle={incomeSummary}
          icon={<Goal color={theme.accent} size={18} />}
          onPress={() => setIncomeModalVisible(true)}
        />

        <SettingsCard
          title="Savings Target"
          subtitle={targetSummary}
          icon={<Goal color={theme.accent} size={18} />}
          onPress={() => setSavingsTargetModalVisible(true)}
        />

        <SettingsCard
          title="Export Data"
          subtitle="Export goals, progress events, and settings as JSON."
          icon={<Download color={theme.accent} size={18} />}
        >
          <Pressable style={styles.secondaryButton} onPress={handleExport}>
            <Text style={styles.secondaryButtonText}>Export JSON</Text>
          </Pressable>
        </SettingsCard>
      </ScrollView>

      <SettingsModalShell
        title="Income"
        visible={incomeModalVisible}
        onClose={() => setIncomeModalVisible(false)}
      >
        <Text style={styles.helperText}>
          Enter your income so your savings rate can be calculated accurately.
        </Text>
        <TextInput
          value={incomeAmount}
          onChangeText={setIncomeAmount}
          placeholder="Income amount"
          keyboardType="numeric"
          style={styles.input}
        />
        <SegmentedControl
          options={[
            { label: 'Monthly', value: 'monthly' as const },
            { label: 'Yearly', value: 'yearly' as const },
          ]}
          selectedValue={incomeFrequency}
          onSelect={(value) => setIncomeFrequency(value)}
        />
        {Number(incomeAmount) > 0 ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>
              Monthly equivalent: {formatCurrency(incomePreview.monthly)}
            </Text>
            <Text style={styles.previewText}>
              Yearly equivalent: {formatCurrency(incomePreview.yearly)}
            </Text>
          </View>
        ) : null}
        <Pressable style={styles.primaryButton} onPress={handleSaveIncome}>
          <Text style={styles.primaryButtonText}>Save Income</Text>
        </Pressable>
      </SettingsModalShell>

      <SettingsModalShell
        title="Savings Target"
        visible={savingsTargetModalVisible}
        onClose={() => setSavingsTargetModalVisible(false)}
      >
        <Text style={styles.helperText}>
          Choose a savings rate or a yearly goal amount for your overall target.
        </Text>
        <SegmentedControl
          options={[
            { label: 'Savings rate', value: 'rate' as const },
            { label: 'Yearly goal', value: 'yearly-goal' as const },
          ]}
          selectedValue={savingsTargetMode}
          onSelect={(value) => setSavingsTargetMode(value)}
        />
        {savingsTargetMode === 'rate' ? (
          <TextInput
            value={targetRatePercent}
            onChangeText={setTargetRatePercent}
            placeholder="Target rate %"
            keyboardType="numeric"
            style={styles.input}
          />
        ) : (
          <TextInput
            value={yearlySavingsGoalAmount}
            onChangeText={setYearlySavingsGoalAmount}
            placeholder="Yearly savings goal"
            keyboardType="numeric"
            style={styles.input}
          />
        )}
        <Pressable style={styles.primaryButton} onPress={handleSaveSavingsTarget}>
          <Text style={styles.primaryButtonText}>Save Target</Text>
        </Pressable>
      </SettingsModalShell>
    </SafeAreaView>
  );
}

export default function SettingsScreen() {
  const { data, exportJson, saveIncomeSettings, saveSavingsTargetSettings } = useAppData();

  return (
    <SettingsContent
      data={data}
      exportJson={exportJson}
      saveIncomeSettings={saveIncomeSettings}
      saveSavingsTargetSettings={saveSavingsTargetSettings}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  heroCard: {
    backgroundColor: theme.accentDeep,
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.textOnAccent,
  },
  subtitle: {
    color: theme.accentSoft,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontWeight: '700',
    color: theme.text,
    fontSize: 16,
  },
  helperText: {
    color: theme.textMuted,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.surface,
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
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
    color: theme.textOnAccent,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    backgroundColor: theme.backgroundAlt,
    borderRadius: 999,
    padding: 4,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  segmentOptionActive: {
    backgroundColor: theme.accent,
  },
  segmentOptionText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  segmentOptionTextActive: {
    color: theme.textOnAccent,
  },
  secondaryButton: {
    backgroundColor: theme.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: theme.text,
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  previewText: {
    color: theme.textMuted,
    fontSize: 13,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardRowLeft: {
    flex: 1,
    gap: 4,
  },
  cardSummary: {
    color: theme.textMuted,
    fontSize: 13,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
});
