import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { availableLanguages, translations, type Language } from './translations';
import { persistLanguage } from '../storage/settingsStorage';

type Vars = Record<string, string | number>;

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Vars) => string;
  availableLanguages: typeof availableLanguages;
};

type I18nProviderProps = {
  children: React.ReactNode;
  initialLanguage?: Language;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const FALLBACK_LANGUAGE: Language = 'en';
const SUPPORTED_LANGUAGES = Object.keys(translations) as Language[];

function resolveFromNavigator(): Language {
  const navigatorLang =
    typeof navigator !== 'undefined'
      ? navigator.language || navigator.languages?.[0]
      : undefined;
  const intlLang =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().locale
      : undefined;
  const guess = navigatorLang || intlLang;
  const normalized = guess?.split('-')[0].toLowerCase();
  if (normalized && SUPPORTED_LANGUAGES.includes(normalized as Language)) {
    return normalized as Language;
  }
  return FALLBACK_LANGUAGE;
}

function getValueForKey(lang: Language, key: string) {
  const parts = key.split('.');
  let current: unknown = translations[lang];
  for (const part of parts) {
    if (!current || typeof current !== 'object') break;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, varName) =>
    vars[varName] !== undefined ? String(vars[varName]) : '',
  );
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(
    initialLanguage ?? resolveFromNavigator(),
  );

  const translate = useCallback(
    (key: string, vars?: Vars) => {
      const fromCurrent = getValueForKey(language, key);
      const fromFallback = getValueForKey(FALLBACK_LANGUAGE, key);
      const template = fromCurrent ?? fromFallback ?? key;
      return interpolate(template, vars);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage: (lang: Language) => {
        if (SUPPORTED_LANGUAGES.includes(lang)) {
          setLanguage(lang);
        }
      },
      t: translate,
      availableLanguages,
    }),
    [language, translate],
  );

  useEffect(() => {
    persistLanguage(language);
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return ctx;
}
