import { Pencil } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '../../helpers/formatters';
import { theme } from '../../core/theme';
import FirstRunOnboardingCard from '../onboarding/FirstRunOnboardingCard';
import { getProgressFillColor, recurringStateAutoContributionLabels } from './constants/constants';
import { HomeGoalsCardProps } from './types';

export default function HomeGoalsCard({
  selectedView,
  visibleGoals,
  getDisplayedGoalProgress,
  onEditActual,
  onCreateGoal,
}: HomeGoalsCardProps) {
  const formatBadgeLabel = (value: string) =>
    value
      .split(' ')
      .map((word) =>
        word
          .split('-')
          .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
          .join('-')
      )
      .join(' ');

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Goals</Text>
      {visibleGoals.length === 0 ? (
        <FirstRunOnboardingCard
          onCreateGoal={onCreateGoal}
          title={
            selectedView === 'one-time' ? 'No one-time goals yet' : `No ${selectedView} goals yet`
          }
          body={
            selectedView === 'one-time'
              ? 'Add a one-time goal to track a single finish line alongside your recurring accounts.'
              : `Add a ${selectedView} goal to start tracking progress, targets, and automatic contributions in this view.`
          }
          buttonLabel="Add goal"
        />
      ) : (
        visibleGoals.map((goal) => {
          const progress = getDisplayedGoalProgress(goal);
          const displayName = goal.nickname || goal.name;
          const origin = goal.origin ? formatBadgeLabel(goal.origin) : null;
          const accountTypeLabel = goal.accountType ? formatBadgeLabel(goal.accountType) : null;
          const categoryLabel = goal.category ? formatBadgeLabel(goal.category) : null;
          const tagLabels = [origin, accountTypeLabel, categoryLabel]
            .filter(Boolean)
            .slice(0, 2) as string[];

          const progressRatio =
            goal.targetAmount > 0 ? Math.max(0, Math.min(progress / goal.targetAmount, 1)) : 0;
          const rawProgressPercent =
            goal.targetAmount > 0
              ? Math.max(0, Math.round((progress / goal.targetAmount) * 100))
              : 0;
          const progressPercent = Math.min(rawProgressPercent, 999);
          const progressStatus =
            progressPercent >= 100 ? 'Complete' : `${progressPercent}% complete`;
          const cadenceLabel = goal.isRecurring
            ? recurringStateAutoContributionLabels[goal.recurringState].replace('/', '').trim()
            : 'one-time';

          return (
            <View key={goal.id} style={styles.goalRow}>
              <View style={styles.goalHeader}>
                <View style={styles.goalHeaderText}>
                  <Text style={styles.goalName}>{displayName}</Text>
                  {tagLabels.length > 0 ? (
                    <View style={styles.badgeRow}>
                      {tagLabels.map((tagLabel) => (
                        <View key={`${goal.id}-${tagLabel}`} style={styles.badge}>
                          <Text style={styles.badgeText}>{tagLabel}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.goalAmountRow}>
                <Text style={styles.goalProgress}>{formatCurrency(progress)}</Text>
                <Text style={styles.goalTarget}>of {formatCurrency(goal.targetAmount)}</Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progressPercent, 100)}%`,
                      backgroundColor: getProgressFillColor(progressRatio),
                    },
                  ]}
                />
              </View>

              <View style={styles.goalMetaRow}>
                <Text style={styles.goalMetaText}>{progressStatus}</Text>
                {goal.autoContributionAmount ? (
                  <Text numberOfLines={1} style={styles.goalMetaText}>
                    {formatCurrency(goal.autoContributionAmount)}{' '}
                    {recurringStateAutoContributionLabels[goal.recurringState]} auto
                  </Text>
                ) : (
                  <Text style={styles.goalMetaText}>{cadenceLabel}</Text>
                )}
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => onEditActual(goal)}
                  style={styles.editButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit actual amount for ${displayName}`}
                >
                  <Pencil color={theme.textMuted} size={14} />
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    gap: 12,
  },
  cardTitle: {
    fontWeight: '700',
    color: theme.text,
    fontSize: 16,
    letterSpacing: 0.2,
    fontFamily: 'Georgia',
  },
  emptyText: {
    color: theme.textMuted,
  },
  goalRow: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 9,
    backgroundColor: theme.surface,
    shadowColor: theme.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalHeaderText: {
    flex: 1,
    gap: 4,
  },
  goalName: {
    fontWeight: '700',
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
    backgroundColor: theme.backgroundAlt,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textMuted,
  },
  goalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  goalProgress: {
    color: theme.accent,
    fontWeight: '700',
    fontSize: 20,
  },
  goalTarget: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.accentHighlight,
  },
  goalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  goalMetaText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
