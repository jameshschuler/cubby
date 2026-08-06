import { ArrowRight, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { FirstRunOnboardingCardProps } from './types';

export default function FirstRunOnboardingCard({ onCreateGoal }: FirstRunOnboardingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Sparkles color={theme.accent} size={20} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Welcome to Cubby</Text>
        <Text style={styles.body}>
          Start with one goal to track your progress, see your momentum, and build a simple plan.
        </Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={onCreateGoal} accessibilityRole="button">
        <Text style={styles.primaryButtonText}>Create first goal</Text>
        <ArrowRight color={theme.textOnAccent} size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.accent,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.accentDeep,
  },
  body: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: theme.textOnAccent,
    fontWeight: '700',
  },
});
