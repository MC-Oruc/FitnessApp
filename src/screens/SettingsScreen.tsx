import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from '../i18n/I18nProvider';
import { useThemedStyles } from '../theme/styles';
import { useTheme, type ThemePreference } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';

export default function SettingsScreen() {
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { colors, preference: themePreference, setPreference } = useTheme();
  const themeStyles = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const headerLabel = useMemo(
    () => t('tabs.settings').toLocaleUpperCase(language === 'tr' ? 'tr-TR' : undefined),
    [language, t],
  );
  const themeOptions: { key: ThemePreference; label: string }[] = [
    { key: 'system', label: t('placeholders.settings.themeSystem') },
    { key: 'light', label: t('placeholders.settings.themeLight') },
    { key: 'dark', label: t('placeholders.settings.themeDark') },
  ];

  return (
    <View style={themeStyles.screen}>
      <View style={styles.header}>
        <Text style={[themeStyles.headerLabel, styles.headerLabel]}>
          {headerLabel}
        </Text>
        <Text style={themeStyles.titleMd}>{t('placeholders.settings.title')}</Text>
        <Text style={[themeStyles.subtitle, styles.subtitle]}>
          {t('placeholders.settings.description')}
        </Text>
        <Text style={styles.note}>{t('placeholders.settings.note')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('placeholders.settings.themeLabel')}
          </Text>
          <Text style={styles.sectionNote}>
            {t('placeholders.settings.themeNote')}
          </Text>
          <View style={styles.languageRow}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setPreference(opt.key)}
                style={({ pressed }) => [
                  styles.languageButton,
                  themePreference === opt.key && styles.languageButtonActive,
                  pressed && styles.languageButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    themePreference === opt.key &&
                      styles.languageButtonTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('placeholders.settings.languageLabel')}
          </Text>
          <Text style={styles.sectionNote}>
            {t('placeholders.settings.languageNote')}
          </Text>
          <View style={styles.languageRow}>
            {availableLanguages.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={({ pressed }) => [
                  styles.languageButton,
                  language === lang.code && styles.languageButtonActive,
                  pressed && styles.languageButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === lang.code &&
                      styles.languageButtonTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    header: {
      paddingTop: 48,
      paddingHorizontal: 20,
      paddingBottom: 18,
    },
    headerLabel: {
      marginBottom: 8,
    },
    subtitle: {
      marginTop: 8,
    },
    note: {
      color: colors.textSubtle,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    section: {
      marginTop: 24,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 6,
    },
    sectionNote: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 12,
      lineHeight: 18,
    },
    languageRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    languageButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    languageButtonActive: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentBorder,
    },
    languageButtonPressed: {
      opacity: 0.7,
    },
    languageButtonText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    languageButtonTextActive: {
      color: colors.accent,
    },
  });
