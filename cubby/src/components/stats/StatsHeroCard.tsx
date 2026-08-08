import { Text, View } from 'react-native';

import { styles } from './styles';

export default function StatsHeroCard() {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.title}>Stats</Text>
      <Text style={styles.subtitle}>
        Review savings totals, yearly progress, and monthly trends.
      </Text>
    </View>
  );
}
