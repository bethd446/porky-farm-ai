/**
 * Service de gestion de l'état d'onboarding
 * Gère le chargement, la sauvegarde et la complétion de l'onboarding
 */

import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { logHealth } from './observability/health'
import { trackActivity } from './observability/activity'
import { getPendingCompletion, clearPendingCompletion, saveOnboardingCache } from './cache'
import { logger } from '../logger'
import type { OnboardingState } from './types'

const ONBOARDING_VERSION = 'v1'

/**
 * Charger l'état d'onboarding depuis Supabase
 * Retourne toujours { state, error } sans lever d'exception
 */
export async function loadOnboardingState(): Promise<{
  state: OnboardingState | null
  error: Error | null
}> {
  try {
    logger.debug('[loadOnboardingState] Démarrage')

    // Vérifier que Supabase est configuré
    if (!isSupabaseConfigured()) {
      logger.warn('[loadOnboardingState] Supabase non configuré')
      return {
        state: null,
        error: new Error('SUPABASE_NOT_CONFIGURED'),
      }
    }

    // Récupérer l'utilisateur authentifié
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('[loadOnboardingState] Non authentifié:', authError?.message || 'user is null')
      return {
        state: null,
        error: new Error('UNAUTHENTICATED'),
      }
    }

    logger.debug('[loadOnboardingState] Utilisateur trouvé:', user.id)

    // Requête sur profiles avec toutes les colonnes nécessaires (sans email, stocké dans auth.users)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, is_active, has_completed_onboarding, onboarding_step, onboarding_version, onboarding_data, onboarding_completed_at')
      .eq('id', user.id)
      .single()

    // Gestion des erreurs de requête
    if (error) {
      logger.error('[loadOnboardingState] Erreur requête profiles:', {
        code: error.code,
        message: error.message,
        details: error.details,
      })

      // Cas 401 / non authentifié
      if (error.code === '401' || error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('Non authentifié')) {
        logger.warn('[loadOnboardingState] Erreur authentification, retour UNAUTHENTICATED')
        return {
          state: null,
          error: new Error('UNAUTHENTICATED'),
        }
      }

      // Cas PGRST116 : profil non trouvé
      if (error.code === 'PGRST116') {
        logger.warn('[loadOnboardingState] Profil non trouvé pour user:', user.id)
        return {
          state: null,
          error: new Error('PROFILE_NOT_FOUND'),
        }
      }

      // Autres erreurs : logger (best-effort)
      try {
        await logHealth('error', 'onboarding_profile_fetch_failed', error.message, {
          userId: user.id,
          code: error.code,
        })
      } catch (logError) {
        logger.warn('[loadOnboardingState] Échec logHealth:', logError)
      }

      return {
        state: null,
        error: new Error(error.message || 'Erreur lors du chargement du profil'),
      }
    }

    // Vérifier que data existe
    if (!data) {
      logger.error('[loadOnboardingState] data est null après requête réussie')
      return {
        state: null,
        error: new Error('PROFILE_NOT_FOUND'),
      }
    }

    // Succès : mapper les données vers OnboardingState
    logger.debug('[loadOnboardingState] Données récupérées avec succès:', {
      hasCompleted: data.has_completed_onboarding,
      step: data.onboarding_step,
      role: data.role,
      isActive: data.is_active,
    })

    const onboardingState: OnboardingState = {
      hasCompleted: Boolean(data.has_completed_onboarding),
      step: data.onboarding_step ?? null,
      version: data.onboarding_version ?? null,
      completedAt: data.onboarding_completed_at ? new Date(data.onboarding_completed_at) : null,
      data: data.onboarding_data ?? {},
      role: data.role ?? null,
      isActive: data.is_active ?? true,
    }

    logger.debug('[loadOnboardingState] State calculé:', {
      hasCompleted: onboardingState.hasCompleted,
      step: onboardingState.step,
      role: onboardingState.role,
      isActive: onboardingState.isActive,
    })
    
    return { state: onboardingState, error: null }
  } catch (err: any) {
    logger.error('[loadOnboardingState] Exception inattendue:', err)
    const error = err instanceof Error ? err : new Error(String(err))
    
    // Logger l'erreur (best-effort)
    try {
      await logHealth('error', 'onboarding_profile_fetch_failed', error.message, {
        error: error.message,
        stack: error.stack,
        originalError: err instanceof Error ? err.message : String(err),
      })
    } catch (logError) {
      logger.warn('[loadOnboardingState] Impossible de logger dans app_health_logs:', logError)
    }

    return {
      state: null,
      error,
    }
  }
}

/**
 * Marquer une étape de l'onboarding
 */
