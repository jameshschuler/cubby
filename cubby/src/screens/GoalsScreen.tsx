import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { useAppData } from '../core/app-data-context';
import FirstRunOnboardingCard from '../components/onboarding/FirstRunOnboardingCard';
import { Goal } from '../core/types';
import GoalDetailsModal from '../components/goals/GoalDetailsModal';
import GoalsHeader from '../components/goals/GoalsHeader';
import GoalsTemplatesCard from '../components/goals/GoalsTemplatesCard';
import { GoalDetailsInput } from '../components/goals/types';
import { shouldShowOnboarding } from '../helpers/onboarding';
import { theme } from '../core/theme';

export default function GoalsScreen() {
  const { data, updateGoal, deleteGoal } = useAppData();

  const [goalDetailsId, setGoalDetailsId] = useState<string | null>(null);

  const visibleGoals = useMemo(() => data.goals, [data.goals]);
  const showOnboarding = shouldShowOnboarding(data);
  const selectedGoal = useMemo(
    () => visibleGoals.find((goal) => goal.id === goalDetailsId) ?? null,
    [goalDetailsId, visibleGoals]
  );

  const openGoalDetailsDialog = (goal: Goal) => {
    setGoalDetailsId(goal.id);
  };

  const closeGoalDetailsDialog = () => {
    setGoalDetailsId(null);
  };

  const handleSaveGoalDetails = (goalId: string, input: GoalDetailsInput) => {
    updateGoal(goalId, input);
    closeGoalDetailsDialog();
  };

  const handleDeleteGoal = (goalId: string, removeAssociatedData: boolean) => {
    deleteGoal(goalId, removeAssociatedData);
    closeGoalDetailsDialog();
  };

  const handleAddGoal = () => {
    router.push('/add-goal');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <GoalsHeader onAddGoal={handleAddGoal} />
        {showOnboarding ? (
          <FirstRunOnboardingCard onCreateGoal={handleAddGoal} />
        ) : (
          <GoalsTemplatesCard
            goals={visibleGoals}
            progressEvents={data.progressEvents}
            onEditGoal={openGoalDetailsDialog}
            onDeleteGoal={handleDeleteGoal}
            onCreateGoal={handleAddGoal}
          />
        )}
      </ScrollView>

      <GoalDetailsModal
        key={selectedGoal?.id ?? 'none'}
        goal={selectedGoal}
        visible={goalDetailsId !== null}
        onClose={closeGoalDetailsDialog}
        onSave={handleSaveGoalDetails}
      />
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
    gap: 14,
  },
});
