import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../core/theme';
import { GoalsHeaderProps } from './types';

export default function GoalsHeader({ onAddGoal }: GoalsHeaderProps) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Goals</Text>
        <Pressable
          style={styles.iconButton}
          onPress={onAddGoal}
          accessibilityRole="button"
          accessibilityLabel="Add goal"
        >
          <Plus color={theme.accent} size={18} />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>
        Create, organize, and update every savings goal in one place.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.accentDeep,
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.textOnAccent,
  },
  subtitle: {
    color: theme.accentSoft,
    fontSize: 14,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
