/**
 * Hook useDataWithCache
 * Gestion des données avec cache local et support offline
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { cacheService } from '../lib/cacheService'
import { syncService } from '../lib/syncService'

const DEFAULT_TIMEOUT = 15000

interface UseDataWithCacheOptions {
  cacheKey?: string
  cacheExpiry?: number
  timeout?: number
  loadOnFocus?: boolean
}

interface UseDataWithCacheResult<T> {
  data: T
  loading: boolean
  refreshing: boolean
  error: string | null
  isFromCache: boolean
  isOffline: boolean
  refresh: () => Promise<void>
  retry: () => Promise<void>
}

export function useDataWithCache<T>(
  fetchFn: () => Promise<{ data: T | null; error: string | null }>,
  defaultValue: T,
  options: UseDataWithCacheOptions = {}
): UseDataWithCacheResult<T> {
  const {
    cacheKey,
    cacheExpiry = 5 * 60 * 1000,
    timeout = DEFAULT_TIMEOUT,
    loadOnFocus = true,
  } = options

  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  const isMounted = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isMounted.current) return

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    setIsFromCache(false)

    // Si pas de refresh, essayer le cache d'abord
    if (!isRefresh && cacheKey) {
      const cached = await cacheService.get<T>(cacheKey)
      if (cached !== null) {
        setData(cached)
        setIsFromCache(true)
        setLoading(false)
        // Continuer le fetch en background
      }
    }

    // Timeout
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false)
        setRefreshing(false)
        if (!isFromCache) {
          setError('Délai de chargement dépassé')
        }
      }
    }, timeout)

    try {
      // Vérifier la connexion
      const online = await syncService.isOnline()
      setIsOffline(!online)

      if (!online && cacheKey) {
        // Utiliser le cache si offline
        const cached = await cacheService.get<T>(cacheKey)
        if (cached !== null) {
          setData(cached)
          setIsFromCache(true)
          setError(null)
        } else {
          setError('Hors ligne - Aucune donnée en cache')
        }
      } else {
        // Fetch normal
        const result = await fetchFn()

        if (!isMounted.current) return

        if (result.error) {
          setError(result.error)
        } else {
          setData(result.data ?? defaultValue)
          setError(null)
          setIsFromCache(false)

          // Mettre en cache
          if (cacheKey && result.data) {
            await cacheService.set(cacheKey, result.data, cacheExpiry)
          }
        }
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Erreur de chargement')
      }
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (isMounted.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [fetchFn, defaultValue, cacheKey, cacheExpiry, timeout, isFromCache])

  useFocusEffect(
    useCallback(() => {
      if (loadOnFocus) {
        fetchData(false)
      }
    }, [fetchData, loadOnFocus])
  )

  const refresh = useCallback(() => fetchData(true), [fetchData])
  const retry = useCallback(() => fetchData(false), [fetchData])

  return {
    data,
    loading,
    refreshing,
    error,
    isFromCache,
    isOffline,
    refresh,
    retry,
  }
}

export default useDataWithCache

