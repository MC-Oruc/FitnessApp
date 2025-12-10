import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Appearance,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  darkColors,
  lightColors,
  radii,
  spacing,
  typography,
  type ColorTokens,
} from '../theme/tokens';

export default function SplashScreen() {
  const scheme = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
  const palette = useMemo(
    () => (scheme === 'light' ? lightColors : darkColors),
    [scheme],
  );
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.container}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />

      <View style={styles.card}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>Initializing</Text>
        </View>

        <Text style={styles.title}>FitnessApp</Text>
        <Text style={styles.subtitle}>Loading your preferences</Text>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.row}>
          <ActivityIndicator color={palette.accent} />
          <Text style={styles.hint}>Syncing theme & language</Text>
        </View>
      </View>
    </View>
  );
}

const CARD_WIDTH = 320;

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xxl,
    },
    glowPrimary: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      top: '12%',
      right: '2%',
      backgroundColor: colors.accentGlow,
      transform: [{ rotate: '12deg' }],
    },
    glowSecondary: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      bottom: '10%',
      left: '4%',
      backgroundColor: colors.accentGlow,
      transform: [{ rotate: '-8deg' }],
    },
    card: {
      width: CARD_WIDTH,
      maxWidth: '92%',
      backgroundColor: colors.surface,
      borderColor: colors.accentBorder,
      borderWidth: 1,
      borderRadius: radii.xl,
      padding: spacing.xl,
      gap: spacing.lg,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 18,
      elevation: 10,
    },
    pill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radii.pill,
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentBorder,
      borderWidth: 1,
    },
    pillDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    pillText: {
      color: colors.textSecondary,
      fontSize: typography.small.fontSize,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.titleMd.fontSize,
      fontWeight: typography.titleMd.fontWeight,
      letterSpacing: typography.titleMd.letterSpacing,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
    },
    progressTrack: {
      height: 8,
      borderRadius: radii.round,
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.border,
      borderWidth: 1,
      overflow: 'hidden',
    },
    progressFill: {
      width: '68%',
      height: '100%',
      backgroundColor: colors.accent,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    hint: {
      color: colors.textSubtle,
      fontSize: 13,
    },
  });
