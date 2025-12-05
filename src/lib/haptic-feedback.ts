/**
 * Utilitaires pour le haptic feedback sur mobile
 */

/**
 * Types de feedback haptique disponibles
 */
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Vérifie si le haptic feedback est disponible
 */
export function isHapticAvailable(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Déclenche un feedback haptique
 * @param type - Type de feedback à déclencher
 */
export function triggerHaptic(type: HapticFeedbackType = 'medium'): void {
  if (!isHapticAvailable()) return;

  const patterns: Record<HapticFeedbackType, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 20], // Double tap pour succès
    warning: [20, 50, 20, 50, 20], // Triple tap pour avertissement
    error: [30, 100, 30, 100, 30], // Triple tap fort pour erreur
  };

  const pattern = patterns[type];
  navigator.vibrate(pattern);
}

/**
 * Déclenche un feedback haptique léger (pour interactions subtiles)
 */
export function hapticLight(): void {
  triggerHaptic('light');
}

/**
 * Déclenche un feedback haptique moyen (pour actions normales)
 */
export function hapticMedium(): void {
  triggerHaptic('medium');
}

/**
 * Déclenche un feedback haptique fort (pour actions importantes)
 */
export function hapticHeavy(): void {
  triggerHaptic('heavy');
}

/**
 * Déclenche un feedback haptique de succès
 */
export function hapticSuccess(): void {
  triggerHaptic('success');
}

/**
 * Déclenche un feedback haptique d'avertissement
 */
export function hapticWarning(): void {
  triggerHaptic('warning');
}

/**
 * Déclenche un feedback haptique d'erreur
 */
export function hapticError(): void {
  triggerHaptic('error');
}

