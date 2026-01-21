/**
 * PORKYFARM MOBILE DESIGN TOKENS - PREMIUM EDITION
 * =================================================
 * Tokens de design premium pour React Native (Expo)
 * Palette verte professionnelle pour gestion d'elevage porcin
 */

import { StyleSheet, Platform } from 'react-native'

// ============================================
// COULEURS PREMIUM
// ============================================
// ⚠️ DEPRECATED: Pour les couleurs dynamiques (dark mode),
// utilisez `useColors()` ou `useTheme()` depuis ThemeContext.
// Ce fichier ne contient que les couleurs light mode statiques.
// Voir: lib/theme/tokens.ts pour le système de thème complet.

export const colors = {
  // Primary - Verts premium (identite de l'app)
  primary: '#2D6A4F',
  primaryLight: '#40916C',
  primaryLighter: '#52B788',
  primaryDark: '#1B4332',
  primarySurface: '#D8F3DC',

  // Accent - Dore chaleureux
  accent: '#E9C46A',
  accentLight: '#F4E4BA',

  // Categories (pour transactions et autres)
  categoryFood: '#74C69D',
  categoryHealth: '#E76F51',
  categoryEquipment: '#457B9D',
  categoryLabor: '#E9C46A',
  categoryOther: '#8D99AE',

  // Neutres premium
  background: '#FAFDF7',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F8F4',
  card: '#FFFFFF',

  // Textes
  foreground: '#1B4332',
  text: '#1B4332',
  textSecondary: '#52796F',
  textMuted: '#95A5A0',
  textSubtle: '#B8C4C0',
  mutedForeground: '#52796F',
  subtleForeground: '#95A5A0',
  textOnPrimary: '#FFFFFF',

  // Etats semantiques
  success: '#40916C',
  successLight: '#D1FAE5',
  warning: '#E9C46A',
  warningLight: '#FEF3C7',
  error: '#E76F51',
  errorLight: '#FEE2E2',
  info: '#457B9D',
  infoLight: '#DBEAFE',

  // Bordures
  border: '#E8F0EB',
  borderStrong: '#C8DED3',

  // Aliases pour compatibilite
  secondary: '#40916C',
  secondaryForeground: '#334155',
  muted: '#F1F8F4',
} as const

// ============================================
// GRADIENTS
// ============================================

export const gradients = {
  primary: ['#2D6A4F', '#52B788'] as const,
  primaryReverse: ['#52B788', '#2D6A4F'] as const,
  accent: ['#E9C46A', '#F4E4BA'] as const,
  surface: ['#FFFFFF', '#F1F8F4'] as const,
  success: ['#40916C', '#74C69D'] as const,
  warm: ['#E9C46A', '#E76F51'] as const,
} as const

// ============================================
// OMBRES PREMIUM
// ============================================

export const shadows = {
  sm: {
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
} as const

// Legacy export
export const elevation = shadows

// ============================================
// ESPACEMENT
// ============================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,

  // Composants
  cardPadding: 20,
  cardGap: 12,
  sectionPadding: 24,
  inputPadding: 14,
  buttonPadding: 16,

  // Touch targets
  touchTarget: 48,
  touchTargetLarge: 56,
} as const

// ============================================
// TYPOGRAPHIE PREMIUM
// ============================================

export const typography = {
  fontSize: {
    h1: 28,
    h2: 22,
    h3: 18,
    h4: 16,
    body: 16,
    bodySmall: 14,
    caption: 14,
    label: 14,
    small: 12,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const

// Styles de texte composes (pour usage direct)
export const textStyles = {
  h1: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize.h1 * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.foreground,
  },
  h2: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.h2 * typography.lineHeight.tight,
    color: colors.foreground,
  },
  h3: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.h3 * typography.lineHeight.normal,
    color: colors.foreground,
  },
  h4: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.h4 * typography.lineHeight.normal,
    color: colors.foreground,
  },
  bodyLarge: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.body * typography.lineHeight.relaxed,
    color: colors.foreground,
  },
  body: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.bodySmall * typography.lineHeight.normal,
    color: colors.foreground,
  },
  bodySmall: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.small * typography.lineHeight.normal,
    color: colors.textSecondary,
  },
  label: {
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.label * typography.lineHeight.normal,
    color: colors.foreground,
  },
  caption: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.small * typography.lineHeight.normal,
    color: colors.textMuted,
  },
  button: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.body * typography.lineHeight.tight,
  },
  buttonSmall: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.bodySmall * typography.lineHeight.tight,
  },
} as const

// ============================================
// RAYONS DE BORDURE PREMIUM
// ============================================

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
} as const

// ============================================
// ANIMATIONS
// ============================================

export const animation = {
  spring: {
    damping: 15,
    stiffness: 400,
  },
  springBouncy: {
    damping: 10,
    stiffness: 300,
  },
  springSmooth: {
    damping: 20,
    stiffness: 350,
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
} as const

// ============================================
// STYLES COMMUNS PREMIUM
// ============================================

export const commonStyles = StyleSheet.create({
  // Inputs
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.inputPadding,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.body,
    backgroundColor: colors.surface,
    color: colors.foreground,
    minHeight: spacing.touchTarget,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },

  // Buttons
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.inputPadding,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.touchTarget,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  buttonSecondary: {
    backgroundColor: colors.primarySurface,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textOnPrimary,
  },
  buttonSecondaryText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  buttonOutlineText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    gap: spacing.cardGap,
    ...shadows.card,
  },
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    gap: spacing.cardGap,
    ...shadows.md,
  },

  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },

  // Labels
  label: {
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Flex utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

// ============================================
// CATEGORY COLORS MAPPING
// ============================================

export const categoryColors: Record<string, string> = {
  food: colors.categoryFood,
  feed: colors.categoryFood,
  health: colors.categoryHealth,
  veterinary: colors.categoryHealth,
  equipment: colors.categoryEquipment,
  labor: colors.categoryLabor,
  sale: colors.success,
  other: colors.categoryOther,
}

// ============================================
// STATUS COLORS
// ============================================

export const statusColors = {
  active: colors.success,
  actif: colors.success,
  pending: colors.warning,
  en_cours: colors.warning,
  completed: colors.info,
  terminee: colors.info,
  failed: colors.error,
  avortee: colors.error,
  sold: colors.info,
  vendu: colors.info,
  deceased: colors.error,
  mort: colors.error,
} as const
