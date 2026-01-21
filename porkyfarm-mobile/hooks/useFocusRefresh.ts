/**
 * Hook de rafraichissement au focus - VERSION AMÉLIORÉE
 * ======================================================
 * Rafraichit les donnees quand l'ecran recoit le focus
 * + permet le pull-to-refresh manuel
 * + gestion des erreurs avec retry automatique
 */

import { useCallback, useState, useEffect, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { logger } from '../lib/logger'

interface UseFocusRefreshOptions<T> {
  initialData?: T
  enabled?: boolean
  onError?: (error: Error) => void
  retryOnFarmError?: boolean
  maxRetries?: number
  timeout?: number // Timeout en ms pour éviter skeleton infini
}

/**
 * Hook pour rafraichir les donnees quand l'ecran recoit le focus
 * ET permettre un rafraichissement manuel
 */
export function useFocusRefresh<T>(
  fetchFn: () => Promise<{ data: T | null; error: Error | null }>,
  deps: unknown[] = [],
  options: UseFocusRefreshOptions<T> = {}
) {
  const {
    initialData = null as T,
    enabled = true,
    onError,
    retryOnFarmError = true,
    maxRetries = 3,
    timeout = 10000, // 10 secondes par défaut
  } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const retryCount = useRef(0)
  const isMounted = useRef(true)
  const isFetching = useRef(false)
  const hasLoadedOnce = useRef(false)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [])

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!enabled) {
        setLoading(false)
        return
      }

      // Éviter les appels multiples simultanés
      if (isFetching.current && !isRefresh) return
      if (!isMounted.current) return

      isFetching.current = true

      // Clear previous timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = null
      }

      if (isRefresh) {
        setRefreshing(true)
        retryCount.current = 0 // Reset retry count on manual refresh
      } else if (!hasLoadedOnce.current) {
        setLoading(true)
      }
      setError(null)

      // Set timeout pour éviter skeleton infini
      fetchTimeoutRef.current = setTimeout(() => {
        if (isMounted.current && isFetching.current) {
          logger.warn('[useFocusRefresh] Timeout reached after', timeout, 'ms')
          setLoading(false)
          setRefreshing(false)
          setError('Délai de chargement dépassé. Vérifiez votre connexion.')
          isFetching.current = false
        }
      }, timeout)

      try {
        const result = await fetchFn()

        if (!isMounted.current) return

        // Clear timeout on success
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current)
          fetchTimeoutRef.current = null
        }

        if (result.error) {
          const errorMessage = result.error instanceof Error
            ? result.error.message
            : String(result.error)

          // Gestion spéciale pour l'erreur "Aucune ferme trouvée"
          if (errorMessage.includes('Aucune ferme') && retryOnFarmError) {
            logger.warn('[useFocusRefresh] No farm found, will retry...')

            // Réessayer après un délai si c'est un problème de ferme
            if (retryCount.current < maxRetries) {
              retryCount.current++
              isFetching.current = false
              const delay = 1000 * retryCount.current // Délai exponentiel

              retryTimeoutRef.current = setTimeout(() => {
                if (isMounted.current) {
                  fetchData(false)
                }
              }, delay)

              // Retourner des données vides en attendant
              setData(initialData)
              setLoading(false)
              setRefreshing(false)
              return
            } else {
              // Max retries atteint
              logger.error('[useFocusRefresh] Max retries reached for farm error')
              setError('Impossible de charger la ferme. Veuillez vous reconnecter.')
              onError?.(new Error(errorMessage))
            }
          } else {
            // Erreur normale
            logger.error('[useFocusRefresh] Fetch error:', errorMessage)
            setError(errorMessage)
            onError?.(result.error instanceof Error ? result.error : new Error(errorMessage))
          }
        } else {
          // Succès
          retryCount.current = 0
          hasLoadedOnce.current = true
          setData(result.data)
          setError(null)
        }
      } catch (err) {
        if (!isMounted.current) return

        // Clear timeout on error
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current)
          fetchTimeoutRef.current = null
        }

        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement'
        logger.error('[useFocusRefresh] Exception:', errorMessage)
        setError(errorMessage)
        onError?.(err instanceof Error ? err : new Error(errorMessage))
      } finally {
        if (isMounted.current) {
          setLoading(false)
          setRefreshing(false)
          isFetching.current = false
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchFn, enabled, initialData, onError, retryOnFarmError, maxRetries, timeout, ...deps]
  )

  // Rafraichir au focus de l'ecran
  useFocusEffect(
    useCallback(() => {
      retryCount.current = 0
      fetchData()
    }, [fetchData])
  )

  // Fonction de rafraichissement manuel (pour pull-to-refresh)
  const refresh = useCallback(() => {
    retryCount.current = 0
    return fetchData(true)
  }, [fetchData])

  // Fonction de refetch immediat (apres une mutation)
  const refetch = useCallback(() => {
    retryCount.current = 0
    return fetchData(false)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refreshing,
    refresh,
    refetch,
    setData, // Permet de mettre à jour les données manuellement
  }
}

/**
 * Hook simplifie pour les listes avec pull-to-refresh
 * Retourne toujours un tableau (jamais null)
 */
export function useListData<T>(
  fetchFn: () => Promise<{ data: T[] | null; error: Error | null }>,
  deps: unknown[] = []
) {
  const result = useFocusRefresh<T[]>(fetchFn, deps, { initialData: [] })
  return {
    ...result,
    data: result.data || [],
  }
}

/**
 * Hook pour un element unique avec rafraichissement au focus
 */
export function useSingleData<T>(
  fetchFn: () => Promise<{ data: T | null; error: Error | null }>,
  deps: unknown[] = []
) {
  return useFocusRefresh<T>(fetchFn, deps)
}

export default useFocusRefresh
