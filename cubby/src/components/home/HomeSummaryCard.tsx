import { TrendingUp } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatPercent } from '../../helpers/formatters';
import { theme } from '../../core/theme';
import { HomeSummaryCardProps } from './types';

export default function HomeSummaryCard({
  selectedView,
  totalSaved,
  targetSavedAmount,
  actualSavingsRate,
  targetLabel,
}: HomeSummaryCardProps) {
  const amountTargetMet = targetSavedAmount > 0 && totalSaved >= targetSavedAmount;
  const amountExceeded = targetSavedAmount > 0 && totalSaved > targetSavedAmount;
  const showTargetBadge = targetSavedAmount > 0;
  const showRateBadge = actualSavingsRate !== null;
  const savingsRate = actualSavingsRate ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <TrendingUp color={theme.accent} size={18} />
        <Text style={styles.cardTitle}>
          {selectedView === 'one-time' ? 'One-time Summary' : 'Summary'}
        </Text>
      </View>
      {targetLabel ? <Text style={styles.subtitle}>Tracking {targetLabel}</Text> : null}
      <Text style={styles.summaryValue}>{formatCurrency(totalSaved)}</Text>
      <View style={styles.badgeRow}>
        {showTargetBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              <Text style={styles.badgeLabel}>Saved: </Text>
              <Text
                style={[
                  styles.metricActual,
                  amountExceeded
                    ? styles.metricActualExceeded
                    : amountTargetMet
                      ? styles.metricActualMet
                      : styles.metricActualProgress,
                ]}
              >
                {formatCurrency(totalSaved)}
              </Text>
              <Text style={styles.metricDivider}> / </Text>
              <Text style={styles.metricTarget}>{formatCurrency(targetSavedAmount)}</Text>
            </Text>
          </View>
        ) : null}
        {showRateBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              <Text style={styles.badgeLabel}>Savings rate: </Text>
              <Text
                style={[
                  styles.metricActual,
                  savingsRate >= 1
                    ? styles.metricActualExceeded
                    : savingsRate >= 0.99
                      ? styles.metricActualMet
                      : styles.metricActualProgress,
                ]}
              >
                {formatPercent(savingsRate)}
              </Text>
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
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
    color: '#0f172a',
    fontSize: 16,
  },
  subtitle: {
    color: '#475569',
    fontSize: 13,
  },
  summaryValue: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 26,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: theme.accentSoft,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeLabel: {
    color: '#475569',
  },
  metricActual: {
    fontWeight: '700',
  },
  metricActualExceeded: {
    color: '#15803d',
  },
  metricActualMet: {
    color: '#0f766e',
  },
  metricActualProgress: {
    color: '#b45309',
  },
  metricDivider: {
    color: theme.textMuted,
  },
  metricTarget: {
    color: theme.accentDeep,
  },
});
