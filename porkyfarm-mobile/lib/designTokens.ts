/**
 * PORKYFARM MOBILE DESIGN TOKENS
 * ==============================
 * Tokens de design pour React Native (Expo)
 * Alignés avec lib/design-tokens.ts (web)
 */

import { StyleSheet } from 'react-native'

// ============================================
// COULEURS
// ============================================

export const colors = {
  // Primary (Vert forêt - Branding PorkyFarm)
  primary: '#2d6a4f',
  primaryLight: '#40916c',
  primaryDark: '#1b4332',

  // Secondary
  secondary: '#f1f5f9',
  secondaryForeground: '#334155',

  // Accent
  accent: '#d4a373',
  accentLight: '#e8c4a0',

  // Backgrounds
  background: '#fafaf8',
  card: '#ffffff',
  muted: '#f5f5f5',

  // Textes
  foreground: '#1a1a1a',
  mutedForeground: '#6b7280',
  subtleForeground: '#9ca3af',

  // Bordures
  border: '#e5e7eb',
  borderStrong: '#d1d5db',

  // États sémantiques
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
} as const

// ============================================
// ESPACEMENT (Basé sur 4px)
// ============================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,

  // Composants
  cardPadding: 16,
  cardGap: 12,
  sectionPadding: 24,
  inputPadding: 12,
  buttonPadding: 16,

  // Touch targets
  touchTarget: 44,
  touchTargetLarge: 56,
} as const

// ============================================
// TYPOGRAPHIE
// ============================================

export const typography = {
  fontSize: {
    h1: 24,
    h2: 20,
    h3: 18,
    h4: 16,
    body: 16,
    bodySmall: 14,
    caption: 12,
    label: 14,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const

// ============================================
// BORDERS & RADIUS
// ============================================

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

// ============================================
// OMBRES (React Native)
// ============================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const

// ============================================
// STYLES RÉUTILISABLES
// ============================================

export const commonStyles = StyleSheet.create({
  // Cartes
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },

  // Boutons
  button: {
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.buttonPadding,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
  },

  // Inputs
  input: {
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.inputPadding,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    fontSize: typography.fontSize.body,
    color: colors.foreground,
  },

  // Listes
  listItem: {
    minHeight: 64, // Touch-friendly
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
})

// ============================================
// ICÔNES (Lucide React Native)
// ============================================

export const iconNames = {
  dashboard: 'LayoutDashboard',
  livestock: 'PiggyBank',
  health: 'Stethoscope',
  reproduction: 'Baby',
  feeding: 'Calculator',
  ai: 'Brain',
  profile: 'User',
  add: 'Plus',
  edit: 'Pencil',
  delete: 'Trash2',
  success: 'CheckCircle',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
} as const

