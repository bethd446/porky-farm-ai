/**
 * THEME PORKYFARM - DESIGN SYSTEM UNIFIÉ
 * ======================================
 * Palette verte moderne avec couleurs de fonctionnalités
 */

export const colors = {
  // Couleur principale - Vert Emeraude PorkyFarm
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',  // Couleur principale
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Catégories animaux
  category: {
    truie: '#EC4899',      // Rose
    verrat: '#8B5CF6',     // Violet
    porcelet: '#F59E0B',   // Orange
    engraissement: '#3B82F6', // Bleu
  },

  // Statuts
  status: {
    success: '#22C55E',    // Vert clair
    warning: '#F59E0B',    // Orange
    error: '#EF4444',      // Rouge
    info: '#3B82F6',       // Bleu
  },

  // Fonctionnalités
  feature: {
    health: '#EF4444',     // Rouge - Santé
    reproduction: '#EC4899', // Rose - Reproduction
    feeding: '#F59E0B',    // Orange - Alimentation
    tasks: '#8B5CF6',      // Violet - Tâches
    costs: '#3B82F6',      // Bleu - Coûts
    reports: '#10B981',    // Vert - Rapports
  },

  // Neutres
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Fonds
  background: {
    primary: '#F9FAFB',
    secondary: '#FFFFFF',
    card: '#FFFFFF',
  },

  // Texte
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Bordures
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    focus: '#10B981',
  },

  // Compatibilité avec ancien code (valeurs directes)
  success: '#22C55E',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Alias pour compatibilité avec designTokens.ts et Button.tsx
  surface: '#FFFFFF',
  card: '#FFFFFF',
  muted: '#F3F4F6',
  mutedForeground: '#6B7280',
  foreground: '#111827',
  subtleForeground: '#9CA3AF',
  primaryLight: '#D1FAE5',
  secondaryLight: '#DBEAFE',

  // Couleurs directes pour Button.tsx et autres composants
  // (évite d'avoir à écrire colors.primary[500])
  primaryColor: '#10B981',
  secondary: '#F3F4F6',
  textColor: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  // Gradients pour LinearGradient (TOUJOURS des tableaux avec au moins 2 éléments)
  gradientPrimary: ['#10B981', '#059669'] as const,
  gradientSecondary: ['#3B82F6', '#1D4ED8'] as const,
  gradientSuccess: ['#22C55E', '#16A34A'] as const,
  gradientWarning: ['#F59E0B', '#D97706'] as const,
  gradientError: ['#EF4444', '#DC2626'] as const,
  gradientWarm: ['#FEF3C7', '#FDE68A'] as const,
  gradientCool: ['#DBEAFE', '#BFDBFE'] as const,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const

// Alias pour compatibilité
export const borderRadius = radius

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
} as const

export const elevation = shadows

export const typography = {
  // Titres
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, color: '#111827' },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32, color: '#111827' },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28, color: '#111827' },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, color: '#111827' },
  // Corps
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, color: '#374151' },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24, color: '#374151' },
  bodySemibold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24, color: '#374151' },
  // Petits textes
  small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: '#6B7280' },
  smallMedium: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, color: '#6B7280' },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, color: '#9CA3AF' },
  // Labels
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, color: '#374151' },
} as const

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const

export const iconContainer = {
  sm: 36,
  md: 44,
  lg: 52,
  xl: 60,
} as const

export const touchTarget = {
  min: 44,
  normal: 48,
  large: 56,
} as const

export const animation = {
  spring: {
    gentle: { damping: 20, stiffness: 150 },
    bouncy: { damping: 12, stiffness: 200 },
    stiff: { damping: 25, stiffness: 300 },
    default: { damping: 15, stiffness: 400 },
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
} as const

// Export principal
export const theme = {
  colors,
  spacing,
  radius,
  borderRadius,
  shadows,
  elevation,
  typography,
  iconSize,
  iconContainer,
  touchTarget,
  animation,
} as const

// Types
export type Theme = typeof theme
export type ThemeColors = typeof colors

// Labels catégories animaux
export const categoryLabels: Record<string, string> = {
  truie: 'Truie',
  verrat: 'Verrat',
  porcelet: 'Porcelet',
  engraissement: 'Engraissement',
  sow: 'Truie',
  boar: 'Verrat',
  piglet: 'Porcelet',
  fattening: 'Engraissement',
}

// Couleurs par statut animal
export const animalStatusColors: Record<string, string> = {
  actif: '#22C55E',
  vendu: '#6B7280',
  mort: '#EF4444',
  reforme: '#F59E0B',
  active: '#22C55E',
  sold: '#6B7280',
  deceased: '#EF4444',
}

// Labels par statut animal
export const animalStatusLabels: Record<string, string> = {
  actif: 'Actif',
  vendu: 'Vendu',
  mort: 'Décédé',
  reforme: 'Réformé',
}

// Helper: obtenir couleur avec opacité
export const withOpacity = (color: string, opacity: number): string => {
  const hex = opacity.toString(16).padStart(2, '0').slice(0, 2)
  return `${color}${hex}`
}

// Helper: couleur de fond légère
export const getLightBg = (color: string): string => `${color}15`
