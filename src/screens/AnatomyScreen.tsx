import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import AnatomySvgFront from '../components/AnatomySvgFront';
import AnatomySvgBack from '../components/AnatomySvgBack';
import { ToggleButton } from '../components/ui';
import { useThemedStyles } from '../theme/styles';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';
import type { RootTabParamList } from '../navigation/MainTabs';
import { useTranslation } from '../i18n/I18nProvider';

type Props = {
  navigation: {
    navigate: (
      screen: 'Exercises',
      params: RootTabParamList['Exercises']
    ) => void;
  };
};

export default function AnatomyScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const themeStyles = useThemedStyles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [detailMode, setDetailMode] = useState<'simple' | 'detailed'>('simple');

  const handleSelectRegion = ({
    keyword,
    label,
  }: {
    keyword: string;
    label: string;
  }) => {
    Vibration.vibrate(30);
    navigation.navigate('Exercises', {
      muscleKeyword: keyword,
      muscleLabel: label,
    });
  };

  return (
    <View style={themeStyles.screen}>
      {/* Gradient overlay effect */}
      <View style={styles.gradientTop} />

      <View style={styles.header}>
        <Text style={[themeStyles.headerLabel, styles.headerLabel]}>
          {t('anatomy.headerLabel')}
        </Text>
        <Text style={themeStyles.titleLg}>{t('anatomy.title')}</Text>
        <Text style={[themeStyles.subtitle, styles.subtitle]}>
          {t('anatomy.subtitle')}
        </Text>
      </View>

      <View style={styles.toggleContainer}>
        {/* Ön/Arka Görünüm */}
        <View style={styles.toggleRow}>
          <ToggleButton
            label={t('anatomy.front')}
            active={viewSide === 'front'}
            onPress={() => setViewSide('front')}
            position="left"
          />
          <ToggleButton
            label={t('anatomy.back')}
            active={viewSide === 'back'}
            onPress={() => setViewSide('back')}
            position="right"
          />
        </View>

        {/* Basit/Ayrıntılı */}
        <View style={[styles.toggleRow, styles.detailToggle]}>
          <ToggleButton
            label={t('anatomy.simple')}
            active={detailMode === 'simple'}
            onPress={() => setDetailMode('simple')}
            position="left"
          />
          <ToggleButton
            label={t('anatomy.detailed')}
            active={detailMode === 'detailed'}
            onPress={() => setDetailMode('detailed')}
            position="right"
          />
        </View>
      </View>

      <View style={styles.svgContainer}>
        <View style={styles.svgGlow} />
        <View style={styles.svgWrapper}>
          {viewSide === 'front' ? (
            <AnatomySvgFront
              onSelectRegion={handleSelectRegion}
              detailMode={detailMode}
            />
          ) : (
            <AnatomySvgBack
              onSelectRegion={handleSelectRegion}
              detailMode={detailMode}
            />
          )}
        </View>
      </View>

      <View style={styles.hint}>
        <View style={styles.hintDot} />
        <Text style={styles.hintText}>
          {detailMode === 'simple'
            ? t('anatomy.hintSimple')
            : t('anatomy.hintDetailed')}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    gradientTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      backgroundColor: colors.background,
      opacity: 0.8,
    },
    header: {
      paddingTop: 48,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    headerLabel: {
      marginBottom: 8,
    },
    subtitle: {
      textAlign: 'center',
    },
    toggleContainer: {
      marginTop: 24,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    toggleRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    detailToggle: {
      marginTop: 10,
    },
    svgContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    svgGlow: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.accent,
      opacity: 0.03,
    },
    svgWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    hint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 16,
      gap: 8,
    },
    hintDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    hintText: {
      fontSize: 12,
      color: colors.textSubtle,
    },
  });