export async function markOnboardingStep(step: string, partialData?: any): Promise<{
  error: Error | null
  persisted: boolean
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: new Error('Non authentifié'), persisted: false }
    }

    // Charger les données existantes
    const { data: existingData } = await supabase
      .from('profiles')
      .select('onboarding_data')
      .eq('id', user.id)
      .single()

    const currentData = existingData?.onboarding_data || {}
    const mergedData = { ...currentData, ...partialData }

    // Mettre à jour dans Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_step: step,
        onboarding_version: ONBOARDING_VERSION,
        onboarding_data: mergedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { error: error as Error, persisted: false }
    }

    // Vérifier la persistance (relecture)
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('onboarding_step, onboarding_data')
      .eq('id', user.id)
      .single()

    if (verifyError || verifyData?.onboarding_step !== step) {
      return {
        error: new Error('Échec de la vérification : les données n\'ont pas été persistées'),
        persisted: false,
      }
    }

    // Sauvegarder dans le cache local (pour pré-remplir si offline)
    await saveOnboardingCache(step, mergedData)

    // Tracker l'activité (non-bloquant)
    await trackActivity('onboarding_step_view', {
      step,
      version: ONBOARDING_VERSION,
    })

    return { error: null, persisted: true }
  } catch (err) {
    return { error: err as Error, persisted: false }
  }
}

/**
 * Compléter l'onboarding (appelle la RPC complete_onboarding)
 * 
 * La RPC gère toute la logique métier :
 * - Met à jour has_completed_onboarding = true
 * - Fixe onboarding_step = 'completed'
 * - Fixe onboarding_version = 'v1'
 * - Met à jour onboarding_completed_at = NOW()
 * - Met à jour onboarding_data = p_onboarding_data
 * - Insère un événement dans onboarding_events
 * 
 * @param finalOnboardingData - Données finales de l'onboarding à sauvegarder
 * @returns Le profil mis à jour avec les valeurs de complétion
 * @throws Error si l'utilisateur n'est pas authentifié ou si la RPC échoue
 */
export async function completeOnboarding(finalOnboardingData: any) {
  logger.debug('[Onboarding] completeOnboarding start')

  // Vérifier la session active
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    logger.error('[Onboarding] No active session', sessionError)
    throw new Error('Utilisateur non authentifié')
  }

  // Charger les données existantes pour merger avec finalOnboardingData
  const { data: existingData } = await supabase
    .from('profiles')
    .select('onboarding_data')
    .eq('id', session.user.id)
    .single()

  const currentData = existingData?.onboarding_data || {}
  const mergedData = { ...currentData, ...finalOnboardingData }

  logger.debug('[Onboarding] Calling RPC complete_onboarding with data:', mergedData)

  // Appeler la RPC complete_onboarding
  // Signature : complete_onboarding(p_onboarding_data jsonb)
  const { data: rpcData, error: rpcError } = await supabase.rpc('complete_onboarding', {
    p_onboarding_data: mergedData,
  })

  if (rpcError) {
    logger.error('[Onboarding] RPC complete_onboarding error:', rpcError)

    // Logger l'erreur dans app_health_logs (best-effort)
    try {
      await logHealth('error', 'onboarding_complete_rpc_failed', rpcError.message, {
        userId: session.user.id,
        error: rpcError.message,
        code: rpcError.code,
      })
    } catch (logError) {
      logger.warn('[Onboarding] Échec logHealth:', logError)
    }

    throw new Error(rpcError.message ?? 'Erreur lors de la finalisation de l\'onboarding')
  }

  logger.debug('[Onboarding] RPC complete_onboarding success')

  // Refetch du profil pour mettre à jour le guard / contexte
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('has_completed_onboarding, onboarding_step, onboarding_version, onboarding_completed_at, onboarding_data')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    logger.error('[Onboarding] Error fetching profile after completion:', profileError)
    throw new Error('Onboarding complété, mais impossible de recharger le profil')
  }

  logger.debug('[Onboarding] Profile after completion:', {
    has_completed_onboarding: profile.has_completed_onboarding,
    onboarding_step: profile.onboarding_step,
    onboarding_version: profile.onboarding_version,
    onboarding_completed_at: profile.onboarding_completed_at,
  })

  // Vérifier que les valeurs sont correctes
  if (!profile.has_completed_onboarding) {
    throw new Error('Échec de la vérification : l\'onboarding n\'est pas marqué comme complété')
  }

  if (profile.onboarding_step !== 'completed' || profile.onboarding_version !== 'v1' || !profile.onboarding_completed_at) {
    logger.warn('[Onboarding] Valeurs incorrectes après complétion:', {
      step: profile.onboarding_step,
      version: profile.onboarding_version,
      completedAt: profile.onboarding_completed_at,
    })
    // Ne pas bloquer, mais logger un warning
  }

  // Tracker l'activité de complétion (non-bloquant)
  try {
    await trackActivity('onboarding_completed', {
      version: 'v1',
    })
  } catch (err) {
    logger.warn('[Onboarding] Échec trackActivity:', err)
  }

  // Nettoyer le cache "pending completion" si présent
  try {
    const pending = await getPendingCompletion()
    if (pending) {
      await clearPendingCompletion()
    }
  } catch (err) {
    logger.warn('[Onboarding] Échec nettoyage pending completion:', err)
  }

  return profile
}

/**
 * Traiter un "pending completion" si présent (offline → online)
 */
export async function processPendingCompletion(): Promise<void> {
  try {
    const pending = await getPendingCompletion()
    if (!pending) {
      return
    }

    logger.debug('[processPendingCompletion] Traitement du pending completion')
    await completeOnboarding(pending as any)
    await clearPendingCompletion()
  } catch (err) {
    logger.warn('[processPendingCompletion] Échec:', err)
    // Ne pas bloquer, on réessayera plus tard
  }
}
