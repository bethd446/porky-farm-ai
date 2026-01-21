/**
 * Hook useData unifié
 * ===================
 * Gère le chargement, les erreurs, et le refresh pour TOUS les écrans
 * Avec timeout pour éviter skeleton infini
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { logger } from '../lib/logger'

interface UseDataOptions<T> {
  initialData?: T
  enabled?: boolean
  loadingTimeout?: number // Timeout pour éviter skeleton infini
}

interface UseDataResult<T> {
  data: T
  loading: boolean
  refreshing: boolean
  error: string | null
  isEmpty: boolean
  refresh: () => Promise<void>
  refetch: () => Promise<void>
}

export function useData<T>(
  fetchFn: () => Promise<{ data: T | null; error: Error | null }>,
  defaultValue: T,
  deps: readonly unknown[] = [],
  options: UseDataOptions<T> = {}
): UseDataResult<T> {
  const {
    enabled = true,
    loadingTimeout = 15000, // 15 secondes max
  } = options

  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFetching = useRef(false)
  const fetchFnRef = useRef(fetchFn)
  const defaultValueRef = useRef(defaultValue)
  const hasLoadedOnce = useRef(false)

  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    fetchFnRef.current = fetchFn
    defaultValueRef.current = defaultValue
  }, [fetchFn, defaultValue])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    // Éviter les appels multiples simultanés
    if (isFetching.current && !isRefresh) return
    if (!enabled || !isMounted.current) return

    isFetching.current = true

    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (isRefresh) {
      setRefreshing(true)
    } else if (!hasLoadedOnce.current) {
      setLoading(true)
    }
    setError(null)

    // Timeout pour éviter skeleton infini
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false)
        setRefreshing(false)
        setError('Délai de chargement dépassé')
        isFetching.current = false
      }
    }, loadingTimeout)

    try {
      const result = await fetchFnRef.current()

      if (!isMounted.current) return

      // Clear timeout on success
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      if (result.error) {
        const errorMsg = result.error?.message || 'Erreur de chargement'
        logger.warn('[useData] Error:', errorMsg)
        setError(errorMsg)
        setData(defaultValueRef.current)
      } else {
        setData(result.data ?? defaultValueRef.current)
        setError(null)
        hasLoadedOnce.current = true
      }
    } catch (err: unknown) {
      if (!isMounted.current) return
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      const error = err instanceof Error ? err : new Error(String(err))
      logger.error('[useData] Exception:', error)
      setError(error.message)
      setData(defaultValueRef.current)
    } finally {
      if (isMounted.current) {
        setLoading(false)
        setRefreshing(false)
        isFetching.current = false
      }
    }
  }, [enabled, loadingTimeout, ...deps])

  // Charger au focus - une seule fois au montage ou quand deps changent
  useFocusEffect(
    useCallback(() => {
      fetchData(false)
    }, [fetchData])
  )

  const refresh = useCallback(() => fetchData(true), [fetchData])
  const refetch = useCallback(() => fetchData(false), [fetchData])

  // Calculer isEmpty
  const isEmpty = Array.isArray(data) ? data.length === 0 : !data

  return {
    data,
    loading,
    refreshing,
    error,
    isEmpty,
    refresh,
    refetch,
  }
}

// Version pour les listes
export function useListData<T>(
  fetchFn: () => Promise<{ data: T[] | null; error: Error | null }>,
  deps: readonly unknown[] = []
) {
  return useData<T[]>(fetchFn, [], deps)
}

export default useData

