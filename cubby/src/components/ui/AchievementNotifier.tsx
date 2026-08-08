import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

import { AchievementId, getAchievementStatuses } from '../../helpers/achievements';
import { useAppData } from '../../core/app-data-context';
import { theme } from '../../core/theme';

const NOTIFIED_ACHIEVEMENTS_STORAGE_KEY = 'cubby.notified-achievements.v1';
const TOAST_VISIBLE_MS = 2600;
const TOAST_ENTER_MS = 220;
const TOAST_EXIT_MS = 180;

const ACHIEVEMENT_TITLES: Record<AchievementId, string> = {
  'first-goal': 'First Goal',
  'first-deposit': 'First Deposit',
  'profile-complete': 'Profile Complete',
  planner: 'Planner',
  'quarter-tank': 'Quarter Tank',
  'halfway-there': 'Halfway There',
  'goal-crushed': 'Goal Crushed',
  'on-a-roll': 'Three Logs',
  'weekly-streak': 'Monthly Check-In',
  'first-1000': 'First 1000',
  'goal-builder': 'Goal Builder',
  'over-target': 'Over Target',
  nice: 'Nice',
  'logo-tap': 'Boop',
  'all-base-achievements': 'Base Camp',
  'all-secret-achievements': 'Full Set',
};

function parseSavedNotifiedIds(raw: string | null): Set<AchievementId> {
  if (!raw) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((value): value is AchievementId => typeof value === 'string'));
  } catch {
    return new Set();
  }
}

export default function AchievementNotifier() {
  const { data, isReady } = useAppData();
  const statuses = useMemo(() => getAchievementStatuses(data), [data]);

  const previousStatusesRef = useRef<Record<AchievementId, boolean> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<Set<AchievementId>>(new Set());
  const [pendingQueue, setPendingQueue] = useState<AchievementId[]>([]);
  const [activeAchievementId, setActiveAchievementId] = useState<AchievementId | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-12)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const hideActiveToast = (onHidden?: () => void) => {
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: TOAST_EXIT_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: -10,
        duration: TOAST_EXIT_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveAchievementId(null);
      onHidden?.();
    });
  };

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(NOTIFIED_ACHIEVEMENTS_STORAGE_KEY)
      .then((raw) => {
        if (!isMounted) {
          return;
        }

        setNotifiedIds(parseSavedNotifiedIds(raw));
        setIsLoaded(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setIsLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const payload = JSON.stringify(Array.from(notifiedIds));
    AsyncStorage.setItem(NOTIFIED_ACHIEVEMENTS_STORAGE_KEY, payload).catch(() => {
      // Do not block unlock notifications if this save fails.
    });
  }, [isLoaded, notifiedIds]);

  useEffect(() => {
    if (!isLoaded || !isReady) {
      return;
    }

    const previous = previousStatusesRef.current;

    if (!previous) {
      previousStatusesRef.current = statuses;
      return;
    }

    const ids = Object.keys(statuses) as AchievementId[];
    const newlyUnlocked = ids.filter((id) => statuses[id] && !previous[id] && !notifiedIds.has(id));

    previousStatusesRef.current = statuses;

    if (newlyUnlocked.length === 0) {
      return;
    }

    setPendingQueue((current) => [...current, ...newlyUnlocked]);
    setNotifiedIds((current) => {
      const next = new Set(current);
      for (const id of newlyUnlocked) {
        next.add(id);
      }
      return next;
    });
  }, [isLoaded, isReady, notifiedIds, statuses]);

  useEffect(() => {
    if (activeAchievementId || pendingQueue.length === 0) {
      return;
    }

    setActiveAchievementId(pendingQueue[0]);
    setPendingQueue((current) => current.slice(1));
  }, [activeAchievementId, pendingQueue]);

  useEffect(() => {
    if (!activeAchievementId) {
      clearHideTimer();
      return;
    }

    if (Platform.OS !== 'web') {
      Vibration.vibrate(18);
    }

    toastOpacity.setValue(0);
    toastTranslateY.setValue(-12);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: TOAST_ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: TOAST_ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      hideActiveToast();
    }, TOAST_VISIBLE_MS);

    return () => {
      clearHideTimer();
    };
  }, [activeAchievementId, toastOpacity, toastTranslateY]);

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, []);

  if (!activeAchievementId) {
    return null;
  }

  const title = ACHIEVEMENT_TITLES[activeAchievementId];

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
      >
        <Text style={styles.heading}>Achievement Unlocked</Text>
        <Text style={styles.title}>{title}</Text>
        <Pressable
          onPress={() => {
            clearHideTimer();
            hideActiveToast(() => {
              router.push('/(tabs)/achievements');
            });
          }}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="View achievements"
        >
          <Text style={styles.buttonText}>View</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  toast: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface,
    padding: 12,
    shadowColor: theme.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    gap: 4,
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.growth,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  button: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: theme.accentDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    color: theme.textOnAccent,
    fontWeight: '700',
    fontSize: 12,
  },
});
