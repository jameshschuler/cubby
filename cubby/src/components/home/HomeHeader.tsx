import { StyleSheet, Text, View } from 'react-native';
import { HomeHeaderProps } from './types';

export default function HomeHeader({ subtitle }: HomeHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.title}>Cubby</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#082f49',
  },
  subtitle: {
    marginTop: 4,
    color: '#0c4a6e',
    fontSize: 14,
  },
});
