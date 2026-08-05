import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';
import { StatsSelectionCardProps } from './types';

export default function StatsGoalSelectorCard({
  goals,
  showAllGoals,
  effectiveSelectedGoalId,
  onSelectGoal,
}: StatsSelectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Select Goal</Text>
      <View style={styles.pillWrap}>
        <Pressable
          onPress={() => onSelectGoal('all')}
          style={[styles.pill, showAllGoals && styles.pillActive]}
        >
          <Text style={[styles.pillText, showAllGoals && styles.pillTextActive]}>All Goals</Text>
        </Pressable>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            onPress={() => onSelectGoal(goal.id)}
            style={[styles.pill, effectiveSelectedGoalId === goal.id && styles.pillActive]}
          >
            <Text
              style={[
                styles.pillText,
                effectiveSelectedGoalId === goal.id && styles.pillTextActive,
              ]}
            >
              {goal.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
