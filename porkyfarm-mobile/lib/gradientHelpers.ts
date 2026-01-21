/**
 * Helpers pour sécuriser l'utilisation de LinearGradient
 * =====================================================
 * Garantit que colors est toujours un tableau valide avec au moins 2 éléments
 */

/**
 * Valeurs par défaut pour les gradients
 */
export const DEFAULT_GRADIENTS = {
  primary: ['#10B981', '#059669'] as const,
  secondary: ['#3B82F6', '#1D4ED8'] as const,
  success: ['#22C55E', '#16A34A'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  error: ['#EF4444', '#DC2626'] as const,
  warm: ['#FEF3C7', '#FDE68A'] as const,
  cool: ['#DBEAFE', '#BFDBFE'] as const,
  disabled: ['#D1D5DB', '#9CA3AF'] as const,
} as const

/**
 * Valide et retourne un gradient sécurisé
 * @param gradient - Le gradient à valider (peut être undefined, null, ou un tableau)
 * @param fallback - Gradient de fallback si le gradient fourni est invalide
 * @returns Un tableau valide avec au moins 2 éléments
 */
export function getSafeGradient(
  gradient: readonly [string, string, ...string[]] | string[] | undefined | null,
  fallback: readonly [string, string, ...string[]] = DEFAULT_GRADIENTS.primary
): readonly [string, string, ...string[]] {
  // Si le gradient est valide (tableau avec au moins 2 éléments)
  if (gradient && Array.isArray(gradient) && gradient.length >= 2) {
    // Cast via unknown pour éviter l'erreur TypeScript
    return gradient as unknown as readonly [string, string, ...string[]]
  }
  
  // Sinon, utiliser le fallback
  return fallback
}

/**
 * Helper pour obtenir un gradient depuis premiumGradients avec fallback
 */
export function getPremiumGradient(
  gradient: readonly [string, string, ...string[]] | undefined | null,
  variant: keyof typeof DEFAULT_GRADIENTS = 'primary'
): readonly [string, string, ...string[]] {
  return getSafeGradient(gradient, DEFAULT_GRADIENTS[variant])
}

