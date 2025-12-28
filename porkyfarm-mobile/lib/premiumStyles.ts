/**
 * PREMIUM STYLES - PORKYFARM MOBILE
 * ==================================
 * Styles premium pour composants haut de gamme (React Native)
 * Gradients, ombres, animations, effets glass contrôlés
 * Basés sur les tokens du design system
 */

import { StyleSheet } from 'react-native'
import { colors, spacing, radius, shadows } from './designTokens'

// ============================================
// GRADIENTS (couleurs pour LinearGradient)
// ============================================

export const premiumGradients = {
  // Gradient primary (vert forêt)
  primary: {
    light: [colors.primaryLight, colors.primary],
    medium: [colors.primary, colors.primaryDark],
    soft: [colors.primaryLight, colors.primary, colors.primaryDark],
  },

  // Gradient violet/indigo (Assistant IA)
  ai: {
    purple: ['#8b5cf6', '#a78bfa', '#c4b5fd'] as const,
    purpleSoft: ['rgba(139, 92, 246, 0.9)', 'rgba(167, 139, 250, 0.9)'] as const,
  },

  // Gradients sémantiques
  success: {
    soft: [colors.successLight, colors.success] as const,
    icon: [colors.success, '#059669'] as const,
  },
  warning: {
    soft: [colors.warningLight, colors.warning] as const,
    icon: [colors.warning, '#d97706'] as const,
  },
  error: {
    soft: [colors.errorLight, colors.error] as const,
    icon: [colors.error, '#dc2626'] as const,
  },
  info: {
    soft: [colors.infoLight, colors.info] as const,
    icon: [colors.info, '#2563eb'] as const,
  },
} as const

// ============================================
// OMBRES PREMIUM (pour React Native)
// ============================================

export const premiumShadows = {
  // Ombre douce pour cartes premium
  card: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
    },
  },

  // Ombre pour icônes avec gradient
  icon: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
  },

  // Ombre pour boutons premium
  button: {
    default: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    pressed: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
  },

  // Ombre pour FAB (Floating Action Button)
  fab: {
    default: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
    pressed: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const

// ============================================
// ANIMATIONS (valeurs pour Animated API)
// ============================================

export const premiumAnimations = {
  // Durées (ms)
  duration: {
    fast: 150,
    normal: 200,
    slow: 250,
  },

  // Valeurs de scale pour interactions
  scale: {
    hover: 1.02,
    press: 0.98,
    pressStrong: 0.96,
  },

  // Valeurs d'opacité
  opacity: {
    disabled: 0.5,
    pressed: 0.8,
    hover: 0.9,
    normal: 1,
  },
} as const

// ============================================
// EFFETS GLASS (overlays semi-transparents)
// ============================================

export const premiumGlass = {
  // Glass léger (pour bandeau IA, panels)
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Glass moyen
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Glass sur fond sombre
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
} as const

// ============================================
// STYLESHEET PREMIUM
// ============================================

export const premiumStyles = StyleSheet.create({
  // Carte premium
  card: {
    borderRadius: radius.lg,
    padding: spacing.base,
    ...premiumShadows.card.soft,
  },

  // Icône avec gradient (container)
  iconGradientContainer: {
    borderRadius: radius.md,
    padding: spacing.sm,
    ...premiumShadows.icon.soft,
  },

  // Badge avec gradient
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...premiumShadows.icon.soft,
  },

  // Bouton premium
  button: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    ...premiumShadows.button.default,
  },
})

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un style glass pour un composant React Native
 */
export function getGlassStyle(variant: 'light' | 'medium' | 'dark' = 'light') {
  return premiumGlass[variant]
}

/**
 * Génère un style d'ombre premium pour un composant
 */
export function getPremiumShadow(variant: 'card' | 'icon' | 'button' | 'fab' = 'card', intensity: 'soft' | 'medium' | 'strong' | 'default' | 'pressed' = 'soft') {
  const shadowMap = premiumShadows[variant]
  if (variant === 'card' || variant === 'icon') {
    return shadowMap[intensity as 'soft' | 'medium' | 'strong']
  }
  return shadowMap[intensity as 'default' | 'pressed']
}

