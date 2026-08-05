import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PeriodNavigatorProps } from './types';

export default function PeriodNavigator({ label, onPrevious, onNext }: PeriodNavigatorProps) {
  return (
    <View style={styles.navigatorRow}>
      <Pressable style={styles.navigatorButton} onPress={onPrevious}>
        <ChevronLeft color="#0c4a6e" size={18} />
        <Text style={styles.navigatorButtonText}>Previous</Text>
      </Pressable>
      <Text style={styles.navigatorLabel}>{label}</Text>
      <Pressable style={styles.navigatorButton} onPress={onNext}>
        <Text style={styles.navigatorButtonText}>Next</Text>
        <ChevronRight color="#0c4a6e" size={18} />
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
    backgroundColor: '#d6eef9',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  navigatorButtonText: {
    color: '#0c4a6e',
    fontWeight: '600',
  },
  navigatorLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#0f172a',
    fontWeight: '700',
  },
});
