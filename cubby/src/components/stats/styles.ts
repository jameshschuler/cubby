import { StyleSheet } from 'react-native';

import { theme } from '../../core/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
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
    color: '#fff',
  },
  subtitle: {
    color: theme.accentSoft,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    fontWeight: '700',
    color: theme.text,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  helperText: {
    color: theme.textMuted,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.backgroundAlt,
  },
  pillActive: {
    backgroundColor: theme.accentDeep,
    borderColor: theme.accentDeep,
  },
  pillText: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsStack: {
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  rateCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  rateValue: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  progressValue: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  progressSubtext: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: theme.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 10,
    overflow: 'hidden',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    flexBasis: '48%',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  metricLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  metricSubLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  chartTitle: {
    color: theme.accentDeep,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  chartTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  chartTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  chartTabActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  chartTabText: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  chartTabTextActive: {
    color: '#fff',
  },
  breakdownList: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.surface,
  },
  breakdownMonth: {
    color: theme.text,
    fontWeight: '600',
  },
  breakdownAmount: {
    color: theme.accent,
    fontWeight: '700',
  },
  chartCanvas: {
    width: '100%',
    alignItems: 'center',
  },
  chartValueBadgeContainer: {
    width: 132,
    height: 60,
    marginLeft: -57,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartValueBadge: {
    backgroundColor: theme.accentDeep,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    minWidth: 110,
  },
  chartValueBadgeMonth: {
    color: theme.accentSoft,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  chartValueBadgeText: {
    color: theme.textOnAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  yearList: {
    gap: 8,
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
  },
  yearLabel: {
    color: theme.text,
    fontWeight: '700',
  },
  yearValue: {
    color: theme.accent,
    fontWeight: '700',
  },
  historyScroll: {
    maxHeight: 440,
  },
  historyScrollContent: {
    gap: 8,
  },
  eventRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  eventAmount: {
    color: theme.accent,
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  eventGoalName: {
    color: theme.text,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'Georgia',
  },
  eventDate: {
    color: theme.text,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  eventCreated: {
    color: theme.textMuted,
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  emptyState: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 20,
  },
  emptyText: {
    color: theme.textMuted,
  },
});
