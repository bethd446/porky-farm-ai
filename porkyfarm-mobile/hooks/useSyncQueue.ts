/**
 * Hook pour gérer la synchronisation des actions en file d'attente (offline)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Network } from 'expo-network'
import { offlineQueue } from '../lib/offlineQueue'
import { apiClient } from '../lib/apiClient'

interface SyncStatus {
  isOnline: boolean
  pendingCount: number
  isSyncing: boolean
  lastSyncError: string | null
}

export function useSyncQueue() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncError: null,
  })
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Vérifier le réseau périodiquement
  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync()
      const isOnline = networkState.isConnected === true && networkState.isInternetReachable !== false

      if (isMounted.current) {
        setStatus((prev) => {
          const wasOffline = !prev.isOnline
          const nowOnline = isOnline

          // Si on passe de offline à online, synchroniser automatiquement
          if (wasOffline && nowOnline) {
            syncQueue()
          }

          return {
            ...prev,
            isOnline,
          }
        })
      }
    }

    checkNetwork()
    const interval = setInterval(checkNetwork, 5000) // Vérifier toutes les 5 secondes

    return () => clearInterval(interval)
  }, [])

  // Compter les actions en attente
  useEffect(() => {
    const updatePendingCount = async () => {
      const queue = await offlineQueue.getAll()
      if (isMounted.current) {
        setStatus((prev) => ({
          ...prev,
          pendingCount: queue.length,
        }))
      }
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 2000)

    return () => clearInterval(interval)
  }, [])

  // Synchroniser la file d'attente
  const syncQueue = useCallback(async () => {
    if (status.isSyncing) return

    setStatus((prev) => ({ ...prev, isSyncing: true, lastSyncError: null }))

    try {
      const queue = await offlineQueue.getAll()
      if (queue.length === 0) {
        setStatus((prev) => ({ ...prev, isSyncing: false }))
        return
      }

      // Traiter chaque action en attente
      for (const action of queue) {
        try {
          const response = await apiClient.request(action.endpoint, {
            method: action.method,
            body: action.payload ? JSON.stringify(action.payload) : undefined,
          })

          if (response.error) {
            throw new Error(response.error.message)
          }

          // Supprimer l'action de la queue si succès
          await offlineQueue.remove(action.id)
        } catch (error: any) {
          console.error('Error syncing action:', error)
          // Garder l'action dans la queue pour réessayer plus tard
        }
      }

      setStatus((prev) => ({ ...prev, isSyncing: false, lastSyncError: null }))
    } catch (error: any) {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncError: error.message || 'Erreur lors de la synchronisation',
      }))
    }
  }, [status.isSyncing])

  return {
    isOnline: status.isOnline,
    pendingCount: status.pendingCount,
    isSyncing: status.isSyncing,
    lastSyncError: status.lastSyncError,
    syncQueue,
  }
}
