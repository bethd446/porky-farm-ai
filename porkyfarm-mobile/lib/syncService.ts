/**
 * Service de synchronisation avec retry
 * Gestion offline avec queue d'opérations
 */

import { supabase } from '../services/supabase/client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Network from 'expo-network'

const PENDING_OPERATIONS_KEY = 'porkyfarm_pending_operations'

interface PendingOperation {
  id: string
  type: 'insert' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
  retryCount: number
}

export const syncService = {
  /**
   * Vérifier la connexion réseau
   */
  async isOnline(): Promise<boolean> {
    try {
      const state = await Network.getNetworkStateAsync()
      return state.isConnected === true
    } catch {
      return false
    }
  },

  /**
   * Ajouter une opération en attente
   */
  async addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const pending = await this.getPendingOperations()
      const newOperation: PendingOperation = {
        ...operation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      }
      pending.push(newOperation)
      await AsyncStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(pending))
    } catch (error) {
      console.error('[Sync] Error adding pending operation:', error)
    }
  },

  /**
   * Récupérer les opérations en attente
   */
  async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      const data = await AsyncStorage.getItem(PENDING_OPERATIONS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  /**
   * Synchroniser les opérations en attente
   */
  async syncPendingOperations(): Promise<{ success: number; failed: number }> {
    const isOnline = await this.isOnline()
    if (!isOnline) {
      return { success: 0, failed: 0 }
    }

    const pending = await this.getPendingOperations()
    let success = 0
    let failed = 0
    const remaining: PendingOperation[] = []

    for (const operation of pending) {
      try {
        let error: any = null

        switch (operation.type) {
          case 'insert':
            const { error: insertError } = await supabase
              .from(operation.table)
              .insert(operation.data)
            error = insertError
            break

          case 'update':
            const { error: updateError } = await supabase
              .from(operation.table)
              .update(operation.data)
              .eq('id', operation.data.id)
            error = updateError
            break

          case 'delete':
            const { error: deleteError } = await supabase
              .from(operation.table)
              .delete()
              .eq('id', operation.data.id)
            error = deleteError
            break
        }

        if (error) {
          throw error
        }

        success++
      } catch (error) {
        operation.retryCount++
        
        // Garder si moins de 3 tentatives
        if (operation.retryCount < 3) {
          remaining.push(operation)
        }
        failed++
      }
    }

    await AsyncStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(remaining))
    return { success, failed }
  },

  /**
   * Exécuter une opération avec fallback offline
   */
  async executeWithOfflineSupport<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    offlineData: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<{ data: T | null; error: any; offline: boolean }> {
    const isOnline = await this.isOnline()

    if (!isOnline) {
      await this.addPendingOperation(offlineData)
      return { data: null, error: null, offline: true }
    }

    const result = await operation()

    if (result.error) {
      // Si erreur réseau, sauvegarder pour plus tard
      if (result.error.message?.includes('network') || result.error.message?.includes('fetch')) {
        await this.addPendingOperation(offlineData)
        return { data: null, error: null, offline: true }
      }
    }

    return { ...result, offline: false }
  },
}

export default syncService

