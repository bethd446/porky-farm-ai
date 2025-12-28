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
  | 'CREATE_COST'
  | 'CREATE_COST_ENTRY'
  | 'UPDATE_COST_ENTRY'

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
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retries: 0,
    }

    queue.push(newAction)
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    return newAction.id
  }

  /**
   * Supprime une action de la queue
   */
  async remove(actionId: string): Promise<void> {
    const queue = await this.getAll()
    const filtered = queue.filter((a) => a.id !== actionId)
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Marque une action comme en cours de synchronisation
   */
  async markSyncing(actionId: string): Promise<void> {
    const queue = await this.getAll()
    const updated = queue.map((a) => (a.id === actionId ? { ...a, status: 'syncing' as const } : a))
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated))
  }

  /**
   * Marque une action comme synchronisée
   */
  async markSynced(actionId: string): Promise<void> {
    const queue = await this.getAll()
    const updated = queue.map((a) => (a.id === actionId ? { ...a, status: 'synced' as const } : a))
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated))
  }

  /**
   * Marque une action comme échouée
   */
  async markFailed(actionId: string, error: string): Promise<void> {
    const queue = await this.getAll()
    const updated = queue.map((a) =>
      a.id === actionId
        ? { ...a, status: 'failed' as const, error, retries: a.retries + 1 }
        : a
    )
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated))
  }

  /**
   * Vide la queue
   */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY)
  }
}

export const offlineQueue = new OfflineQueue()
