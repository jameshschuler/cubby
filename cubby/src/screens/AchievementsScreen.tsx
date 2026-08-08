import { StatusBar } from 'expo-status-bar';
import { Lock } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { achievements } from '../constants/achievement-constants';
import { getAchievementStatuses } from '../helpers/achievements';
import { useAppData } from '../core/app-data-context';
import { theme } from '../core/theme';

export default function AchievementsScreen() {
  const { data } = useAppData();
  const statuses = getAchievementStatuses(data);
  const earnedCount = achievements.filter((achievement) => statuses[achievement.id]).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>Track milestones, streaks, and hidden unlocks.</Text>
          <Text style={styles.counterText}>
            {earnedCount} of {achievements.length} earned
          </Text>
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
                <Text
                  style={[styles.statusText, isEarned ? styles.statusEarned : styles.statusLocked]}
                >
                  {isEarned ? 'Earned' : 'Locked'}
                </Text>
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
    marginTop: 4,
    fontSize: 13,
    color: theme.textOnAccent,
    opacity: 0.92,
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
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusEarned: {
    color: theme.growth,
  },
  statusLocked: {
    color: theme.textMuted,
  },
});
