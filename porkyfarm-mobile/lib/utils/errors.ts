/**
 * Utilitaires de gestion d'erreurs - PorkyFarm
 * =============================================
 * Normalisation et typage des erreurs
 */

/**
 * Normalise une erreur inconnue en Error typée
 * À utiliser dans tous les catch blocks
 *
 * @example
 * try {
 *   await riskyOperation()
 * } catch (error) {
 *   throw normalizeError(error)
 * }
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }
  if (typeof error === 'string') {
    return new Error(error)
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message))
  }
  return new Error(String(error) || 'Erreur inconnue')
}

/**
 * Extrait le message d'erreur de manière sécurisée
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'Erreur inconnue'
}

/**
 * Vérifie si une erreur est une erreur Supabase spécifique
 */
export function isSupabaseError(error: unknown): error is { code: string; message: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  )
}

/**
 * Traduit les codes d'erreur Supabase en messages français
 */
export function translateSupabaseError(error: unknown): string {
  if (!isSupabaseError(error)) {
    return getErrorMessage(error)
  }

  const translations: Record<string, string> = {
    // Auth errors
    'invalid_credentials': 'Email ou mot de passe incorrect',
    'email_not_confirmed': 'Veuillez confirmer votre email',
    'user_not_found': 'Utilisateur non trouvé',
    'weak_password': 'Mot de passe trop faible (minimum 8 caractères)',
    'email_address_invalid': 'Adresse email invalide',
    'user_already_exists': 'Un compte existe déjà avec cet email',

    // RLS errors
    '42501': 'Accès non autorisé',
    'PGRST301': 'Accès non autorisé',

    // Constraint errors
    '23502': 'Données manquantes',
    '23503': 'Référence invalide',
    '23505': 'Cette entrée existe déjà',
    '23514': 'Données invalides',

    // Network
    'NETWORK_ERROR': 'Erreur de connexion. Vérifiez votre internet.',
    'TIMEOUT': 'La requête a pris trop de temps',
  }

  return translations[error.code] || error.message || 'Erreur inattendue'
}
