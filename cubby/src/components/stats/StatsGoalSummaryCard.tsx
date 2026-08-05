import { Text, View } from 'react-native';

import { formatCurrency } from '../../formatters';
import { styles } from './styles';
import { StatsGoalSummaryCardProps } from './types';
import { formatAccountTypeLabel } from './utils';

export default function StatsGoalDetailsCard({
  showAllGoals,
  selectedGoal,
}: StatsGoalSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {showAllGoals ? 'All Goals' : (selectedGoal?.name ?? 'Goal')}
      </Text>
      {!showAllGoals && selectedGoal ? (
        <>
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
