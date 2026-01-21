/**
 * Styles premium (Ultra Design Émotionnel)
 * Gradients, ombres douces, animations subtiles
 */

import { colors } from './designTokens'

// Palettes de gradients premium alinees sur le design system
export const premiumGradients = {
  primary: {
    icon: ['#2D6A4F', '#52B788'] as const,
    card: ['#D8F3DC', '#F1F8F4'] as const,
    button: ['#2D6A4F', '#40916C'] as const,
  },
  success: {
    icon: ['#40916C', '#74C69D'] as const,
    card: ['#D1FAE5', '#ECFDF5'] as const,
    button: ['#40916C', '#52B788'] as const,
  },
  warning: {
    icon: ['#E9C46A', '#F4E4BA'] as const,
    card: ['#FEF3C7', '#FFFBEB'] as const,
    button: ['#E9C46A', '#D97706'] as const,
  },
  error: {
    icon: ['#E76F51', '#F4A261'] as const,
    card: ['#FEE2E2', '#FEF2F2'] as const,
    button: ['#E76F51', '#DC2626'] as const,
  },
  info: {
    icon: ['#457B9D', '#6B9AC4'] as const,
    card: ['#DBEAFE', '#EFF6FF'] as const,
    button: ['#457B9D', '#3B82F6'] as const,
  },
  accent: {
    icon: ['#E9C46A', '#E76F51'] as const,
    card: ['#F4E4BA', '#FEF3C7'] as const,
    button: ['#E9C46A', '#D97706'] as const,
  },
  ai: {
    purple: ['#8B5CF6', '#7C3AED'] as const,
    icon: ['#8B5CF6', '#A78BFA'] as const,
  },
} as const

// Ombres premium avec teinte verte subtile
export const premiumShadows = {
  card: {
    soft: {
      shadowColor: '#2D6A4F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#2D6A4F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    strong: {
      shadowColor: '#2D6A4F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  icon: {
    soft: {
      shadowColor: '#1B4332',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    medium: {
      shadowColor: '#1B4332',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    strong: {
      shadowColor: '#1B4332',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  button: {
    default: {
      shadowColor: '#2D6A4F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    pressed: {
      shadowColor: '#2D6A4F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  fab: {
    default: {
      shadowColor: '#2D6A4F',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    pressed: {
      shadowColor: '#2D6A4F',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
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
) {
  if (variant === 'card' || variant === 'icon') {
    return premiumShadows[variant][intensity]
  }
  // Pour button et fab, utiliser 'default' ou 'pressed'
  return premiumShadows[variant].default
}
