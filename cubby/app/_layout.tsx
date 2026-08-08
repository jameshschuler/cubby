import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View } from 'react-native';

import { AppDataProvider, useAppData } from '../src/core/app-data-context';
import AchievementNotifier from '../src/components/ui/AchievementNotifier';

type DefaultPropsTextComponent = typeof Text & {
  defaultProps?: {
    style?: unknown;
  };
};

type DefaultPropsTextInputComponent = typeof TextInput & {
  defaultProps?: {
    style?: unknown;
  };
};

const textComponent = Text as DefaultPropsTextComponent;
const textInputComponent = TextInput as DefaultPropsTextInputComponent;

const textDefaultProps = textComponent.defaultProps ?? {};
textComponent.defaultProps = {
  ...textDefaultProps,
  style: [{ fontFamily: 'Georgia' }, textDefaultProps.style],
};

const textInputDefaultProps = textInputComponent.defaultProps ?? {};
textInputComponent.defaultProps = {
  ...textInputDefaultProps,
  style: [{ fontFamily: 'Georgia' }, textInputDefaultProps.style],
};

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore repeated calls when the native splash is already being managed.
});

const NATIVE_SPLASH_MIN_MS = 700;

function RootNavigator() {
  const { isReady } = useAppData();
  const [hasLaidOut, setHasLaidOut] = useState(false);
  const mountedAtMs = useRef(Date.now());
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    if (!isReady || !hasLaidOut || hasHiddenSplash.current) {
      return;
    }

    hasHiddenSplash.current = true;

    // Keep the splash visible for a minimum duration so launch branding is perceivable.
    const elapsed = Date.now() - mountedAtMs.current;
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
      <RootNavigator />
    </AppDataProvider>
  );
}
