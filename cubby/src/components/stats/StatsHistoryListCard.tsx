import { ScrollView, Text, View } from 'react-native';

import { formatCurrency } from '../../helpers/formatters';
import { styles } from './styles';
import { StatsHistoryListCardProps } from './types';

export default function StatsHistoryCard({
  filteredEvents,
  showAllGoals,
  goalNameById,
}: StatsHistoryListCardProps) {
  const visibleEvents = filteredEvents.slice(0, 10);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>History</Text>
      {filteredEvents.length === 0 ? (
        <Text style={styles.emptyText}>No entries for the selected year.</Text>
      ) : (
        <ScrollView
          style={styles.historyScroll}
          contentContainerStyle={styles.historyScrollContent}
        >
          {visibleEvents.map((event) => (
            <View key={event.id} style={styles.eventRow}>
              <View>
                {showAllGoals && goalNameById.get(event.goalId) ? (
                  <Text style={styles.eventGoalName}>{goalNameById.get(event.goalId)}</Text>
                ) : null}
                <Text style={styles.eventAmount}>{formatCurrency(event.amount)}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.eventDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Text style={styles.eventCreated}>
                Logged {new Date(event.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
