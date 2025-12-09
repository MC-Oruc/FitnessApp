import React, { useMemo } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainTabs from './src/navigation/MainTabs';
import { I18nProvider } from './src/i18n/I18nProvider';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function ThemedNavigation() {
  const { colors, scheme } = useTheme();

  const navigationTheme = useMemo(
    () => ({
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.surface,
        border: colors.border,
        primary: colors.accent,
        text: colors.textPrimary,
      },
    }),
    [colors, scheme],
  );

  const statusBarStyle = scheme === 'dark' ? 'light' : 'dark';

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={statusBarStyle} />
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <ThemedNavigation />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
