import { ArrowRight, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FirstRunOnboardingCardProps } from './types';

export default function FirstRunOnboardingCard({ onCreateGoal }: FirstRunOnboardingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Sparkles color="#0369a1" size={20} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Welcome to Cubby</Text>
        <Text style={styles.body}>
          Start with one goal to track your progress, see your momentum, and build a simple plan.
        </Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={onCreateGoal} accessibilityRole="button">
        <Text style={styles.primaryButtonText}>Create first goal</Text>
        <ArrowRight color="#fff" size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    shadowColor: '#0369a1',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#082f49',
  },
  body: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0369a1',
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
