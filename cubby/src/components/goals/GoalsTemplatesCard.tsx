import { Pencil, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '../../formatters';
import { theme } from '../../theme';
import { Goal } from '../../types';
import { recurringStateAutoContributionLabels } from './constants';
import { GoalsTemplatesCardProps } from './types';

export default function GoalsTemplatesCard({
  goals,
  progressEvents,
  onEditGoal,
  onDeleteGoal,
}: GoalsTemplatesCardProps) {
  const handleDelete = (goal: Goal) => {
    Alert.alert(
      'Delete goal?',
      'Choose whether to keep historical progress data for stats or remove it too.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Goal Only', onPress: () => onDeleteGoal(goal.id, false) },
        {
          text: 'Delete Goal + Data',
          style: 'destructive',
          onPress: () => onDeleteGoal(goal.id, true),
        },
      ]
    );
  };

  const formatUpdatedDate = (isoDate: string): string | null => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const now = new Date();
    const includeYear = date.getFullYear() !== now.getFullYear();

    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      ...(includeYear ? { year: 'numeric' } : {}),
    });
  };

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
      {goals.length === 0 ? (
        <Text style={styles.emptyText}>No goals yet. Add one from the goal modal.</Text>
      ) : (
        goals.map((goal) => {
          const account = goal.accountType ? formatBadgeLabel(goal.accountType) : null;
          const category = goal.category ? formatBadgeLabel(goal.category) : null;
          const origin = goal.origin ? formatBadgeLabel(goal.origin) : null;
          const tagLabels = [origin, account, category].filter(Boolean).slice(0, 2) as string[];
          const cadenceLabel = formatBadgeLabel(goal.isRecurring ? goal.cadence : 'One-time');
          const updatedLabel = formatUpdatedDate(goal.updatedAt);

          return (
            <View key={goal.id} style={styles.goalRow}>
              <View style={styles.goalHeader}>
                <View style={styles.goalHeaderText}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  {tagLabels.length > 0 ? (
                    <View style={styles.goalPillsRow}>
                      {tagLabels.map((tagLabel) => (
                        <View key={`${goal.id}-${tagLabel}`} style={styles.goalPill}>
                          <Text style={styles.goalPillText}>{tagLabel}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.goalAmountRow}>
                <Text style={styles.goalProgress}>{formatCurrency(goal.targetAmount)}</Text>
                <Text style={styles.goalTarget}>Target</Text>
              </View>

              <View style={styles.goalMetaRow}>
                <Text style={styles.goalMetaText}>{cadenceLabel}</Text>
                <Text numberOfLines={1} style={styles.goalMetaText}>
                  {updatedLabel ? `Updated ${updatedLabel}` : ''}
                </Text>
              </View>

              {goal.autoContributionAmount ? (
                <Text style={styles.autoContributionText}>
                  Auto contributes {formatCurrency(goal.autoContributionAmount)}{' '}
                  {recurringStateAutoContributionLabels[goal.recurringState]}
                </Text>
              ) : null}

              <View style={styles.goalActionsRow}>
                <Pressable
                  onPress={() => onEditGoal(goal)}
                  style={styles.editButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${goal.name}`}
                >
                  <Pencil color={theme.textMuted} size={14} />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(goal)}
                  style={styles.deleteButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${goal.name}`}
                >
                  <Trash2 color="#b45309" size={14} />
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
  emptyText: {
    color: '#475569',
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
    gap: 6,
  },
  goalPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  goalPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: theme.backgroundAlt,
  },
  goalPillText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
  },
  goalName: {
    fontWeight: '700',
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
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
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.border,
    overflow: 'hidden',
  },
  goalMetaText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  goalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  autoContributionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  goalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
  deleteButton: {
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
