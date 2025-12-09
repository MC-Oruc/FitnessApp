import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n/I18nProvider';
import { useThemedStyles } from '../theme/styles';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';

export default function ProgramPlaceholderScreen() {
  const { t, language } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerLabel = useMemo(
    () => t('tabs.program').toLocaleUpperCase(language === 'tr' ? 'tr-TR' : undefined),
    [language, t],
  );

  return (
    <View style={themeStyles.screen}>
      <View style={styles.header}>
        <Text style={[themeStyles.headerLabel, styles.headerLabel]}>
          {headerLabel}
        </Text>
        <Text style={themeStyles.titleMd}>{t('placeholders.program.title')}</Text>
        <Text style={[themeStyles.subtitle, styles.subtitle]}>
          {t('placeholders.program.description')}
        </Text>
        <Text style={styles.note}>{t('placeholders.program.note')}</Text>
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
  });
