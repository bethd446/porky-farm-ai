/**
 * Queue de synchronisation offline
 * Stocke les actions en attente et les synchronise quand le réseau revient
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const QUEUE_STORAGE_KEY = '@porkyfarm:offline_queue'

export type QueueActionType =
  | 'CREATE_HEALTH_CASE'
  | 'UPDATE_HEALTH_CASE'
  | 'CREATE_GESTATION'
  | 'UPDATE_GESTATION'
  | 'CREATE_ANIMAL'
  | 'UPDATE_ANIMAL'
  | 'UPDATE_STOCK'
  | 'CREATE_STOCK'

export interface QueueAction {
  id: string
  type: QueueActionType
  payload: any
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH'
  createdAt: string
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  retries: number
  error?: string
}

class OfflineQueue {
  /**
   * Récupère toutes les actions en queue
   */
  async getAll(): Promise<QueueAction[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  /**
   * Ajoute une action à la queue
   */
  async enqueue(action: Omit<QueueAction, 'id' | 'createdAt' | 'status' | 'retries'>): Promise<string> {
    const queue = await this.getAll()
    const newAction: QueueAction = {
      ...action,
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retries: 0,
    }

    queue.push(newAction)
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))

    return newAction.id
  }

  /**
   * Marque une action comme synchronisée
   */
  async markAsSynced(id: string): Promise<void> {
    const queue = await this.getAll()
    const action = queue.find((a) => a.id === id)
    if (action) {
      action.status = 'synced'
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    }
  }

  /**
   * Marque une action comme échouée
   */
  async markAsFailed(id: string, error: string): Promise<void> {
    const queue = await this.getAll()
    const action = queue.find((a) => a.id === id)
    if (action) {
      action.status = 'failed'
      action.error = error
      action.retries += 1
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    }
  }

  /**
   * Marque une action comme en cours de synchronisation
   */
  async markAsSyncing(id: string): Promise<void> {
    const queue = await this.getAll()
    const action = queue.find((a) => a.id === id)
    if (action) {
      action.status = 'syncing'
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    }
  }

  /**
   * Supprime une action de la queue (après succès ou échec définitif)
   */
  async remove(id: string): Promise<void> {
    const queue = await this.getAll()
    const filtered = queue.filter((a) => a.id !== id)
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Récupère les actions en attente
   */
  async getPending(): Promise<QueueAction[]> {
    const queue = await this.getAll()
    return queue.filter((a) => a.status === 'pending' || (a.status === 'failed' && a.retries < 3))
  }

  /**
   * Vide la queue (utile pour les tests ou reset)
   */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY)
  }

  /**
   * Compte les actions en attente
   */
  async getPendingCount(): Promise<number> {
    const pending = await this.getPending()
    return pending.length
  }
}

export const offlineQueue = new OfflineQueue()

