"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  getDatabase,
  type Animal,
  type HealthCase,
  type Gestation,
  type Vaccination,
  type Activity,
  type FeedingRecord,
  type FinancialRecord,
} from "@/lib/storage/local-database"

interface AppContextType {
  // Animals
  animals: Animal[]
  addAnimal: (animal: Omit<Animal, "id" | "createdAt" | "updatedAt">) => Animal
  updateAnimal: (id: string, updates: Partial<Animal>) => Animal | null
  deleteAnimal: (id: string) => boolean
  sellAnimal: (id: string) => Animal | null
  markAnimalDead: (id: string) => Animal | null
  getAnimalById: (id: string) => Animal | undefined
  getAnimalsByCategory: (category: Animal["category"]) => Animal[]
  getPigletsByMother: (motherId: string) => Animal[]
  getOffspring: (animalId: string) => Animal[]
  getMother: (animalId: string) => Animal | undefined
  getFather: (animalId: string) => Animal | undefined
  getFamilyTree: (animalId: string) => {
    animal: Animal
    mother?: Animal
    father?: Animal
    children: Animal[]
  } | null

  // Health
  healthCases: HealthCase[]
  addHealthCase: (healthCase: Omit<HealthCase, "id" | "createdAt">) => HealthCase
  updateHealthCase: (id: string, updates: Partial<HealthCase>) => HealthCase | null
  deleteHealthCase: (id: string) => boolean

