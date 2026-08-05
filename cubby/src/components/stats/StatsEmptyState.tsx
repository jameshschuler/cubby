import { Text, View } from 'react-native';

import { styles } from './styles';

export default function StatsEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.title}>Stats</Text>
      <Text style={styles.emptyTitle}>No goals yet</Text>
      <Text style={styles.emptyText}>Add a goal first to see savings history and stats.</Text>
    </View>
  );
}