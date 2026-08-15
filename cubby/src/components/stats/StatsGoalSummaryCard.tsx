import { Text, View } from 'react-native';

import { formatCurrency } from '../../helpers/formatters';
import { styles } from './styles';
import { StatsGoalSummaryCardProps } from './types';
import { formatAccountTypeLabel } from './helpers/utils';

const recurringStateLabel: Record<'week' | 'month' | 'year', string> = {
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
};

export default function StatsGoalDetailsCard({
  showAllGoals,
  selectedGoal,
}: StatsGoalSummaryCardProps) {
  const goalTypeLabel = selectedGoal
    ? selectedGoal.isRecurring
      ? recurringStateLabel[selectedGoal.recurringState]
      : 'One time'
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {showAllGoals ? 'All Goals' : (selectedGoal?.name ?? 'Goal')}
      </Text>
      {!showAllGoals && selectedGoal ? (
        <>
          {goalTypeLabel ? <Text style={styles.helperText}>Goal Type: {goalTypeLabel}</Text> : null}
          {selectedGoal.origin ? (
            <Text style={styles.helperText}>Institution: {selectedGoal.origin}</Text>
          ) : null}
          {selectedGoal.accountType ? (
            <Text style={styles.helperText}>
              Account Type: {formatAccountTypeLabel(selectedGoal.accountType)}
            </Text>
          ) : null}
          {selectedGoal.targetAmount > 0 ? (
            <Text style={styles.helperText}>
              Target: {formatCurrency(selectedGoal.targetAmount)}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
