/**
 * RefreshContext - Gestion globale du rafraichissement
 * =====================================================
 * Permet de declencher un refetch des donnees apres une mutation
 * depuis n'importe quel ecran
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface RefreshContextType {
  // Compteurs de version pour forcer le refetch
  animalsVersion: number
  healthCasesVersion: number
  feedStockVersion: number
  costsVersion: number
  gestationsVersion: number
  tasksVersion: number
  // Fonctions pour incrementer apres une mutation
  refreshAnimals: () => void
  refreshHealthCases: () => void
  refreshFeedStock: () => void
  refreshCosts: () => void
  refreshGestations: () => void
  refreshTasks: () => void
  refreshAll: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [animalsVersion, setAnimalsVersion] = useState(0)
  const [healthCasesVersion, setHealthCasesVersion] = useState(0)
  const [feedStockVersion, setFeedStockVersion] = useState(0)
  const [costsVersion, setCostsVersion] = useState(0)
  const [gestationsVersion, setGestationsVersion] = useState(0)
  const [tasksVersion, setTasksVersion] = useState(0)

  const refreshAnimals = useCallback(() => {
    setAnimalsVersion((v) => v + 1)
  }, [])

  const refreshHealthCases = useCallback(() => {
    setHealthCasesVersion((v) => v + 1)
  }, [])

  const refreshFeedStock = useCallback(() => {
    setFeedStockVersion((v) => v + 1)
  }, [])

  const refreshCosts = useCallback(() => {
    setCostsVersion((v) => v + 1)
  }, [])

  const refreshGestations = useCallback(() => {
    setGestationsVersion((v) => v + 1)
  }, [])

  const refreshTasks = useCallback(() => {
    setTasksVersion((v) => v + 1)
  }, [])

  const refreshAll = useCallback(() => {
    refreshAnimals()
    refreshHealthCases()
    refreshFeedStock()
    refreshCosts()
    refreshGestations()
    refreshTasks()
  }, [refreshAnimals, refreshHealthCases, refreshFeedStock, refreshCosts, refreshGestations, refreshTasks])

  const value = useMemo(
    () => ({
      animalsVersion,
      healthCasesVersion,
      feedStockVersion,
      costsVersion,
      gestationsVersion,
      tasksVersion,
      refreshAnimals,
      refreshHealthCases,
      refreshFeedStock,
      refreshCosts,
      refreshGestations,
      refreshTasks,
      refreshAll,
    }),
    [
      animalsVersion,
      healthCasesVersion,
      feedStockVersion,
      costsVersion,
      gestationsVersion,
      tasksVersion,
      refreshAnimals,
      refreshHealthCases,
      refreshFeedStock,
      refreshCosts,
      refreshGestations,
      refreshTasks,
      refreshAll,
    ]
  )

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
}

export function useRefresh() {
  const context = useContext(RefreshContext)
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider')
  }
  return context
}

export default RefreshContext
