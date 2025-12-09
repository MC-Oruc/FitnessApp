import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, type ThemeValues } from './ThemeProvider';
import { radii, spacing, typography } from './tokens';

export function createThemeStyles(theme: ThemeValues) {
  const { colors } = theme;
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerLabel: {
      fontSize: typography.label.fontSize,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
      color: colors.accent,
    },
    titleLg: {
      fontSize: typography.titleLg.fontSize,
      fontWeight: typography.titleLg.fontWeight,
      letterSpacing: typography.titleLg.letterSpacing,
      color: colors.textPrimary,
    },
    titleMd: {
      fontSize: typography.titleMd.fontSize,
      fontWeight: typography.titleMd.fontWeight,
      letterSpacing: typography.titleMd.letterSpacing,
      color: colors.textPrimary,
    },
    subtitle: {
      marginTop: spacing.xs + 4,
      fontSize: typography.body.fontSize,
      color: colors.textMuted,
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pill: {
      paddingHorizontal: spacing.lg - 2,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillText: {
      fontSize: typography.pill.fontSize,
      fontWeight: typography.pill.fontWeight,
      color: colors.textMuted,
    },
    pillActive: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentBorder,
    },
    pillTextActive: {
      color: colors.accent,
    },
    pressed: {
      opacity: 0.7,
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonActive: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentBorder,
    },
    iconButtonIcon: {
      fontSize: 20,
      color: colors.iconMuted,
    },
    iconButtonIconActive: {
      color: colors.accent,
    },
    segmented: {
      paddingHorizontal: spacing.lg + spacing.xs,
      paddingVertical: spacing.md - spacing.xs,
      borderRadius: radii.sm,
    },
    segmentedLeft: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    segmentedMiddle: {
      borderRadius: 0,
    },
    segmentedRight: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    segmentedActive: {
      backgroundColor: colors.accentSoft,
    },
    segmentedText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    segmentedTextActive: {
      color: colors.accent,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md - spacing.xs,
      color: colors.textSecondary,
      fontSize: 14,
    },
    sectionLabel: {
      fontSize: 12,
      color: colors.textSubtle,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    buttonPrimary: {
      backgroundColor: colors.accent,
      borderRadius: radii.lg,
      paddingVertical: spacing.lg - spacing.xs,
      alignItems: 'center',
    },
    buttonPrimaryText: {
      color: colors.background,
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
    },
  });
}

export function useThemedStyles() {
  const theme = useTheme();
  return useMemo(() => createThemeStyles(theme), [theme.colors, theme.scheme]);
}
