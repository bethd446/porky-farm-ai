/**
 * Queue d'événements pour observabilité (non-bloquant)
 * Traite les insertions en arrière-plan avec retry automatique
 */

import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const QUEUE_KEY = '@porkyfarm/observability_queue'
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 secondes

interface QueuedEvent {
  id: string
  type: 'activity' | 'health'
  payload: any
  retries: number
  timestamp: number
}

class ObservabilityQueue {
  private processing = false
  private intervalId: ReturnType<typeof setInterval> | null = null

  /**
   * Ajouter un événement à la queue
   */
  async enqueue(type: 'activity' | 'health', payload: any): Promise<void> {
    try {
      const queue = await this.getQueue()
      const event: QueuedEvent = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        payload,
        retries: 0,
        timestamp: Date.now(),
      }
      queue.push(event)
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
      
      // Démarrer le traitement si pas déjà en cours
      if (!this.processing) {
        this.startProcessing()
      }
    } catch (error) {
      // Silencieux : ne pas bloquer l'UI
      console.warn('[ObservabilityQueue] Failed to enqueue event:', error)
    }
  }

  /**
   * Récupérer la queue depuis AsyncStorage
   */
  private async getQueue(): Promise<QueuedEvent[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  /**
   * Sauvegarder la queue dans AsyncStorage
   */
  private async saveQueue(queue: QueuedEvent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.warn('[ObservabilityQueue] Failed to save queue:', error)
    }
  }

  /**
   * Démarrer le traitement de la queue
   */
  private startProcessing(): void {
    if (this.processing) return

    this.processing = true
    
    // Traiter immédiatement
    this.processQueue()

    // Puis toutes les 10 secondes
    this.intervalId = setInterval(() => {
      this.processQueue()
    }, 10000)
  }

  /**
   * Arrêter le traitement de la queue
   */
  stopProcessing(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.processing = false
  }

  /**
   * Traiter les événements en queue
   */
  private async processQueue(): Promise<void> {
    try {
      const queue = await this.getQueue()
      if (queue.length === 0) {
        this.stopProcessing()
        return
      }

      const processed: QueuedEvent[] = []
      const failed: QueuedEvent[] = []

      for (const event of queue) {
        try {
          // Importer dynamiquement pour éviter les dépendances circulaires
          if (event.type === 'activity') {
            const { trackActivityDirect } = await import('./activity')
            await trackActivityDirect(event.payload.activity_type, event.payload.details)
          } else if (event.type === 'health') {
            const { logHealthDirect } = await import('./health')
            await logHealthDirect(
              event.payload.severity,
              event.payload.event,
              event.payload.message,
              event.payload.context
            )
          }
          processed.push(event)
        } catch (error) {
          // Si erreur et retries < MAX_RETRIES, garder dans la queue
          if (event.retries < MAX_RETRIES) {
            event.retries++
            failed.push(event)
          } else {
            // Trop de retries, abandonner
            console.warn('[ObservabilityQueue] Abandoning event after max retries:', event.id)
            processed.push(event) // Retirer de la queue
          }
        }
      }

      // Sauvegarder la queue mise à jour
      await this.saveQueue(failed)

      // Si plus d'événements, arrêter le traitement
      if (failed.length === 0) {
        this.stopProcessing()
      }
    } catch (error) {
      console.warn('[ObservabilityQueue] Error processing queue:', error)
    }
  }

  /**
   * Vider la queue (pour tests)
   */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY)
    this.stopProcessing()
  }
}

export const observabilityQueue = new ObservabilityQueue()

