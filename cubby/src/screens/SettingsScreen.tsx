import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Download, Goal, X } from 'lucide-react-native';
import {
  Alert,
  Modal,
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
import KeyboardDoneBar, { KEYBOARD_DONE_BAR_ID } from '../components/ui/KeyboardDoneBar';

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
  setSeededDemoDataEnabled: ReturnType<typeof useAppData>['setSeededDemoDataEnabled'];
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
  const [incomeIsGross] = useState(data.settings.incomeIsGross);

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
    saveIncomeSettings(amount, incomeFrequency, incomeIsGross);
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
      ? `${formatCurrency(data.settings.incomeAmount)} · ${data.settings.incomeIsGross ? 'Gross' : 'Net'} · ${data.settings.incomeFrequency === 'monthly' ? 'Monthly' : 'Yearly'}`
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
      <KeyboardDoneBar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Income card */}
        <Pressable style={styles.card} onPress={() => setIncomeModalVisible(true)}>
          <View style={styles.cardRow}>
            <View style={styles.cardRowLeft}>
              <View style={styles.cardTitleRow}>
                <Goal color="#0c4a6e" size={18} />
                <Text style={styles.cardTitle}>Income</Text>
              </View>
              <Text style={styles.cardSummary}>{incomeSummary}</Text>
            </View>
            <ChevronRight color="#94a3b8" size={18} />
          </View>
        </Pressable>

        {/* Savings Target card */}
        <Pressable style={styles.card} onPress={() => setSavingsTargetModalVisible(true)}>
          <View style={styles.cardRow}>
            <View style={styles.cardRowLeft}>
              <View style={styles.cardTitleRow}>
                <Goal color="#0c4a6e" size={18} />
                <Text style={styles.cardTitle}>Savings Target</Text>
              </View>
              <Text style={styles.cardSummary}>{targetSummary}</Text>
            </View>
            <ChevronRight color="#94a3b8" size={18} />
          </View>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Download color="#0c4a6e" size={18} />
            <Text style={styles.cardTitle}>Export Data</Text>
          </View>
          <Text style={styles.helperText}>
            Export goals, progress events, and settings as JSON.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={handleExport}>
            <Text style={styles.secondaryButtonText}>Export JSON</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Income modal */}
      <Modal
        visible={incomeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIncomeModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardDoneBar />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Income</Text>
            <Pressable
              onPress={() => setIncomeModalVisible(false)}
              style={styles.modalCancel}
              accessibilityRole="button"
              accessibilityLabel="Close income settings"
              hitSlop={10}
            >
              <X color="#64748b" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.helperText}>
              Enter your income so your savings rate can be calculated accurately.
            </Text>
            <TextInput
              value={incomeAmount}
              onChangeText={setIncomeAmount}
              placeholder="Income amount"
              keyboardType="numeric"
              inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
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
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Savings Target modal */}
      <Modal
        visible={savingsTargetModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSavingsTargetModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardDoneBar />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Savings Target</Text>
            <Pressable
              onPress={() => setSavingsTargetModalVisible(false)}
              style={styles.modalCancel}
              accessibilityRole="button"
              accessibilityLabel="Close savings target settings"
              hitSlop={10}
            >
              <X color="#64748b" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
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
                inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
                style={styles.input}
              />
            ) : (
              <TextInput
                value={yearlySavingsGoalAmount}
                onChangeText={setYearlySavingsGoalAmount}
                placeholder="Yearly savings goal"
                keyboardType="numeric"
                inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
                style={styles.input}
              />
            )}
            <Pressable style={styles.primaryButton} onPress={handleSaveSavingsTarget}>
              <Text style={styles.primaryButtonText}>Save Target</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function SettingsScreen() {
  const {
    data,
    exportJson,
    saveIncomeSettings,
    saveSavingsTargetSettings,
    setSeededDemoDataEnabled,
  } = useAppData();

  return (
    <SettingsContent
      key={data.settings.useSeededDemoData ? 'demo' : 'live'}
      data={data}
      exportJson={exportJson}
      saveIncomeSettings={saveIncomeSettings}
      saveSavingsTargetSettings={saveSavingsTargetSettings}
      setSeededDemoDataEnabled={setSeededDemoDataEnabled}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  heroCard: {
    backgroundColor: '#082f49',
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#d5e7f3',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 16,
  },
  helperText: {
    color: '#475569',
    lineHeight: 20,
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
  primaryButton: {
    backgroundColor: '#0369a1',
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
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    backgroundColor: '#f1f5f9',
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
    backgroundColor: '#0369a1',
  },
  segmentOptionText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentOptionTextActive: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  previewText: {
    color: '#334155',
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
    color: '#64748b',
    fontSize: 13,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#eef7fb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCancel: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },
});
