import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';

interface SettingsCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onPress?: () => void;
  children?: ReactNode;
}

export default function SettingsCard({
  title,
  subtitle,
  icon,
  onPress,
  children,
}: SettingsCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSummary}>{subtitle}</Text> : null}
        </View>
      </View>
      {children ? <View style={styles.cardBody}>{children}</View> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontWeight: '700',
    color: theme.text,
    fontSize: 16,
  },
  cardSummary: {
    color: theme.textMuted,
    fontSize: 13,
  },
  cardBody: {
    gap: 8,
  },
});
