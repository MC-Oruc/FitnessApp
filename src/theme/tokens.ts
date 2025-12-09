export const darkColors = {
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceAlt: '#1a1a24',
  border: '#1f1f2e',
  borderMuted: '#27272a',
  accent: '#00d4aa',
  accentSoft: '#00d4aa15',
  accentBorder: '#00d4aa40',
  accentGlow: 'rgba(0, 212, 170, 0.03)',
  textPrimary: '#fafafa',
  textSecondary: '#e5e7eb',
  textMuted: '#71717a',
  textSubtle: '#52525b',
  textFaint: '#6b7280',
  iconMuted: '#52525b',
  overlay: 'rgba(0, 0, 0, 0.6)',
  danger: '#f87171',
  warning: '#f97316',
  info: '#3b82f6',
};

export const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  border: '#e2e8f0',
  borderMuted: '#e5e7eb',
  accent: '#00d4aa',
  accentSoft: '#00d4aa14',
  accentBorder: '#00d4aa35',
  accentGlow: 'rgba(0, 212, 170, 0.08)',
  textPrimary: '#0f172a',
  textSecondary: '#111827',
  textMuted: '#475569',
  textSubtle: '#64748b',
  textFaint: '#94a3b8',
  iconMuted: '#94a3b8',
  overlay: 'rgba(0, 0, 0, 0.45)',
  danger: '#dc2626',
  warning: '#ea580c',
  info: '#2563eb',
};

export type ColorTokens = typeof darkColors;
export type ThemeScheme = 'light' | 'dark';

// Default export kept for backward-compatibility with static imports.
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radii = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  pill: 20,
  round: 999,
};

export const typography = {
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 2 },
  titleLg: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  titleMd: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  body: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '500' as const },
  pill: { fontSize: 12, fontWeight: '500' as const },
  button: { fontSize: 15, fontWeight: '700' as const },
};
