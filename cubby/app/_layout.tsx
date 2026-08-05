import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput } from 'react-native';

import { AppDataProvider } from '../src/app-data-context';

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

export default function RootLayout() {
  return (
    <AppDataProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-goal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </AppDataProvider>
  );
}
