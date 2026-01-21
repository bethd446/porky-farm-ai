/**
 * Helpers pour la gestion des fermes - VERSION CORRIGÉE
 * ======================================================
 * Utilitaires pour récupérer/créer le farm_id de l'utilisateur connecté
 * Crée automatiquement une ferme si aucune n'existe
 */

import { supabase, isSupabaseConfigured } from '../services/supabase/client'
import { logger } from './logger'

let cachedFarmId: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Récupère l'ID de la ferme de l'utilisateur courant.
 * Si aucune ferme n'existe, en crée une automatiquement.
 */
export async function getCurrentFarmId(): Promise<string | null> {
  // Vérifier si Supabase est configuré
  if (!isSupabaseConfigured()) {
    logger.warn('[farmHelpers] Supabase non configuré')
    return null
  }

  // Vérifier le cache (sauf si expiré)
  const now = Date.now()
  if (cachedFarmId && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedFarmId
  }

  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.warn('[farmHelpers] No authenticated user')
      return null
    }

    // Chercher une ferme existante avec maybeSingle pour éviter l'erreur si pas de résultat
    const { data: existingFarm, error: fetchError } = await supabase
      .from('farms')
      .select('id, name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('[farmHelpers] Error fetching farm:', fetchError)
      return null
    }

    // Si une ferme existe, la mettre en cache et la retourner
    if (existingFarm?.id) {
      cachedFarmId = existingFarm.id
      cacheTimestamp = now
      logger.debug('[farmHelpers] Farm found:', existingFarm.name)
      return cachedFarmId
    }

    // AUCUNE FERME TROUVÉE - En créer une automatiquement
    logger.info('[farmHelpers] No farm found, creating default farm...')

    // Récupérer le profil pour le nom
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()

    const farmName = profile?.full_name
      ? `${profile.full_name} - Élevage`
      : 'Ma ferme'

    const { data: newFarm, error: createError } = await supabase
      .from('farms')
      .insert({
        user_id: user.id,
        name: farmName,
      })
      .select('id, name')
      .single()

    if (createError) {
      logger.error('[farmHelpers] Error creating farm:', createError)
      return null
    }

    if (newFarm?.id) {
      cachedFarmId = newFarm.id
      cacheTimestamp = now
      logger.info('[farmHelpers] Default farm created:', newFarm.name, newFarm.id)
      return cachedFarmId
    }

    return null
  } catch (err) {
    logger.error('[farmHelpers] Exception:', err)
    return null
  }
}

/**
 * Vide le cache de la ferme (utile après déconnexion ou changement de ferme)
 */
export function clearFarmCache(): void {
  cachedFarmId = null
  cacheTimestamp = 0
}

// Alias pour compatibilité
export const clearFarmIdCache = clearFarmCache

/**
 * Vérifie si l'utilisateur a une ferme sans en créer
 */
export async function hasFarm(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('farms')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    return !error && !!data?.id
  } catch {
    return false
  }
}

/**
 * Force la récupération de la ferme (ignore le cache)
 */
export async function refreshFarmId(): Promise<string | null> {
  clearFarmCache()
  return getCurrentFarmId()
}

/**
 * Récupère la ferme complète de l'utilisateur
 */
export async function getCurrentFarm(): Promise<{ id: string; name: string } | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('farms')
      .select('id, name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}
