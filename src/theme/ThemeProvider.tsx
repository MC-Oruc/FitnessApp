import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import {
  darkColors,
  lightColors,
  radii,
  spacing,
  typography,
  type ColorTokens,
  type ThemeScheme,
} from './tokens';

export type ThemePreference = 'system' | ThemeScheme;

export type ThemeValues = {
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  scheme: ThemeScheme;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeValues | undefined>(undefined);

function normalizeScheme(
  scheme: ColorSchemeName | null | undefined,
  fallback: ThemeScheme,
): ThemeScheme {
  if (scheme === 'dark' || scheme === 'light') return scheme;
  return fallback;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ThemeScheme>(() =>
    normalizeScheme(Appearance.getColorScheme(), 'dark'),
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme((prev) => normalizeScheme(colorScheme, prev));
    });
    return () => sub.remove();
  }, []);

  const resolvedScheme: ThemeScheme =
    preference === 'system' ? systemScheme : preference;

  const colors = resolvedScheme === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeValues>(
    () => ({
      colors,
      spacing,
      radii,
      typography,
      scheme: resolvedScheme,
      preference,
      setPreference,
    }),
    [colors, resolvedScheme, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
