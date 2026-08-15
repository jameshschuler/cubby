import { StatusBar } from 'expo-status-bar';
import { Lock } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { achievements } from '../constants/achievement-constants';
import { getAchievementStatuses } from '../helpers/achievements';
import { useAppData } from '../core/app-data-context';
import { theme } from '../core/theme';

export default function AchievementsScreen() {
  const { data } = useAppData();
  const statuses = getAchievementStatuses(data);
  const earnedCount = achievements.filter((achievement) => statuses[achievement.id]).length;
  const progressRatio = achievements.length > 0 ? earnedCount / achievements.length : 0;
  const progressPercent = Math.round(progressRatio * 100);
  const ringSize = 58;
  const ringStrokeWidth = 7;
  const ringRadius = (ringSize - ringStrokeWidth) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progressRatio);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>Track milestones, streaks, and hidden unlocks.</Text>
          <View style={styles.progressSummaryRow}>
            <View style={styles.progressRingWrap}>
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={theme.accentSoft}
                  strokeWidth={ringStrokeWidth}
                  fill="none"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={theme.textOnAccent}
                  strokeWidth={ringStrokeWidth}
                  fill="none"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin={`${ringSize / 2}, ${ringSize / 2}`}
                />
              </Svg>
              <Text style={styles.progressRingText}>{progressPercent}%</Text>
            </View>

            <View style={styles.progressMetaWrap}>
              <Text style={styles.counterText}>
                {earnedCount} of {achievements.length} complete
              </Text>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {achievements.map((achievement) => {
            const isEarned = statuses[achievement.id];
            const isHiddenLocked = Boolean(achievement.hidden && !isEarned);
            const Icon = isHiddenLocked ? Lock : achievement.icon;
            const title = isHiddenLocked ? 'Hidden Achievement' : achievement.title;
            const description = isHiddenLocked
              ? 'Keep contributing to reveal this one.'
              : achievement.description;

            return (
              <View
                key={achievement.id}
                style={[styles.card, isEarned ? styles.cardEarned : styles.cardLocked]}
              >
                <View style={[styles.iconWrap, !isEarned && styles.iconWrapLocked]}>
                  <Icon
                    size={30}
                    color={isEarned ? theme.accentDeep : theme.textMuted}
                    strokeWidth={2.2}
                  />
                </View>
                <Text style={[styles.cardTitle, !isEarned && styles.cardTitleLocked]}>{title}</Text>
                <Text style={styles.cardBody}>{description}</Text>
                {achievement.tier ? (
                  <View style={styles.tierPill}>
                    <Text style={styles.tierPillText}>Tier {achievement.tier}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: theme.accentDeep,
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.textOnAccent,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.accentSoft,
  },
  counterText: {
    fontSize: 13,
    color: theme.textOnAccent,
    opacity: 0.92,
    fontWeight: '600',
  },
  progressSummaryRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressRingWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingText: {
    position: 'absolute',
    color: theme.textOnAccent,
    fontSize: 12,
    fontWeight: '700',
  },
  progressMetaWrap: {
    flex: 1,
    gap: 6,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.textOnAccent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    minHeight: 198,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 8,
  },
  cardEarned: {
    borderColor: theme.accent,
    shadowColor: theme.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardLocked: {
    opacity: 0.82,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapLocked: {
    opacity: 0.62,
  },
  cardTitle: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 16,
  },
  cardTitleLocked: {
    color: theme.textMuted,
  },
  cardBody: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  tierPill: {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    backgroundColor: theme.backgroundAlt,
  },
  tierPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accentDeep,
  },
});
