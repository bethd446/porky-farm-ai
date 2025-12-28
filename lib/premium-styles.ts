/**
 * PREMIUM STYLES - PORKYFARM WEB
 * ===============================
 * Styles premium pour composants haut de gamme
 * Gradients, ombres, animations, effets glass contrôlés
 * Basés sur les tokens du design system
 */

import { colors, spacing, radius, shadows } from "./design-tokens"

// ============================================
// GRADIENTS (basés sur les couleurs du DS)
// ============================================

export const premiumGradients = {
  // Gradient primary (vert forêt)
  primary: {
    light: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.DEFAULT} 100%)`,
    medium: `linear-gradient(135deg, ${colors.primary.DEFAULT} 0%, ${colors.primary.dark} 100%)`,
    soft: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.DEFAULT} 50%, ${colors.primary.dark} 100%)`,
  },

  // Gradient violet/indigo (Assistant IA)
  ai: {
    purple: `linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)`,
    purpleSoft: `linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(167, 139, 250, 0.9) 100%)`,
  },

  // Gradients sémantiques
  success: {
    soft: `linear-gradient(135deg, ${colors.success.light} 0%, ${colors.success.DEFAULT} 100%)`,
    icon: `linear-gradient(135deg, ${colors.success.DEFAULT} 0%, #059669 100%)`,
  },
  warning: {
    soft: `linear-gradient(135deg, ${colors.warning.light} 0%, ${colors.warning.DEFAULT} 100%)`,
    icon: `linear-gradient(135deg, ${colors.warning.DEFAULT} 0%, #d97706 100%)`,
  },
  error: {
    soft: `linear-gradient(135deg, ${colors.error.light} 0%, ${colors.error.DEFAULT} 100%)`,
    icon: `linear-gradient(135deg, ${colors.error.DEFAULT} 0%, #dc2626 100%)`,
  },
  info: {
    soft: `linear-gradient(135deg, ${colors.info.light} 0%, ${colors.info.DEFAULT} 100%)`,
    icon: `linear-gradient(135deg, ${colors.info.DEFAULT} 0%, #2563eb 100%)`,
  },

  // Gradient glass (pour effets glass)
  glass: {
    light: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
    dark: `linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)`,
  },
} as const

// ============================================
// OMBRES PREMIUM (plus douces, plus profondes)
// ============================================

export const premiumShadows = {
  // Ombre douce pour cartes premium
  card: {
    soft: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
    medium: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)",
    strong: "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.1)",
  },

  // Ombre pour icônes avec gradient
  icon: {
    soft: "0 2px 6px rgba(0, 0, 0, 0.1)",
    medium: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },

  // Ombre pour boutons premium
  button: {
    default: "0 2px 8px rgba(45, 106, 79, 0.2)",
    hover: "0 4px 12px rgba(45, 106, 79, 0.3)",
    pressed: "0 1px 4px rgba(45, 106, 79, 0.2)",
  },

  // Ombre pour FAB (Floating Action Button)
  fab: {
    default: "0 4px 16px rgba(45, 106, 79, 0.25), 0 2px 8px rgba(45, 106, 79, 0.15)",
    hover: "0 6px 20px rgba(45, 106, 79, 0.3), 0 4px 12px rgba(45, 106, 79, 0.2)",
  },
} as const

// ============================================
// ANIMATIONS
// ============================================

export const premiumAnimations = {
  // Durées (ms)
  duration: {
    fast: 150,
    normal: 200,
    slow: 250,
  },

  // Easing functions
  easing: {
    easeOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.6, 1)",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // Transitions CSS
  transitions: {
    // Hover sur cartes
    cardHover: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    
    // Press sur boutons
    buttonPress: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    
    // Fade in
    fadeIn: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    
    // Scale
    scale: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Keyframes (pour animations CSS)
  keyframes: {
    pulse: {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.8 },
    },
    glow: {
      "0%, 100%": { boxShadow: "0 0 8px rgba(139, 92, 246, 0.4)" },
      "50%": { boxShadow: "0 0 16px rgba(139, 92, 246, 0.6)" },
    },
    float: {
      "0%, 100%": { transform: "translateY(0px)" },
      "50%": { transform: "translateY(-4px)" },
    },
  },
} as const

// ============================================
// EFFETS GLASS (backdrop-filter)
// ============================================

export const premiumGlass = {
  // Glass léger (pour bandeau IA, panels)
  light: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },

  // Glass moyen
  medium: {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },

  // Glass sur fond sombre
  dark: {
    background: "rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
} as const

// ============================================
// PRESETS COMPOSANTS PREMIUM
// ============================================

export const premiumPresets = {
  // Carte premium
  card: {
    borderRadius: radius.lg,
    padding: spacing.base,
    boxShadow: premiumShadows.card.soft,
    transition: premiumAnimations.transitions.cardHover,
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: premiumShadows.card.medium,
    },
  },

  // Icône avec gradient
  iconGradient: {
    borderRadius: radius.md,
    padding: spacing.sm,
    boxShadow: premiumShadows.icon.soft,
  },

  // Bouton premium
  button: {
    borderRadius: radius.md,
    padding: `${spacing.sm} ${spacing.base}`,
    boxShadow: premiumShadows.button.default,
    transition: premiumAnimations.transitions.buttonPress,
    "&:hover": {
      boxShadow: premiumShadows.button.hover,
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0px) scale(0.98)",
      boxShadow: premiumShadows.button.pressed,
    },
  },

  // Badge avec gradient
  badge: {
    borderRadius: radius.full,
    padding: `${spacing.xs} ${spacing.sm}`,
    boxShadow: premiumShadows.icon.soft,
  },
} as const

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un style glass pour un composant
 */
export function getGlassStyle(variant: "light" | "medium" | "dark" = "light") {
  const glass = premiumGlass[variant]
  return {
    background: glass.background,
    backdropFilter: glass.backdropFilter,
    WebkitBackdropFilter: glass.backdropFilter, // Safari
    border: glass.border,
  }
}

/**
 * Génère un style de gradient pour un composant
 */
export function getGradientStyle(gradient: string) {
  return {
    background: gradient,
  }
}

