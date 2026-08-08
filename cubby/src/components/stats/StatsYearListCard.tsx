import { Pressable, Text, View } from 'react-native';

import { formatCurrency } from '../../helpers/formatters';
import { styles } from './styles';
import { StatsYearListCardProps } from './types';

export default function StatsYearBreakdownCard({
  totalsByYear,
  effectiveSelectedYear,
  onSelectYear,
}: StatsYearListCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>By Year</Text>
      {totalsByYear.length === 0 ? (
        <Text style={styles.emptyText}>No savings history yet for this goal.</Text>
      ) : (
        <>
          <View style={styles.pillWrap}>
            {totalsByYear.map((entry) => (
              <Pressable
                key={entry.year}
                onPress={() => onSelectYear(entry.year)}
                style={[styles.pill, effectiveSelectedYear === entry.year && styles.pillActive]}
              >
                <Text
                  style={[
                    styles.pillText,
                    effectiveSelectedYear === entry.year && styles.pillTextActive,
                  ]}
                >
                  {entry.year}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.yearList}>
            {totalsByYear.map((entry) => (
              <View key={entry.year} style={styles.yearRow}>
                <Text style={styles.yearLabel}>{entry.year}</Text>
                <Text style={styles.yearValue}>{formatCurrency(entry.total)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
