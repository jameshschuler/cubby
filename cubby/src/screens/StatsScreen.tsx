import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  getIncomeAmountForSelectedYear,
  getSavingsRateForSelectedYear,
  getTargetSavedAmountForView,
} from '../helpers/calculations';
import { useAppData } from '../core/app-data-context';
import StatsGoalSummaryCard from '../components/stats/StatsGoalSummaryCard';
import StatsSelectionCard from '../components/stats/StatsSelectionCard';
import StatsHeroCard from '../components/stats/StatsHeroCard';
import StatsHistoryListCard from '../components/stats/StatsHistoryListCard';
import StatsMonthlyChartCard from '../components/stats/StatsMonthlyChartCard';
import StatsSummaryGrid from '../components/stats/StatsSummaryGrid';
import useStatsData from '../components/stats/useStatsData';
import StatsYearListCard from '../components/stats/StatsYearListCard';
import FirstRunOnboardingCard from '../components/onboarding/FirstRunOnboardingCard';
import { shouldShowOnboarding } from '../helpers/onboarding';
import { theme } from '../core/theme';

export default function StatsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { goals, selection, totals, history } = useStatsData();
  const { data } = useAppData();
  const showOnboarding = shouldShowOnboarding(data);
  const hasAnyStats = goals.length > 0 || data.progressEvents.length > 0;

  const {
    setSelectedGoalId,
    setSelectedYear,
    effectiveSelectedGoalId,
    showAllGoals,
    selectedGoal,
  } = selection;
  const shouldShowAllGoals = showAllGoals || goals.length === 0;
  const shouldShowMonthlyStats = shouldShowAllGoals || Boolean(selectedGoal?.isRecurring);

  const { totalSavedAllTime, totalsByYear, effectiveSelectedYear, selectedYearTotal } = totals;

  const { filteredEvents, goalNameById, monthlyStats } = history;
  const overallYearSavedTotal = useMemo(() => {
    if (effectiveSelectedYear === null) {
      return 0;
    }

    return data.progressEvents
      .filter((event) => new Date(event.eventDate).getFullYear() === effectiveSelectedYear)
      .reduce((total, event) => total + event.amount, 0);
  }, [data.progressEvents, effectiveSelectedYear]);

  const overallYearIncomeTotal = useMemo(() => {
    return getIncomeAmountForSelectedYear(
      data.settings.incomeAmount,
      data.settings.incomeFrequency,
      effectiveSelectedYear,
      new Date()
    );
  }, [data.settings.incomeAmount, data.settings.incomeFrequency, effectiveSelectedYear]);

  const overallYearSavingsRate = useMemo(() => {
    return getSavingsRateForSelectedYear(
      overallYearSavedTotal,
      data.settings.incomeAmount,
      data.settings.incomeFrequency,
      effectiveSelectedYear,
      new Date()
    );
  }, [
    data.settings.incomeAmount,
    data.settings.incomeFrequency,
    effectiveSelectedYear,
    overallYearSavedTotal,
  ]);

  const targetSavedAmount = getTargetSavedAmountForView(
    {
      incomeAmount: data.settings.incomeAmount,
      incomeFrequency: data.settings.incomeFrequency,
      targetSavingsRate: data.settings.targetSavingsRate,
      savingsTargetMode: data.settings.savingsTargetMode,
      yearlySavingsGoalAmount: data.settings.yearlySavingsGoalAmount,
    },
    'year',
    goals
  );
  const actualSavingsRate = overallYearSavingsRate;
  const handleCreateGoal = () => {
    router.push('/add-goal');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}>
        <StatsHeroCard />

        {!hasAnyStats ? (
          <FirstRunOnboardingCard
            onCreateGoal={handleCreateGoal}
            title={showOnboarding ? 'Build your first stats view' : 'No stats to review yet'}
            body={
              showOnboarding
                ? 'Create a goal and log progress to unlock yearly totals, monthly trends, and savings-rate insights.'
                : 'Add a goal or log progress to populate this screen with totals, history, and trend data.'
            }
            buttonLabel="Add goal"
          />
        ) : null}

        {hasAnyStats ? (
          <>
            <View style={[styles.dashboardRow, isTablet && styles.dashboardRowTablet]}>
              <View style={styles.dashboardColumn}>
                <StatsSelectionCard
                  goals={goals}
                  showAllGoals={shouldShowAllGoals}
                  effectiveSelectedGoalId={effectiveSelectedGoalId}
                  onSelectGoal={setSelectedGoalId}
                />
              </View>
              <View style={styles.dashboardColumn}>
                <StatsGoalSummaryCard
                  showAllGoals={shouldShowAllGoals}
                  selectedGoal={selectedGoal}
                />
              </View>
            </View>

            <StatsSummaryGrid
              totalSavedAllTime={totalSavedAllTime}
              selectedYearTotal={selectedYearTotal}
              effectiveSelectedYear={effectiveSelectedYear}
              overallYearSavedTotal={overallYearSavedTotal}
              overallYearIncomeTotal={overallYearIncomeTotal}
              overallYearSavingsRate={overallYearSavingsRate}
              targetSavedAmount={targetSavedAmount}
              actualSavingsRate={actualSavingsRate}
              savingsTargetMode={data.settings.savingsTargetMode}
            />

            <View style={[styles.dashboardRow, isTablet && styles.dashboardRowTablet]}>
              <View style={styles.dashboardColumn}>
                <StatsYearListCard
                  totalsByYear={totalsByYear}
                  effectiveSelectedYear={effectiveSelectedYear}
                  onSelectYear={setSelectedYear}
                />
              </View>
              <View style={styles.dashboardColumn}>
                {shouldShowMonthlyStats ? (
                  <StatsMonthlyChartCard
                    effectiveSelectedYear={effectiveSelectedYear}
                    filteredEvents={filteredEvents}
                    monthlyStats={monthlyStats}
                  />
                ) : null}
              </View>
            </View>

            <StatsHistoryListCard
              filteredEvents={filteredEvents}
              showAllGoals={shouldShowAllGoals}
              goalNameById={goalNameById}
            />
          </>
        ) : null}
      </ScrollView>
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
  contentTablet: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  dashboardRow: {
    gap: 14,
  },
  dashboardRowTablet: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  dashboardColumn: {
    flex: 1,
  },
});
