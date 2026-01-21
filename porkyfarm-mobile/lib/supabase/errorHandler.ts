/**
 * Helper pour gérer les erreurs Supabase de manière cohérente
 * Gère spécifiquement PGRST205 (table introuvable) avec des fallbacks gracieux
 */

import type { PostgrestError } from '@supabase/supabase-js'
import { logger } from '../logger'

/**
 * Vérifie si une erreur Supabase est de type PGRST205 (table introuvable)
 */
export function isTableNotFoundError(error: PostgrestError | Error | null): boolean {
  if (!error) return false

  const code = (error as any).code
  const message = (error as any).message?.toLowerCase() || ''

  // PGRST116 = "No rows returned" - ce n'est PAS une erreur de table manquante
  // PGRST205 = Schema cache error (table non trouvée dans le cache)
  // 42P01 = PostgreSQL "undefined_table"
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('relation') && message.includes('does not exist') ||
    message.includes('could not find the table')
  )
}

/**
 * Gère une erreur Supabase avec fallback gracieux pour PGRST205
 * 
 * @param error - L'erreur Supabase
 * @param tableName - Nom de la table (pour logging)
 * @param fallbackForList - Si true, retourne [] pour les listes, sinon null
 * @returns Un objet avec error: null et data: fallback si PGRST205, sinon l'erreur originale
 */
export function handleSupabaseError<T>(
  error: PostgrestError | Error | null,
  tableName: string,
  fallbackForList: boolean = true
): { data: T | null; error: Error | null } {
  if (!error) {
    return { data: null, error: null }
  }

  // Si c'est une erreur de table introuvable, retourner un fallback gracieux
  if (isTableNotFoundError(error)) {
    logger.warn(`[${tableName}] Table '${tableName}' not found, returning empty ${fallbackForList ? 'list' : 'value'}`)
    return {
      data: (fallbackForList ? [] : null) as T,
      error: null,
    }
  }

  // Si c'est une erreur de permission RLS (42501), retourner fallback silencieusement
  // C'est attendu pour les tables non configurées ou features premium
  const errorCode = (error as any).code
  if (errorCode === '42501') {
    // Permission denied - feature non disponible ou RLS non configuré
    return {
      data: (fallbackForList ? [] : null) as T,
      error: null,
    }
  }

  // Logger l'erreur complète pour debugging (sauf erreurs attendues)
  logger.error(`[${tableName}] Supabase error:`, {
    code: errorCode,
    message: (error as any).message,
    hint: (error as any).hint,
    details: (error as any).details,
  })

  // Pour les autres erreurs, retourner l'erreur originale
  return {
    data: null,
    error: error as Error,
  }
}

/**
 * Wrapper pour une requête Supabase qui gère automatiquement PGRST205
 * 
 * @param queryFn - Fonction qui retourne une promesse avec { data, error }
 * @param tableName - Nom de la table (pour logging)
 * @param fallbackForList - Si true, retourne [] pour les listes, sinon null
 */
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  tableName: string,
  fallbackForList: boolean = true
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await queryFn()

    if (result.error) {
      // Debug: log l'erreur réelle pour diagnostic
      logger.debug(`[${tableName}] Query error:`, {
        code: (result.error as any).code,
        message: result.error.message,
      })
      return handleSupabaseError(result.error, tableName, fallbackForList)
    }

    return { data: result.data, error: null }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error(`[${tableName}] Unexpected error:`, error)
    return handleSupabaseError(error, tableName, fallbackForList)
  }
}
