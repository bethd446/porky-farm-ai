/**
 * Gestion du cache local pour l'onboarding (AsyncStorage)
 * Utilisé uniquement pour pré-remplir les formulaires (offline)
 * NE JAMAIS utiliser pour la décision de navigation finale
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { OnboardingCache } from './types'
import { logger } from '../logger'

const CACHE_KEY = '@porkyfarm/onboarding_cache'
const PENDING_COMPLETION_KEY = '@porkyfarm/onboarding_pending_completion'

/**
 * Sauvegarder les données d'onboarding dans le cache local
 */
export async function saveOnboardingCache(step: string | null, data: unknown): Promise<void> {
  try {
    const cache: OnboardingCache = {
      step,
      data,
      pendingCompletion: false,
      pendingData: null,
    }
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    logger.warn('[OnboardingCache] Failed to save cache:', error)
  }
}

/**
 * Récupérer les données d'onboarding depuis le cache local
 */
export async function getOnboardingCache(): Promise<OnboardingCache | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    logger.warn('[OnboardingCache] Failed to get cache:', error)
    return null
  }
}

/**
 * Sauvegarder un "pending completion" (si terminé offline)
 */
export async function savePendingCompletion(data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_COMPLETION_KEY, JSON.stringify(data))
    
    // Mettre à jour le cache
    const cache = await getOnboardingCache()
    if (cache) {
      cache.pendingCompletion = true
      cache.pendingData = data
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    }
  } catch (error) {
    logger.warn('[OnboardingCache] Failed to save pending completion:', error)
  }
}

/**
 * Récupérer le "pending completion"
 */
export async function getPendingCompletion(): Promise<unknown | null> {
  try {
    const data = await AsyncStorage.getItem(PENDING_COMPLETION_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    logger.warn('[OnboardingCache] Failed to get pending completion:', error)
    return null
  }
}

/**
 * Marquer le "pending completion" comme traité
 */
export async function clearPendingCompletion(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PENDING_COMPLETION_KEY)
    
    // Mettre à jour le cache
    const cache = await getOnboardingCache()
    if (cache) {
      cache.pendingCompletion = false
      cache.pendingData = null
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    }
  } catch (error) {
    logger.warn('[OnboardingCache] Failed to clear pending completion:', error)
  }
}

/**
 * Vider tout le cache (pour tests ou reset)
 */
export async function clearOnboardingCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY)
    await AsyncStorage.removeItem(PENDING_COMPLETION_KEY)
  } catch (error) {
    logger.warn('[OnboardingCache] Failed to clear cache:', error)
  }
}

