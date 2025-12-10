import React, { useEffect, useMemo, useState } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainTabs from './src/navigation/MainTabs';
import { I18nProvider } from './src/i18n/I18nProvider';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { loadSettings, type PersistedSettings } from './src/storage/settingsStorage';
import SplashScreen from './src/components/SplashScreen';

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

function AppProviders() {
  const [settings, setSettings] = useState<PersistedSettings | null>(null);
  const [hasMinDuration, setHasMinDuration] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timeout = setTimeout(() => {
      if (isMounted) setHasMinDuration(true);
    }, 1400);

    (async () => {
      try {
        const loaded = await loadSettings();
        if (isMounted) {
          setSettings(loaded);
        }
      } catch {
        if (isMounted) {
          setSettings({});
        }
      }
    })();
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const shouldShowSplash = settings === null || !hasMinDuration;

  if (shouldShowSplash) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider initialPreference={settings.themePreference}>
      <I18nProvider initialLanguage={settings.language}>
        <ThemedNavigation />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProviders />
    </SafeAreaProvider>
  );
}
