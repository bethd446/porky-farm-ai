/**
 * Client pour logger les événements de santé (app_health_logs)
 * Non-bloquant : utilise une queue pour offline
 * Intègre Sentry pour les erreurs critiques
 */

import * as Sentry from '@sentry/react-native'
import { supabase } from '../../../services/supabase/client'
import { observabilityQueue } from './queue'
import type { HealthSeverity, HealthLogContext } from '../types'

/**
 * Logger un événement de santé (best-effort, non-bloquant)
 * Envoie également vers Sentry pour les erreurs critiques
 */
export async function logHealth(
  severity: HealthSeverity,
  event: string,
  message: string,
  context: HealthLogContext = {}
): Promise<void> {
  // Envoyer vers Sentry pour les erreurs critiques (best-effort, ne doit jamais bloquer)
  if (severity === 'error') {
    try {
      Sentry.captureException(new Error(message), {
        extra: {
          event,
          severity,
          ...context,
        },
        level: 'error',
        tags: {
          health_event: event,
        },
      })
    } catch (sentryError) {
      // Ne jamais faire échouer l'app à cause de Sentry
      console.warn('[HealthLogger] Sentry capture failed:', sentryError)
    }
  }

  try {
    // Essayer d'insérer directement dans app_health_logs
    await logHealthDirect(severity, event, message, context)
  } catch (error) {
    // Si échec, ajouter à la queue pour traitement ultérieur
    console.warn('[HealthLogger] Failed to log health event, queuing:', event, error)
    await observabilityQueue.enqueue('health', {
      severity,
      event,
      message,
      context,
    })
  }
}

/**
 * Insérer directement dans app_health_logs (utilisé par la queue)
 */
export async function logHealthDirect(
  severity: HealthSeverity,
  event: string,
  message: string,
  context: HealthLogContext = {}
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Vérifier que la table est bien 'app_health_logs' (sans préfixe de schéma)
    const { error } = await supabase.from('app_health_logs').insert({
      user_id: user?.id || null,
      severity,
      event,
      message,
      context: context as any,
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Si erreur PGRST205 (table n'existe pas dans le cache), logger seulement en console
      if (error.code === 'PGRST205') {
        console.warn('[HealthLogger] Table app_health_logs non trouvée dans le cache PostgREST. Vérifiez que vous pointez vers le bon projet Supabase.')
        console.warn('[HealthLogger] URL Supabase utilisée:', process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...')
        // Ne pas re-lancer l'erreur pour éviter les boucles
        return
      }
      
      // Pour les autres erreurs, re-lancer pour que la queue puisse la gérer
      throw error
    }
  } catch (error) {
    // Re-lancer l'erreur pour que la queue puisse la gérer (sauf PGRST205 déjà géré)
    throw error
  }
}
