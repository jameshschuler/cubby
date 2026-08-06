import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
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
    color: theme.accentDeep,
  },
  subtitle: {
    marginTop: 4,
    color: theme.accent,
    fontSize: 14,
  },
});
