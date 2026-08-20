import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import {
  getGoalProgress,
  getSavingsRateForView,
  getTargetSavedAmountForView,
  getViewLabel,
  shiftAnchorDate,
} from '../helpers/calculations';
import { formatCurrency, formatPercent } from '../helpers/formatters';
import { useAppData } from '../core/app-data-context';
import { Goal, GoalDisplayFilter } from '../core/types';
import ActualAmountModal from '../components/home/ActualAmountModal';
import HomeGoalsCard from '../components/home/HomeGoalsCard';
import HomeHeader from '../components/home/HomeHeader';
import HomeSummaryCard from '../components/home/HomeSummaryCard';
import FirstRunOnboardingCard from '../components/onboarding/FirstRunOnboardingCard';
import PeriodNavigator from '../components/home/PeriodNavigator';
import ViewFilterTabs from '../components/home/ViewFilterTabs';
import { shouldShowOnboarding } from '../helpers/onboarding';
import { theme } from '../core/theme';

export default function HomeScreen() {
  const { data, replaceGoalProgress, setDefaultView, registerLogoTap } = useAppData();

  const [selectedViewOverride, setSelectedViewOverride] = useState<GoalDisplayFilter | null>(null);
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState('');

  const selectedView = selectedViewOverride ?? data.settings.defaultView;
  const showOnboarding = shouldShowOnboarding(data);
  const visibleGoals = useMemo(() => {
    return data.goals.filter((goal) => {
      if (selectedView === 'one-time') {
        return !goal.isRecurring;
      }

      return goal.isRecurring && goal.recurringState === selectedView;
    });
  }, [data.goals, selectedView]);

  const getDisplayedGoalProgress = useCallback(
    (goal: Goal): number => {
      if (selectedView === 'one-time') {
        return data.progressEvents
          .filter((event) => event.goalId === goal.id)
          .reduce((total, event) => total + event.amount, 0);
      }

      return getGoalProgress(goal, data.progressEvents, selectedView, anchorDate);
    },
    [anchorDate, data.progressEvents, selectedView]
  );

  const totalSaved = useMemo(() => {
    return visibleGoals.reduce((total, goal) => total + getDisplayedGoalProgress(goal), 0);
  }, [getDisplayedGoalProgress, visibleGoals]);

  const actualSavingsRate = useMemo(() => {
    return getSavingsRateForView(
      totalSaved,
      data.settings.incomeAmount,
      data.settings.incomeFrequency,
      selectedView
    );
  }, [data.settings.incomeAmount, data.settings.incomeFrequency, selectedView, totalSaved]);

  const targetSavedAmount = useMemo(() => {
    return getTargetSavedAmountForView(
      {
        incomeAmount: data.settings.incomeAmount,
        incomeFrequency: data.settings.incomeFrequency,
        targetSavingsRate: data.settings.targetSavingsRate,
        savingsTargetMode: data.settings.savingsTargetMode,
        yearlySavingsGoalAmount: data.settings.yearlySavingsGoalAmount,
      },
      selectedView,
      visibleGoals
    );
  }, [
    data.settings.incomeAmount,
    data.settings.incomeFrequency,
    data.settings.savingsTargetMode,
    data.settings.targetSavingsRate,
    data.settings.yearlySavingsGoalAmount,
    selectedView,
    visibleGoals,
  ]);

  const handleSelectView = (view: GoalDisplayFilter) => {
    setSelectedViewOverride(view);
    if (view !== 'one-time') {
      setDefaultView(view);
      setAnchorDate(new Date());
    }
  };

  const movePeriod = (direction: -1 | 1) => {
    if (selectedView === 'one-time') {
      return;
    }

    setAnchorDate((current) => shiftAnchorDate(selectedView, current, direction));
  };

  const openActualAmountDialog = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingAmount(String(getDisplayedGoalProgress(goal)));
  };

  const closeActualAmountDialog = () => {
    setEditingGoalId(null);
    setEditingAmount('');
  };

  const handleSaveActualAmount = () => {
    if (!editingGoalId) {
      return;
    }

    const parsedAmount = Number(editingAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than or equal to zero.');
      return;
    }

    replaceGoalProgress(editingGoalId, parsedAmount, selectedView, anchorDate);
    closeActualAmountDialog();
  };

  const handleCreateGoal = () => {
    router.push('/add-goal');
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <HomeHeader
          subtitle={
            selectedView === 'one-time'
              ? 'One-time goal balances'
              : getViewLabel(selectedView, anchorDate)
          }
          onLogoPress={registerLogoTap}
          onSettingsPress={handleOpenSettings}
        />

        <ViewFilterTabs selectedView={selectedView} onSelect={handleSelectView} />

        {selectedView === 'one-time' ? null : (
          <PeriodNavigator
            label={getViewLabel(selectedView, anchorDate)}
            onPrevious={() => movePeriod(-1)}
            onNext={() => movePeriod(1)}
          />
        )}

        <HomeSummaryCard
          selectedView={selectedView}
          totalSaved={totalSaved}
          targetSavedAmount={targetSavedAmount}
          actualSavingsRate={actualSavingsRate}
          targetLabel={
            data.settings.savingsTargetMode === 'rate'
              ? data.settings.targetSavingsRate > 0
                ? `Suggested savings rate: ${formatPercent(data.settings.targetSavingsRate)} of income`
                : null
              : data.settings.yearlySavingsGoalAmount > 0
                ? `Yearly savings goal: ${formatCurrency(data.settings.yearlySavingsGoalAmount)} per year`
                : null
          }
        />

        {showOnboarding ? (
          <FirstRunOnboardingCard onCreateGoal={handleCreateGoal} />
        ) : (
          <HomeGoalsCard
            selectedView={selectedView}
            visibleGoals={visibleGoals}
            getDisplayedGoalProgress={getDisplayedGoalProgress}
            onEditActual={openActualAmountDialog}
            onCreateGoal={handleCreateGoal}
          />
        )}
      </ScrollView>

      <ActualAmountModal
        visible={editingGoalId !== null}
        amount={editingAmount}
        onAmountChange={setEditingAmount}
        onCancel={closeActualAmountDialog}
        onSave={handleSaveActualAmount}
      />
    </SafeAreaView>
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
    gap: 14,
  },
});
