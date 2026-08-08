import { useMemo, useState } from 'react';

import { useAppData } from '../../core/app-data-context';
import { Goal, ProgressEvent } from '../../core/types';
import { MonthlyStats, YearTotal } from './types';

interface UseStatsDataResult {
  goals: Goal[];
  selection: {
    selectedGoalId: string | 'all';
    setSelectedGoalId: React.Dispatch<React.SetStateAction<string | 'all'>>;
    selectedYear: number | null;
    setSelectedYear: React.Dispatch<React.SetStateAction<number | null>>;
    effectiveSelectedGoalId: string | 'all' | null;
    showAllGoals: boolean;
    selectedGoal: Goal | null;
  };
  totals: {
    totalSavedAllTime: number;
    totalsByYear: YearTotal[];
    effectiveSelectedYear: number | null;
    selectedYearTotal: number;
  };
  history: {
    filteredEvents: ProgressEvent[];
    goalNameById: Map<string, string>;
    monthlyStats: MonthlyStats;
  };
}

export default function useStatsData(): UseStatsDataResult {
  const { data } = useAppData();
  const [selectedGoalId, setSelectedGoalId] = useState<string | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const effectiveSelectedGoalId = useMemo(() => {
    if (!data.goals.length) {
      return null;
    }

    if (selectedGoalId === 'all') {
      return 'all';
    }

    if (selectedGoalId && data.goals.some((goal) => goal.id === selectedGoalId)) {
      return selectedGoalId;
    }

    return data.goals[0].id;
  }, [data.goals, selectedGoalId]);

  const showAllGoals = effectiveSelectedGoalId === 'all';

  const selectedGoal = useMemo(
    () =>
      showAllGoals
        ? null
        : (data.goals.find((goal) => goal.id === effectiveSelectedGoalId) ?? null),
    [data.goals, effectiveSelectedGoalId, showAllGoals]
  );

  const relevantGoalIds = useMemo(() => {
    if (!data.goals.length) {
      return showAllGoals
        ? Array.from(new Set(data.progressEvents.map((event) => event.goalId)))
        : [];
    }

    if (showAllGoals) {
      return Array.from(
        new Set([
          ...data.goals.map((goal) => goal.id),
          ...data.progressEvents.map((event) => event.goalId),
        ])
      );
    }

    return selectedGoal ? [selectedGoal.id] : [];
  }, [data.goals, data.progressEvents, selectedGoal, showAllGoals]);

  const relevantEvents = useMemo(() => {
    if (!relevantGoalIds.length) {
      return [];
    }

    return data.progressEvents
      .filter((event) => relevantGoalIds.includes(event.goalId))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [data.progressEvents, relevantGoalIds]);

  const totalSavedAllTime = useMemo(
    () => relevantEvents.reduce((total, event) => total + event.amount, 0),
    [relevantEvents]
  );

  const totalsByYear = useMemo<YearTotal[]>(() => {
    const grouped = new Map<number, number>();

    relevantEvents.forEach((event) => {
      const year = new Date(event.eventDate).getFullYear();
      grouped.set(year, (grouped.get(year) ?? 0) + event.amount);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, total]) => ({ year, total }));
  }, [relevantEvents]);

  const effectiveSelectedYear = useMemo(() => {
    if (!totalsByYear.length) {
      return null;
    }

    if (selectedYear !== null && totalsByYear.some((entry) => entry.year === selectedYear)) {
      return selectedYear;
    }

    return totalsByYear[0].year;
  }, [selectedYear, totalsByYear]);

  const selectedYearTotal = useMemo(() => {
    if (effectiveSelectedYear === null) {
      return 0;
    }

    return totalsByYear.find((entry) => entry.year === effectiveSelectedYear)?.total ?? 0;
  }, [effectiveSelectedYear, totalsByYear]);

  const filteredEvents = useMemo(() => {
    if (effectiveSelectedYear === null) {
      return relevantEvents;
    }

    return relevantEvents.filter(
      (event) => new Date(event.eventDate).getFullYear() === effectiveSelectedYear
    );
  }, [effectiveSelectedYear, relevantEvents]);

  const goalNameById = useMemo(() => {
    const lookup = new Map<string, string>();
    data.goals.forEach((goal) => {
      lookup.set(goal.id, goal.name);
    });
    data.progressEvents.forEach((event) => {
      if (!lookup.has(event.goalId)) {
        lookup.set(event.goalId, 'Deleted goal');
      }
    });
    return lookup;
  }, [data.goals, data.progressEvents]);

  const monthlyStats = useMemo<MonthlyStats>(() => {
    const groupedByMonth = new Map<string, number>();

    relevantEvents.forEach((event) => {
      const date = new Date(event.eventDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      groupedByMonth.set(monthKey, (groupedByMonth.get(monthKey) ?? 0) + event.amount);
    });

    const monthTotals = Array.from(groupedByMonth.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => b.total - a.total);

    const monthlyValues = monthTotals.map((entry) => entry.total);
    const averageSavedPerMonth = monthlyValues.length
      ? monthlyValues.reduce((sum, value) => sum + value, 0) / monthlyValues.length
      : 0;
    const medianSavedPerMonth = monthlyValues.length
      ? (monthlyValues.sort((a, b) => a - b)[Math.floor(monthlyValues.length / 2)] ?? 0)
      : 0;

    return {
      averageSavedPerMonth,
      medianSavedPerMonth,
      bestMonth: monthTotals[0] ?? null,
      weakestMonth: monthTotals.length ? monthTotals[monthTotals.length - 1] : null,
    };
  }, [relevantEvents]);

  return {
    goals: data.goals,
    selection: {
      selectedGoalId,
      setSelectedGoalId,
      selectedYear,
      setSelectedYear,
      effectiveSelectedGoalId,
      showAllGoals,
      selectedGoal,
    },
    totals: {
      totalSavedAllTime,
      totalsByYear,
      effectiveSelectedYear,
      selectedYearTotal,
    },
    history: {
      filteredEvents,
      goalNameById,
      monthlyStats,
    },
  };
}
