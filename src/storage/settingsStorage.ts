import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '../theme/ThemeProvider';
import type { Language } from '../i18n/translations';

const THEME_KEY = 'settings:themePreference';
const LANGUAGE_KEY = 'settings:language';

const SUPPORTED_THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];
const SUPPORTED_LANGUAGES: Language[] = ['en', 'tr'];

export type PersistedSettings = {
  themePreference?: ThemePreference;
  language?: Language;
};

function parseThemePreference(raw: string | null): ThemePreference | undefined {
  if (!raw) return undefined;
  if (SUPPORTED_THEME_PREFERENCES.includes(raw as ThemePreference)) {
    return raw as ThemePreference;
  }
  return undefined;
}

function parseLanguage(raw: string | null): Language | undefined {
  if (!raw) return undefined;
  if (SUPPORTED_LANGUAGES.includes(raw as Language)) {
    return raw as Language;
  }
  return undefined;
}

export async function loadSettings(): Promise<PersistedSettings> {
  try {
    const entries = await AsyncStorage.multiGet([THEME_KEY, LANGUAGE_KEY]);
    const values: Record<string, string | null> = {};
    entries.forEach(([key, value]) => {
      values[key] = value;
    });

    return {
      themePreference: parseThemePreference(values[THEME_KEY] ?? null),
      language: parseLanguage(values[LANGUAGE_KEY] ?? null),
    };
  } catch {
    return {};
  }
}

export async function persistThemePreference(pref: ThemePreference) {
  try {
    await AsyncStorage.setItem(THEME_KEY, pref);
  } catch {
    // ignore persistence errors to avoid blocking UI
  }
}

export async function persistLanguage(lang: Language) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // ignore persistence errors to avoid blocking UI
  }
}
