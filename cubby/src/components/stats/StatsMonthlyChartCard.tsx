import { useMemo, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { formatCurrency } from '../../formatters';
import { styles } from './styles';
import { StatsMonthlyChartCardProps } from './types';
import { formatMonthKeyLabel, getMonthName } from './utils';

export default function StatsMonthlyStatsCard({
  effectiveSelectedYear,
  filteredEvents,
  monthlyStats,
}: StatsMonthlyChartCardProps) {
  const [activeTab, setActiveTab] = useState<'trend' | 'breakdown'>('trend');

  const monthlyChartData = useMemo(() => {
    const monthValues = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthEvents = filteredEvents.filter(
        (event) => new Date(event.eventDate).getMonth() === monthIndex
      );
      return monthEvents.reduce((sum, event) => sum + event.amount, 0);
    });

    return monthValues.map((value, monthIndex) => ({
      value,
      label: getMonthName(monthIndex).slice(0, 3),
    }));
  }, [filteredEvents]);

  const chartMaxValue = useMemo(() => {
    const maxValue = Math.max(...monthlyChartData.map((item) => item.value), 1);
    return Math.max(1, Math.ceil(maxValue / 1000) * 1000);
  }, [monthlyChartData]);

  const yAxisLabelTexts = useMemo(() => {
    const stepValue = chartMaxValue / 4;
    return [
      formatCurrency(0),
      formatCurrency(Math.round(stepValue)),
      formatCurrency(Math.round(stepValue * 2)),
      formatCurrency(Math.round(stepValue * 3)),
      formatCurrency(chartMaxValue),
    ];
  }, [chartMaxValue]);

  const monthlyBreakdownData = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthEvents = filteredEvents.filter(
        (event) => new Date(event.eventDate).getMonth() === monthIndex
      );
      const total = monthEvents.reduce((sum, event) => sum + event.amount, 0);

      return {
        month: getMonthName(monthIndex),
        total,
      };
    });
  }, [filteredEvents]);

  const chartWidth = Math.max(220, Math.min(280, Dimensions.get('window').width - 68));

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Monthly Stats</Text>
      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(monthlyStats.averageSavedPerMonth)}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Median</Text>
          <Text style={styles.metricValue}>{formatCurrency(monthlyStats.medianSavedPerMonth)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Best</Text>
          <Text style={styles.metricValue}>
            {monthlyStats.bestMonth ? formatCurrency(monthlyStats.bestMonth.total) : '-'}
          </Text>
          {monthlyStats.bestMonth ? (
            <Text style={styles.metricSubLabel}>
              {formatMonthKeyLabel(monthlyStats.bestMonth.month)}
            </Text>
          ) : null}
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Weakest</Text>
          <Text style={styles.metricValue}>
            {monthlyStats.weakestMonth ? formatCurrency(monthlyStats.weakestMonth.total) : '-'}
          </Text>
          {monthlyStats.weakestMonth ? (
            <Text style={styles.metricSubLabel}>
              {formatMonthKeyLabel(monthlyStats.weakestMonth.month)}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Monthly trend • {effectiveSelectedYear ?? 'Year'}</Text>

        <View style={styles.chartTabs}>
          <TouchableOpacity
            style={[styles.chartTab, activeTab === 'trend' && styles.chartTabActive]}
            onPress={() => setActiveTab('trend')}
          >
            <Text style={[styles.chartTabText, activeTab === 'trend' && styles.chartTabTextActive]}>
              Trend
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTab, activeTab === 'breakdown' && styles.chartTabActive]}
            onPress={() => setActiveTab('breakdown')}
          >
            <Text
              style={[styles.chartTabText, activeTab === 'breakdown' && styles.chartTabTextActive]}
            >
              Breakdown
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'trend' ? (
          <LineChart
            data={monthlyChartData}
            width={chartWidth}
            height={180}
            spacing={18}
            initialSpacing={8}
            noOfSections={4}
            maxValue={chartMaxValue}
            xAxisLabelTextStyle={{ color: '#64748b', fontSize: 10 }}
            yAxisTextStyle={{ color: '#64748b', fontSize: 10 }}
            yAxisLabelTexts={yAxisLabelTexts}
            yAxisLabelWidth={56}
            xAxisColor="#cbd5e1"
            yAxisColor="#cbd5e1"
            color="#0369a1"
            thickness={3}
            curved
            areaChart
            startFillColor="#38bdf8"
            endFillColor="#f8fbff"
            startOpacity={0.18}
            endOpacity={0.04}
            dataPointsColor="#0369a1"
            dataPointsRadius={4}
          />
        ) : (
          <View style={styles.breakdownList}>
            {monthlyBreakdownData.map((item) => (
              <View key={item.month} style={styles.breakdownRow}>
                <Text style={styles.breakdownMonth}>{item.month}</Text>
                <Text style={styles.breakdownAmount}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
