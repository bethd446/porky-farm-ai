// ============================================
// RATE LIMITING SIMPLE EN MEMOIRE
// Pour production avec haute disponibilite, utiliser Upstash Redis
// ============================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store en memoire (reset au redemarrage du serveur)
const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  maxRequests: number // Nombre max de requetes
  windowMs: number // Fenetre de temps en millisecondes
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Verifie si une requete est autorisee selon le rate limit
 * @param identifier - Identifiant unique (user_id ou IP)
 * @param config - Configuration du rate limit
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Nettoyage periodique des entrees expirees (toutes les 100 verifications)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries()
  }

  // Nouvelle entree ou entree expiree
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Entree existante, verifier la limite
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  // Incrementer le compteur
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Nettoie les entrees expirees du store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// ============================================
// CONFIGURATIONS PRE-DEFINIES
// ============================================

// Chat IA: 20 requetes par minute par utilisateur
export const CHAT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
}

// APIs CRUD: 100 requetes par minute par utilisateur
export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
}

// ============================================
// HELPER POUR EXTRAIRE L'IP
// ============================================

export function getClientIP(request: Request): string {
  // Headers Vercel/Cloudflare
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  // Fallback
  return "unknown"
}