  // Gestations
  gestations: Gestation[]
  addGestation: (gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">) => Gestation
  updateGestation: (id: string, updates: Partial<Gestation>) => Gestation | null
  completeGestation: (id: string, pigletCount: number, pigletsSurvived: number) => Gestation | null
  deleteGestation: (id: string) => boolean

  // Vaccinations
  vaccinations: Vaccination[]
  addVaccination: (vaccination: Omit<Vaccination, "id" | "createdAt">) => Vaccination

  // Feeding
  feedingRecords: FeedingRecord[]
  addFeedingRecord: (record: Omit<FeedingRecord, "id" | "createdAt">) => FeedingRecord

  // Financial
  financialRecords: FinancialRecord[]
  addFinancialRecord: (record: Omit<FinancialRecord, "id" | "createdAt">) => FinancialRecord
  updateFinancialRecord: (id: string, updates: Partial<FinancialRecord>) => FinancialRecord | null
  deleteFinancialRecord: (id: string) => boolean
  getFinancialStats: (period?: "month" | "year") => {
    income: number
    expenses: number
    profit: number
    recordCount: number
  }

  // Activities & Alerts
  activities: Activity[]
  alerts: { type: string; title: string; description: string; priority: string; link: string }[]

  // Stats
  stats: {
    totalAnimals: number
    truies: number
    verrats: number
    porcelets: number
    porcs: number
    gestationsActives: number
    cassSanteActifs: number
    coutAlimentationMois: number
    alertesCount: number
  }

  // Utility
  refreshData: () => void
  isLoading: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [healthCases, setHealthCases] = useState<HealthCase[]>([])
  const [gestations, setGestations] = useState<Gestation[]>([])
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([])
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [alerts, setAlerts] = useState<
    { type: string; title: string; description: string; priority: string; link: string }[]
  >([])
  const [stats, setStats] = useState({
    totalAnimals: 0,
    truies: 0,
    verrats: 0,
    porcelets: 0,
    porcs: 0,
    gestationsActives: 0,
    cassSanteActifs: 0,
    coutAlimentationMois: 0,
    alertesCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = useCallback(() => {
    const db = getDatabase()
    setAnimals(db.getAnimals())
    setHealthCases(db.getHealthCases())
    setGestations(db.getGestations())
    setVaccinations(db.getVaccinations())
    setFeedingRecords(db.getFeedingRecords())
    setFinancialRecords(db.getFinancialRecords())
    setActivities(db.getActivities(20))
    setAlerts(db.getAlerts())
    setStats(db.getDashboardStats())
  }, [])

  useEffect(() => {
    refreshData()
    setIsLoading(false)
  }, [refreshData])

  // Animal methods
  const addAnimal = useCallback(
    (animal: Omit<Animal, "id" | "createdAt" | "updatedAt">) => {
      const db = getDatabase()
      const newAnimal = db.addAnimal(animal)
      refreshData()
      return newAnimal
    },
    [refreshData],
  )

  const updateAnimal = useCallback(
    (id: string, updates: Partial<Animal>) => {
      const db = getDatabase()
      const updated = db.updateAnimal(id, updates)
      refreshData()
      return updated
    },
    [refreshData],
  )

  const deleteAnimal = useCallback(
    (id: string) => {
      const db = getDatabase()
      const result = db.deleteAnimal(id)
      refreshData()
      return result
    },
    [refreshData],
  )

  const sellAnimal = useCallback(
    (id: string) => {
      const db = getDatabase()
      const result = db.sellAnimal(id)
      refreshData()
      return result
    },
    [refreshData],
  )

  const markAnimalDead = useCallback(
    (id: string) => {
      const db = getDatabase()
      const result = db.markAnimalDead(id)
      refreshData()
      return result
    },
    [refreshData],
  )

  const getAnimalById = useCallback((id: string) => {
    const db = getDatabase()
    return db.getAnimalById(id)
  }, [])

  const getAnimalsByCategory = useCallback((category: Animal["category"]) => {
    const db = getDatabase()
    return db.getAnimalsByCategory(category)
  }, [])

  const getPigletsByMother = useCallback((motherId: string) => {
    const db = getDatabase()
    return db.getPigletsByMother(motherId)
  }, [])

  const getOffspring = useCallback((animalId: string) => {
    const db = getDatabase()
    return db.getOffspring(animalId)
  }, [])

  const getMother = useCallback((animalId: string) => {
    const db = getDatabase()
    return db.getMother(animalId)
  }, [])

  const getFather = useCallback((animalId: string) => {
    const db = getDatabase()
    return db.getFather(animalId)
  }, [])

  const getFamilyTree = useCallback((animalId: string) => {
    const db = getDatabase()
    return db.getFamilyTree(animalId)
  }, [])

  // Health methods
  const addHealthCase = useCallback(
    (healthCase: Omit<HealthCase, "id" | "createdAt">) => {
      const db = getDatabase()
      const newCase = db.addHealthCase(healthCase)
      refreshData()
      return newCase
    },
    [refreshData],
  )

  const updateHealthCase = useCallback(
    (id: string, updates: Partial<HealthCase>) => {
      const db = getDatabase()
      const updated = db.updateHealthCase(id, updates)
      refreshData()
      return updated
    },
    [refreshData],
  )

  const deleteHealthCase = useCallback(
    (id: string) => {
      const db = getDatabase()
      const result = db.deleteHealthCase(id)
      refreshData()
      return result
    },
    [refreshData],
  )

  // Gestation methods
  const addGestation = useCallback(
    (gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">) => {
      const db = getDatabase()
      const newGestation = db.addGestation(gestation)
      refreshData()
      return newGestation
    },
    [refreshData],
  )

  const updateGestation = useCallback(
    (id: string, updates: Partial<Gestation>) => {
      const db = getDatabase()
      const updated = db.updateGestation(id, updates)
      refreshData()
      return updated
    },
    [refreshData],
  )

  const completeGestation = useCallback(
    (id: string, pigletCount: number, pigletsSurvived: number) => {
      const db = getDatabase()
      const result = db.completeGestation(id, pigletCount, pigletsSurvived)
      refreshData()
      return result
    },
    [refreshData],
  )

  const deleteGestation = useCallback(
    (id: string) => {
      const db = getDatabase()
      const result = db.deleteGestation(id)
      refreshData()
      return result
    },
    [refreshData],
  )

  // Vaccination methods
  const addVaccination = useCallback(
    (vaccination: Omit<Vaccination, "id" | "createdAt">) => {
      const db = getDatabase()
      const newVaccination = db.addVaccination(vaccination)
      refreshData()
      return newVaccination
    },
    [refreshData],
  )

  // Feeding methods
  const addFeedingRecord = useCallback(
    (record: Omit<FeedingRecord, "id" | "createdAt">) => {
      const db = getDatabase()
      const newRecord = db.addFeedingRecord(record)
      refreshData()
      return newRecord
    },
    [refreshData],
  )

  // Financial methods
  const addFinancialRecord = useCallback(
    (record: Omit<FinancialRecord, "id" | "createdAt">) => {
      const db = getDatabase()
      const newRecord = db.addFinancialRecord(record)
      refreshData()
      return newRecord
    },
    [refreshData],
  )

  const updateFinancialRecord = useCallback(
    (id: string, updates: Partial<FinancialRecord>) => {
      const db = getDatabase()
      const updated = db.updateFinancialRecord(id, updates)
      refreshData()
      return updated
    },
    [refreshData],
  )

  const deleteFinancialRecord = useCallback(
    (id: string) => {
      const db = getDatabase()
      const result = db.deleteFinancialRecord(id)
      refreshData()
      return result
    },
    [refreshData],
  )

  const getFinancialStats = useCallback(
    (period: "month" | "year" = "month") => {
      const db = getDatabase()
      return db.getFinancialStats(period)
    },
    [],
  )

  return (
    <AppContext.Provider
      value={{
        animals,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        sellAnimal,
        markAnimalDead,
        getAnimalById,
        getAnimalsByCategory,
        getPigletsByMother,
        getOffspring,
        getMother,
        getFather,
        getFamilyTree,
        healthCases,
        addHealthCase,
        updateHealthCase,
        deleteHealthCase,
        gestations,
        addGestation,
        updateGestation,
        completeGestation,
        deleteGestation,
        vaccinations,
        addVaccination,
        feedingRecords,
        addFeedingRecord,
        financialRecords,
        addFinancialRecord,
        updateFinancialRecord,
        deleteFinancialRecord,
        getFinancialStats,
        activities,
        alerts,
        stats,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
