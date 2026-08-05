import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import {
  getIncomeAmountForSelectedYear,
  getSavingsRateForSelectedYear,
  getTargetSavedAmountForView,
} from '../calculations';
import { useAppData } from '../app-data-context';
import StatsGoalSummaryCard from '../components/stats/StatsGoalSummaryCard';
import StatsSelectionCard from '../components/stats/StatsSelectionCard';
import StatsHeroCard from '../components/stats/StatsHeroCard';
import StatsHistoryListCard from '../components/stats/StatsHistoryListCard';
import StatsMonthlyChartCard from '../components/stats/StatsMonthlyChartCard';
import { styles } from '../components/stats/styles';
import StatsSummaryGrid from '../components/stats/StatsSummaryGrid';
import useStatsData from '../components/stats/useStatsData';
import StatsYearListCard from '../components/stats/StatsYearListCard';

export default function StatsScreen() {
  const { goals, selection, totals, history } = useStatsData();
  const { data } = useAppData();

  const {
    setSelectedGoalId,
    setSelectedYear,
    effectiveSelectedGoalId,
    showAllGoals,
    selectedGoal,
  } = selection;
  const shouldShowAllGoals = showAllGoals || goals.length === 0;

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <StatsHeroCard />

        <StatsSelectionCard
          goals={goals}
          showAllGoals={shouldShowAllGoals}
          effectiveSelectedGoalId={effectiveSelectedGoalId}
          onSelectGoal={setSelectedGoalId}
        />

        {shouldShowAllGoals || selectedGoal ? (
          <>
            <StatsGoalSummaryCard showAllGoals={shouldShowAllGoals} selectedGoal={selectedGoal} />

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

            <StatsYearListCard
              totalsByYear={totalsByYear}
              effectiveSelectedYear={effectiveSelectedYear}
              onSelectYear={setSelectedYear}
            />

            <StatsMonthlyChartCard
              effectiveSelectedYear={effectiveSelectedYear}
              filteredEvents={filteredEvents}
              monthlyStats={monthlyStats}
            />

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
