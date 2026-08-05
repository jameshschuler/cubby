import { Pressable, StyleSheet, Text, View } from 'react-native';
import { filterLabel, goalFilters } from './constants';
import { ViewFilterTabsProps } from './types';

export default function ViewFilterTabs({ selectedView, onSelect }: ViewFilterTabsProps) {
  return (
    <View style={styles.periodRow}>
      {goalFilters.map((view) => (
        <Pressable
          key={view}
          onPress={() => onSelect(view)}
          style={[styles.periodButton, selectedView === view && styles.periodButtonActive]}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedView === view && styles.periodButtonTextActive,
            ]}
          >
            {filterLabel[view as 'week' | 'month' | 'year']}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#d9edf8',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  periodButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#0369a1',
  },
  periodButtonText: {
    textTransform: 'capitalize',
    color: '#075985',
    fontWeight: '600',
    fontSize: 12,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
});
