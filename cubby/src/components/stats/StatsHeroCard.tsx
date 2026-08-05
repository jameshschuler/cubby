import { Text, View } from 'react-native';

import { styles } from './styles';

export default function StatsHeroCard() {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.title}>Stats</Text>
      <Text style={styles.subtitle}>Review history, yearly totals, and monthly savings patterns.</Text>
    </View>
  );
}