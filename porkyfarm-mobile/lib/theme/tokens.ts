/**
 * Design Tokens 2026 - PorkyFarm
 * ==============================
 * Glassmorphism subtil + palette categorielle + dark mode
 */

// ===========================================
// COULEURS
// ===========================================

export const colors = {
  // Brand (Vert)
  brand: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Categories animaux
  category: {
    truie: '#EC4899',
    verrat: '#8B5CF6',
    porcelet: '#F59E0B',
    engraissement: '#059669',
  },

  // Status
  status: {
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // Finance
  finance: {
    income: '#10B981',
    expense: '#EF4444',
    balance: '#3B82F6',
  },

  // Neutral
  neutral: {
    0: '#FFFFFF',
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
    950: '#030712',
  },
} as const

// ===========================================
// THEMES LIGHT / DARK
// ===========================================

export const lightTheme = {
  background: colors.neutral[0],
  surface: colors.neutral[50],
  surfaceElevated: colors.neutral[0],
  border: colors.neutral[200],
  borderLight: colors.neutral[100],

  text: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textMuted: colors.neutral[400],
  textInverse: colors.neutral[0],

  primary: colors.brand[500],
  primaryLight: colors.brand[100],
  primaryDark: colors.brand[700],

  // Glassmorphism
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    blur: 12,
    border: 'rgba(255, 255, 255, 0.2)',
  },

  // Status colors
  ...colors.status,
} as const

export const darkTheme = {
  background: colors.neutral[900],
  surface: colors.neutral[800],
  surfaceElevated: colors.neutral[700],
  border: colors.neutral[700],
  borderLight: colors.neutral[800],

  text: colors.neutral[50],
  textSecondary: colors.neutral[300],
  textMuted: colors.neutral[500],
  textInverse: colors.neutral[900],

  primary: colors.brand[400],
  primaryLight: colors.brand[900],
  primaryDark: colors.brand[300],

  // Glassmorphism
  glass: {
    background: 'rgba(31, 41, 55, 0.85)',
    blur: 12,
    border: 'rgba(255, 255, 255, 0.1)',
  },

  // Status colors
  ...colors.status,
} as const

export type ThemeColors = typeof lightTheme | typeof darkTheme

// ===========================================
// SPACING
// ===========================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const

// ===========================================
// BORDER RADIUS
// ===========================================

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const

// ===========================================
// TYPOGRAPHY
// ===========================================

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const

// ===========================================
// SHADOWS
// ===========================================

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
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const

// ===========================================
// ANIMATIONS
// ===========================================

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  scale: {
    pressed: 0.98,
    active: 1.02,
  },
} as const

// ===========================================
// CATEGORY HELPERS
// ===========================================

export const getCategoryColor = (category: string): string => {
  const map: Record<string, string> = {
    truie: colors.category.truie,
    sow: colors.category.truie,
    verrat: colors.category.verrat,
    boar: colors.category.verrat,
    porcelet: colors.category.porcelet,
    piglet: colors.category.porcelet,
    engraissement: colors.category.engraissement,
    fattening: colors.category.engraissement,
  }
  return map[category.toLowerCase()] || colors.brand[500]
}

export const getStatusColor = (status: string, theme: ThemeColors): string => {
  const map: Record<string, string> = {
    healthy: theme.success,
    sick: theme.error,
    critical: theme.error,
    warning: theme.warning,
    pregnant: theme.info,
    active: theme.success,
  }
  return map[status.toLowerCase()] || theme.textMuted
}
