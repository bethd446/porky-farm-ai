/**
 * Styles premium (Ultra Design Émotionnel)
 * Gradients, ombres douces, animations subtiles
 */

import { colors } from './designTokens'

// Palettes de gradients basées sur les couleurs du design system
export const premiumGradients = {
  primary: {
    icon: ['#2d6a4f', '#1e4d3a'] as const,
    card: ['#f0fdf4', '#dcfce7'] as const,
  },
  success: {
    icon: ['#10b981', '#059669'] as const,
    card: ['#ecfdf5', '#d1fae5'] as const,
  },
  warning: {
    icon: ['#f59e0b', '#d97706'] as const,
    card: ['#fffbeb', '#fef3c7'] as const,
  },
  error: {
    icon: ['#ef4444', '#dc2626'] as const,
    card: ['#fef2f2', '#fee2e2'] as const,
  },
  info: {
    icon: ['#3b82f6', '#2563eb'] as const,
    card: ['#eff6ff', '#dbeafe'] as const,
  },
  violet: {
    icon: ['#8b5cf6', '#7c3aed'] as const,
    card: ['#f5f3ff', '#ede9fe'] as const,
  },
  ai: {
    purple: ['#8b5cf6', '#7c3aed'] as const,
  },
} as const

// Ombres douces pour profondeur
export const premiumShadows = {
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
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  icon: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  button: {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    pressed: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  fab: {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    pressed: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
} as const

// Effet glass (blur léger)
export const premiumGlass = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
} as const

// Styles réutilisables
export const premiumStyles = {
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.card,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  iconGradientContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
} as const

/**
 * Génère un style d'ombre premium pour un composant
 */
export function getPremiumShadow(
  variant: 'card' | 'icon' | 'button' | 'fab' = 'card',
  intensity: 'soft' | 'medium' | 'strong' = 'soft'
): typeof premiumShadows.card.soft {
  if (variant === 'card' || variant === 'icon') {
    return premiumShadows[variant][intensity]
  }
  // Pour button et fab, utiliser 'default' ou 'pressed'
  return premiumShadows[variant].default
}
