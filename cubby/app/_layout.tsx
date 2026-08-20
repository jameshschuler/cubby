import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { AppDataProvider, useAppData } from '../src/core/app-data-context';
import AchievementNotifier from '../src/components/ui/AchievementNotifier';

const NATIVE_SPLASH_MIN_MS = 700;

function RootNavigator() {
  const { isReady } = useAppData();
  const [hasLaidOut, setHasLaidOut] = useState(false);
  const mountedAtMs = useRef<number | null>(null);
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    if (mountedAtMs.current === null) {
      mountedAtMs.current = Date.now();
    }
  }, []);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {
      // Ignore repeated calls when the native splash is already being managed.
    });
  }, []);

  useEffect(() => {
    if (!isReady || !hasLaidOut || hasHiddenSplash.current) {
      return;
    }

    hasHiddenSplash.current = true;

    // Keep the splash visible for a minimum duration so launch branding is perceivable.
    const elapsed = Date.now() - (mountedAtMs.current ?? Date.now());
    const delay = Math.max(0, NATIVE_SPLASH_MIN_MS - elapsed);

    const hideTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {
        // Keep startup resilient if the splash was already dismissed.
      });
    }, delay);

    return () => clearTimeout(hideTimer);
  }, [hasLaidOut, isReady]);

  return (
    <View style={{ flex: 1 }} onLayout={() => setHasLaidOut(true)}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-goal" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <AchievementNotifier />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppDataProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AppDataProvider>
  );
}
