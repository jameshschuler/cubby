import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';

interface GoalFormHeaderProps {
  title: string;
  onDismiss: () => void;
  accessibilityLabel?: string;
}

export default function GoalFormHeader({
  title,
  onDismiss,
  accessibilityLabel = 'Close goal editor',
}: GoalFormHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerTextWrap}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Pressable
        onPress={onDismiss}
        style={styles.dismissButton}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={10}
      >
        <X color={theme.text} size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.accentDeep,
  },
  dismissButton: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
});
