import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';
import type { Exercise } from '../data/exercises';

type Props = {
  exercise: Exercise;
  onPress?: () => void;
  cnsBadgeText?: string;
};

const CNS_COLORS: Record<Exercise['cns_fatigue'], { bg: string; text: string }> = {
  Low: { bg: '#00d4aa20', text: '#00d4aa' },
  Moderate: { bg: '#3b82f620', text: '#60a5fa' },
  High: { bg: '#f9731620', text: '#fb923c' },
  'Very High': { bg: '#ef444420', text: '#f87171' },
};

export default function ExerciseCard({ exercise, onPress, cnsBadgeText }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cnsColor = CNS_COLORS[exercise.cns_fatigue] || CNS_COLORS.Moderate;
  const badgeText = cnsBadgeText ?? exercise.cns_fatigue;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>◇</Text>
        </View>
        <View style={[styles.cnsBadge, { backgroundColor: cnsColor.bg }]}>
          <Text style={[styles.cnsBadgeText, { color: cnsColor.text }]}>
            {badgeText}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {exercise.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.equipmentBadge}>
            <Text style={styles.equipmentText}>{exercise.equipment}</Text>
          </View>
        </View>

        {exercise.targets?.length > 0 && (
          <Text style={styles.targets} numberOfLines={1}>
            {exercise.targets.slice(0, 2).map((t) => t.muscle.split(' ')[0]).join(' • ')}
          </Text>
        )}
      </View>

      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },
    cardPressed: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.accentBorder,
    },
    imageContainer: {
      position: 'relative',
    },
    imagePlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    imagePlaceholderIcon: {
      color: colors.iconMuted,
      fontSize: 24,
    },
    cnsBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    cnsBadgeText: {
      fontSize: 8,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    content: {
      flex: 1,
      marginLeft: 14,
      justifyContent: 'center',
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 20,
      marginBottom: 6,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    equipmentBadge: {
      backgroundColor: colors.borderMuted,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    equipmentText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    targets: {
      marginTop: 6,
      fontSize: 11,
      color: colors.textSubtle,
      fontWeight: '500',
    },
    arrow: {
      paddingLeft: 8,
    },
    arrowText: {
      fontSize: 24,
      color: colors.iconMuted,
      fontWeight: '300',
    },
  });
