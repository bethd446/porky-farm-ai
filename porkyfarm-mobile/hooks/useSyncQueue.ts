/**
 * Hook pour gérer la synchronisation de la queue offline
 * Écoute le réseau et synchronise automatiquement quand online
 */

import { useState, useEffect, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import * as Network from 'expo-network'
import { offlineQueue, QueueAction } from '../lib/offlineQueue'
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

  /**
   * Traite une action de la queue
   */
  const processAction = async (action: QueueAction): Promise<boolean> => {
    try {
      await offlineQueue.markAsSyncing(action.id)

      let response
      switch (action.method) {
        case 'POST':
          response = await apiClient.post(action.endpoint, action.payload)
          break
        case 'PUT':
        case 'PATCH':
          response = await apiClient.put(action.endpoint, action.payload)
          break
        default:
          throw new Error(`Méthode non supportée: ${action.method}`)
      }

      if (response.error) {
        // Si erreur réseau, on garde l'action pour retry plus tard
        if (response.error.offline) {
          await offlineQueue.markAsFailed(action.id, response.error.message)
          return false
        }

        // Si erreur 4xx (validation, etc.), on supprime l'action (erreur définitive)
        if (response.error.status && response.error.status >= 400 && response.error.status < 500) {
          await offlineQueue.remove(action.id)
          return false
        }

        // Autres erreurs : on retry
        await offlineQueue.markAsFailed(action.id, response.error.message)
        return false
      }

      // Succès
      await offlineQueue.markAsSynced(action.id)
      // Supprimer après un délai (pour permettre à l'UI de voir le statut)
      setTimeout(() => {
        offlineQueue.remove(action.id)
      }, 5000)

      return true
    } catch (error: any) {
      await offlineQueue.markAsFailed(action.id, error.message || 'Erreur inconnue')
      return false
    }
  }

  /**
   * Traite toutes les actions en attente
   */
  const processQueue = useCallback(async () => {
    const networkState = await Network.getNetworkStateAsync()
    const isOnline = networkState.isConnected && networkState.isInternetReachable !== false

    if (!isOnline) {
      setStatus((prev) => ({ ...prev, isOnline: false, isSyncing: false }))
      return
    }

    setStatus((prev) => ({ ...prev, isOnline: true, isSyncing: true, lastSyncError: null }))

    try {
      const pending = await offlineQueue.getPending()

      if (pending.length === 0) {
        setStatus((prev) => ({ ...prev, isSyncing: false, pendingCount: 0 }))
        return
      }

      // Traiter les actions une par une (pour éviter la surcharge)
      let successCount = 0
      let errorCount = 0

      for (const action of pending) {
        const success = await processAction(action)
        if (success) {
          successCount++
        } else {
          errorCount++
        }

        // Petit délai entre chaque action pour éviter la surcharge
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const remaining = await offlineQueue.getPendingCount()

      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        pendingCount: remaining,
        lastSyncError: errorCount > 0 ? `${errorCount} action(s) ont échoué` : null,
      }))
    } catch (error: any) {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncError: error.message || 'Erreur lors de la synchronisation',
      }))
    }
  }, [])

  /**
   * Écoute les changements de réseau
   */
  useEffect(() => {
    let isMounted = true

    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync()
      const isOnline = networkState.isConnected && networkState.isInternetReachable !== false

      if (isMounted) {
        setStatus((prev) => {
          const wasOffline = !prev.isOnline
          const nowOnline = isOnline

          // Si on passe de offline à online, synchroniser automatiquement
          if (wasOffline && nowOnline) {
            processQueue()
          }

          return { ...prev, isOnline }
        })
      }
    }

    // Vérifier immédiatement
    checkNetwork()

    // Écouter les changements de réseau
    const interval = setInterval(checkNetwork, 5000) // Vérifier toutes les 5 secondes

    // Écouter les changements d'état de l'app (quand l'app revient au premier plan)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkNetwork()
        processQueue()
      }
    })

    return () => {
      isMounted = false
      clearInterval(interval)
      subscription.remove()
    }
  }, [processQueue])

  /**
   * Mettre à jour le compteur de pending
   */
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await offlineQueue.getPendingCount()
      setStatus((prev) => ({ ...prev, pendingCount: count }))
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 2000) // Mettre à jour toutes les 2 secondes

    return () => clearInterval(interval)
  }, [])

  return {
    ...status,
    syncNow: processQueue,
  }
}

