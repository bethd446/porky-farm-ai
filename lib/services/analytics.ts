/**
 * Service Analytics utilisant PostHog
 * Backend uniquement pour les événements serveur
 * Le client peut aussi utiliser le SDK PostHog directement
 */

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com'

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  distinctId?: string
}

/**
 * Envoie un événement analytics à PostHog
 * @param userId ID utilisateur (optionnel)
 * @param event Nom de l'événement
 * @param properties Propriétés additionnelles
 * @returns Succès ou erreur
 */
export async function trackEvent(
  userId: string | null,
  event: string,
  properties?: Record<string, any>,
): Promise<{ success: boolean; error?: string }> {
  if (!POSTHOG_API_KEY) {
    // En mode dev, on peut logger sans bloquer
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event (dev):', { userId, event, properties })
      return { success: true }
    }
    return {
      success: false,
      error: 'Service analytics non configuré',
    }
  }

  if (!event) {
    return {
      success: false,
      error: 'Nom d\'événement requis',
    }
  }

  try {
    const distinctId = userId || 'anonymous'

    const payload = {
      api_key: POSTHOG_API_KEY,
      event,
      distinct_id: distinctId,
      properties: {
        ...properties,
        $set: userId ? { user_id: userId } : undefined,
        timestamp: new Date().toISOString(),
      },
    }

    const response = await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Analytics] PostHog error:', errorText)
      return {
        success: false,
        error: `PostHog error: ${response.status}`,
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[Analytics] Error:', err)
    // Ne pas bloquer l'application si analytics échoue
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    }
  }
}

/**
 * Envoie plusieurs événements en batch (plus efficace)
 */
export async function trackBatch(events: AnalyticsEvent[]): Promise<{ success: boolean; error?: string }> {
  if (!POSTHOG_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Batch events (dev):', events)
      return { success: true }
    }
    return {
      success: false,
      error: 'Service analytics non configuré',
    }
  }

  try {
    const batch = events.map((evt) => ({
      event: evt.event,
      distinct_id: evt.userId || evt.distinctId || 'anonymous',
      properties: {
        ...evt.properties,
        $set: evt.userId ? { user_id: evt.userId } : undefined,
        timestamp: new Date().toISOString(),
      },
    }))

    const payload = {
      api_key: POSTHOG_API_KEY,
      batch,
    }

    const response = await fetch(`${POSTHOG_HOST}/batch/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Analytics] PostHog batch error:', errorText)
      return {
        success: false,
        error: `PostHog batch error: ${response.status}`,
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[Analytics] Batch error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    }
  }
}

/**
 * Vérifie si le service analytics est configuré
 */
export function isAnalyticsConfigured(): boolean {
  return !!POSTHOG_API_KEY
}

/**
 * Événements prédéfinis pour PorkyFarm
 */
export const AnalyticsEvents = {
  // Animaux
  ANIMAL_CREATED: 'animal_created',
  ANIMAL_UPDATED: 'animal_updated',
  ANIMAL_DELETED: 'animal_deleted',
  ANIMAL_SOLD: 'animal_sold',
  ANIMAL_DIED: 'animal_died',

  // Santé
  HEALTH_CASE_CREATED: 'health_case_created',
  HEALTH_CASE_RESOLVED: 'health_case_resolved',
  HEALTH_CASE_CRITICAL: 'health_case_critical',

  // Reproduction
  GESTATION_CREATED: 'gestation_created',
  GESTATION_COMPLETED: 'gestation_completed',
  FARROWING_ALERT: 'farrowing_alert',

  // Alimentation
  FEED_STOCK_ADDED: 'feed_stock_added',
  FEED_STOCK_LOW: 'feed_stock_low',
  FEEDING_RECORDED: 'feeding_recorded',

  // IA
  AI_CHAT_USED: 'ai_chat_used',
  AI_CHAT_ERROR: 'ai_chat_error',

  // Utilisateur
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // SMS
  SMS_SENT: 'sms_sent',
  SMS_FAILED: 'sms_failed',
} as const

