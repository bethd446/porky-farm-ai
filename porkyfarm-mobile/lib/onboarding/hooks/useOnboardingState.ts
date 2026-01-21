/**
 * Hook React pour accéder à l'état d'onboarding
 * Gère le loading, les erreurs, et expose les méthodes
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { loadOnboardingState, markOnboardingStep, completeOnboarding, processPendingCompletion } from '../state'
import { getOnboardingCache } from '../cache'
import type { OnboardingState } from '../types'

interface UseOnboardingStateReturn {
  state: OnboardingState | null
  loading: boolean
  error: Error | null
  reload: () => Promise<void>
  markStep: (step: string, partialData?: any) => Promise<{ error: Error | null; persisted: boolean }>
  complete: (finalData?: any) => Promise<{ error: Error | null; persisted: boolean; profile: any | null }>
  cachedData: unknown | null // Pour pré-remplir les formulaires si offline
}

/**
 * Hook pour accéder à l'état d'onboarding
 */
export function useOnboardingState(): UseOnboardingStateReturn {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [cachedData, setCachedData] = useState<unknown | null>(null)

  /**
   * Charger l'état depuis Supabase
   */
  const loadState = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Charger depuis Supabase (source de vérité)
      const { state: loadedState, error: loadError } = await loadOnboardingState()

      if (loadError) {
        setError(loadError)
        setState(null)
      } else {
        setState(loadedState)
        setError(null)
      }

      // Charger le cache local (pour pré-remplir si offline)
      const cache = await getOnboardingCache()
      setCachedData(cache?.data || null)

      // Traiter un "pending completion" s'il existe
      if (loadedState && !loadedState.hasCompleted) {
        await processPendingCompletion()
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inattendue')
      setError(error)
      setState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Recharger l'état
   */
  const reload = useCallback(async () => {
    await loadState()
  }, [loadState])

  /**
   * Marquer une étape
   */
  const markStepHandler = useCallback(
    async (step: string, partialData?: any) => {
      const result = await markOnboardingStep(step, partialData)
      
      // Recharger l'état après mutation
      if (!result.error && result.persisted) {
        await loadState()
      }

      return result
    },
    [loadState]
  )

  /**
   * Compléter l'onboarding
   */
  const completeHandler = useCallback(
    async (finalData?: any) => {
      try {
        const profile = await completeOnboarding(finalData)
        
        // Recharger l'état après mutation
        await loadState()

        return { error: null, persisted: true, profile }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Erreur inattendue')
        return { error: err, persisted: false, profile: null }
      }
    },
    [loadState]
  )

  // Charger l'état au montage UNE SEULE FOIS
  const hasLoadedRef = useRef(false)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadState()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Charger une seule fois au montage

  return {
    state,
    loading,
    error,
    reload,
    markStep: markStepHandler,
    complete: completeHandler,
    cachedData,
  }
}

