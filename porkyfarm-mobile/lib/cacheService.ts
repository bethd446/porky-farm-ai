/**
 * Service de cache local avec AsyncStorage
 * Persistance des données avec expiration
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { logger } from './logger'

const CACHE_PREFIX = 'porkyfarm_cache_'
const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes par défaut

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export const cacheService = {
  /**
   * Sauvegarder des données en cache
   */
  async set<T>(key: string, data: T, expiryMs: number = CACHE_EXPIRY_MS): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiryMs,
      }
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem))
    } catch (error) {
      logger.warn('[Cache] Error setting cache:', error)
    }
  },

  /**
   * Récupérer des données du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_PREFIX + key)
      if (!cached) return null

      const cacheItem: CacheItem<T> = JSON.parse(cached)
      
      // Vérifier expiration
      if (Date.now() > cacheItem.expiresAt) {
        await this.remove(key)
        return null
      }

      return cacheItem.data
    } catch (error) {
      logger.warn('[Cache] Error getting cache:', error)
      return null
    }
  },

  /**
   * Supprimer une entrée du cache
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key)
    } catch (error) {
      logger.warn('[Cache] Error removing cache:', error)
    }
  },

  /**
   * Vider tout le cache
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX))
      await AsyncStorage.multiRemove(cacheKeys)
    } catch (error) {
      logger.warn('[Cache] Error clearing cache:', error)
    }
  },

  /**
   * Récupérer avec fallback (cache ou fetch)
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expiryMs?: number
  ): Promise<T> {
    // Essayer le cache d'abord
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Sinon fetch et mettre en cache
    const data = await fetchFn()
    await this.set(key, data, expiryMs)
    return data
  },
}

export default cacheService

