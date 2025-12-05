/**
 * Rate limiting côté client avec debounce et throttle
 */

interface RateLimitOptions {
  maxCalls?: number;
  windowMs?: number;
}

/**
 * Crée une fonction avec debounce
 * @param func - Fonction à débouncer
 * @param delay - Délai en millisecondes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Crée une fonction avec throttle
 * @param func - Fonction à throttler
 * @param limit - Limite en millisecondes
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Rate limiter simple avec compteur
 */
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private maxCalls: number;
  private windowMs: number;

  constructor(options: RateLimitOptions = {}) {
    this.maxCalls = options.maxCalls || 10;
    this.windowMs = options.windowMs || 60000; // 1 minute par défaut
  }

  /**
   * Vérifie si une action est autorisée
   * @param key - Clé unique pour identifier l'action
   * @returns true si autorisé, false sinon
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(key) || [];

    // Nettoyer les appels anciens
    const recentCalls = calls.filter((timestamp) => now - timestamp < this.windowMs);

    if (recentCalls.length >= this.maxCalls) {
      return false;
    }

    recentCalls.push(now);
    this.calls.set(key, recentCalls);
    return true;
  }

  /**
   * Réinitialise le compteur pour une clé
   */
  reset(key: string): void {
    this.calls.delete(key);
  }
}

// Instance globale pour le rate limiting
export const rateLimiter = new RateLimiter({
  maxCalls: 10,
  windowMs: 60000, // 10 appels par minute
});

