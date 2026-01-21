/**
 * Client pour tracker les activités utilisateur (user_activity)
 * Non-bloquant : utilise une queue pour offline
 */

import { supabase } from '../../../services/supabase/client'
import { observabilityQueue } from './queue'
import type { ActivityType, ActivityDetails } from '../types'

/**
 * Tracker une activité (best-effort, non-bloquant)
 */
export async function trackActivity(
  activity_type: ActivityType,
  details: ActivityDetails = {}
): Promise<void> {
  try {
    // Essayer d'insérer directement
    await trackActivityDirect(activity_type, details)
  } catch (error) {
    // Si échec, ajouter à la queue pour traitement ultérieur
    console.warn('[ActivityTracker] Failed to track activity, queuing:', activity_type, error)
    await observabilityQueue.enqueue('activity', {
      activity_type,
      details,
    })
  }
}

/**
 * Insérer directement dans user_activity (utilisé par la queue)
 */
export async function trackActivityDirect(
  activity_type: ActivityType,
  details: ActivityDetails = {}
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase.from('user_activity').insert({
      user_id: user.id,
      activity_type,
      details: details as any,
      created_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }
  } catch (error) {
    // Re-lancer l'erreur pour que la queue puisse la gérer
    throw error
  }
}

