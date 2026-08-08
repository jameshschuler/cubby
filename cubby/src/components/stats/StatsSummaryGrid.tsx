import { Text, View } from 'react-native';

import { formatCurrency, formatPercent } from '../../helpers/formatters';
import { styles } from './styles';
import { StatsSummaryGridProps } from './types';

export default function StatsTotalsGrid({
  totalSavedAllTime,
  selectedYearTotal,
  effectiveSelectedYear,
  overallYearSavedTotal,
  overallYearIncomeTotal,
  overallYearSavingsRate,
  targetSavedAmount,
  actualSavingsRate,
  savingsTargetMode,
}: StatsSummaryGridProps) {
  const showTargetProgress = targetSavedAmount > 0;
  const showOverallYearRate = overallYearSavingsRate !== null;
  const currentYear = new Date().getFullYear();
  const isCurrentYear = effectiveSelectedYear === currentYear;

  return (
    <View style={styles.statsStack}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Overall Savings</Text>
          <Text style={styles.statValue}>{formatCurrency(totalSavedAllTime)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Saved in {effectiveSelectedYear ?? 'Year'}</Text>
          <Text style={styles.statValue}>{formatCurrency(selectedYearTotal)}</Text>
        </View>
      </View>

      {showOverallYearRate ? (
        <View style={styles.rateCard}>
          <Text style={styles.statLabel}>
            Overall Savings Rate for {effectiveSelectedYear ?? 'the Year'}
            {isCurrentYear ? ' so far' : ''}
          </Text>
          <Text style={styles.rateValue}>{formatPercent(overallYearSavingsRate)}</Text>
          <Text style={styles.progressSubtext}>
            Based on {formatCurrency(overallYearSavedTotal)} saved and{' '}
            {overallYearIncomeTotal !== null
              ? formatCurrency(overallYearIncomeTotal)
              : 'your income'}
            {isCurrentYear ? ' earned so far' : ''}.
          </Text>
        </View>
      ) : null}

      {showTargetProgress ? (
        <View style={styles.progressCard}>
          <Text style={styles.statLabel}>
            {savingsTargetMode === 'rate' ? 'Savings Rate Progress' : 'Savings Goal Progress'}
          </Text>
          <Text style={styles.progressValue}>{formatCurrency(selectedYearTotal)}</Text>
          <Text style={styles.progressSubtext}>
            of {formatCurrency(targetSavedAmount)} target for {effectiveSelectedYear ?? 'the year'}
          </Text>
          {actualSavingsRate !== null ? (
            <Text style={styles.progressSubtext}>
              {formatPercent(actualSavingsRate)} savings rate
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
