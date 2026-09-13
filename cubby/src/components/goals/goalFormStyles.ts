import { StyleSheet } from 'react-native';

import { theme } from '../../core/theme';

export const goalFormStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingTop: 44,
    paddingBottom: 40,
    gap: 26,
  },
  checkboxControlRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.surface,
    marginTop: 6,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fieldLabel: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  requiredMark: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '700',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
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
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  pillText: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  subSectionCard: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginTop: 2,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  subSectionTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  subSectionHelper: {
    color: theme.textMuted,
    fontSize: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingVertical: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    borderColor: theme.accent,
    backgroundColor: theme.accent,
  },
  checkboxIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: theme.textOnAccent,
  },
  checkboxLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  optionalSection: {
    gap: 20,
    paddingTop: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 2,
  },
  primaryButton: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.textOnAccent,
    fontWeight: '700',
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  navigationButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surfaceMuted,
  },
  secondaryButtonText: {
    color: theme.text,
    fontWeight: '700',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  pickerText: {
    color: theme.text,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pickerField: {
    flex: 1,
    gap: 6,
  },
  pickerLabel: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
