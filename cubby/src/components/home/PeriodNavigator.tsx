import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../core/theme';
import { PeriodNavigatorProps } from './types';

export default function PeriodNavigator({ label, onPrevious, onNext }: PeriodNavigatorProps) {
  return (
    <View style={styles.navigatorRow}>
      <Pressable
        style={styles.navigatorButton}
        onPress={onPrevious}
        accessibilityRole="button"
        accessibilityLabel="Previous period"
      >
        <ChevronLeft color={theme.accent} size={18} />
        <Text style={styles.navigatorButtonText}>Previous</Text>
      </Pressable>
      <Text style={styles.navigatorLabel} accessibilityRole="header">
        {label}
      </Text>
      <Pressable
        style={styles.navigatorButton}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Next period"
      >
        <Text style={styles.navigatorButtonText}>Next</Text>
        <ChevronRight color={theme.accent} size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navigatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  navigatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.accentSoft,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  navigatorButtonText: {
    color: theme.accent,
    fontWeight: '600',
  },
  navigatorLabel: {
    flex: 1,
    textAlign: 'center',
    color: theme.text,
    fontWeight: '700',
  },
});
