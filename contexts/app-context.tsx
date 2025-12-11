"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  getDatabase,
  resetDatabaseInstance,
  type Animal,
  type HealthCase,
  type Gestation,
  type Vaccination,
  type Activity,
  type FeedingRecord,
} from "@/lib/storage/local-database"
import { useAuthContext } from "@/contexts/auth-context"
import { db as supabaseDb, isSupabaseConfigured } from "@/lib/supabase/client"

interface AppContextType {
  // Animals
  animals: Animal[]
  addAnimal: (animal: Omit<Animal, "id" | "createdAt" | "updatedAt">) => Promise<Animal>
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<Animal | null>
  deleteAnimal: (id: string) => Promise<boolean>
  sellAnimal: (id: string) => Promise<Animal | null>
  markAnimalDead: (id: string) => Promise<Animal | null>
  getAnimalById: (id: string) => Animal | undefined
  getAnimalsByCategory: (category: Animal["category"]) => Animal[]

  // Health
  healthCases: HealthCase[]
  addHealthCase: (healthCase: Omit<HealthCase, "id" | "createdAt">) => Promise<HealthCase>
  updateHealthCase: (id: string, updates: Partial<HealthCase>) => Promise<HealthCase | null>
  deleteHealthCase: (id: string) => Promise<boolean>

  // Gestations
  gestations: Gestation[]
  addGestation: (gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">) => Promise<Gestation>
  updateGestation: (id: string, updates: Partial<Gestation>) => Promise<Gestation | null>
  completeGestation: (id: string, pigletCount: number, pigletsSurvived: number) => Promise<Gestation | null>
  deleteGestation: (id: string) => Promise<boolean>

  // Vaccinations
  vaccinations: Vaccination[]
  addVaccination: (vaccination: Omit<Vaccination, "id" | "createdAt" | "status">) => Vaccination
  completeVaccination: (id: string, completedCount: number) => Vaccination | null

  // Feeding
  feedingRecords: FeedingRecord[]
  addFeedingRecord: (record: Omit<FeedingRecord, "id" | "createdAt">) => FeedingRecord

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
  refreshData: () => Promise<void>
  isLoading: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()

  const [animals, setAnimals] = useState<Animal[]>([])
  const [healthCases, setHealthCases] = useState<HealthCase[]>([])
  const [gestations, setGestations] = useState<Gestation[]>([])
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([])
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
  const [useSupabase, setUseSupabase] = useState(false)

  const loadFromSupabase = useCallback(async (userId: string) => {
    try {
      const { data: pigs, error: pigsError } = await supabaseDb.getPigs(userId)
      if (!pigsError && pigs) {
        const mappedAnimals: Animal[] = pigs.map((pig: any) => ({
          id: pig.id,
          identifier: pig.identifier || pig.tag_number || "",
          name: pig.name || "",
          category: pig.category || "porc",
          breed: pig.breed || "",
          birthDate: pig.birth_date || pig.birthDate || "",
          weight: pig.weight || 0,
          status: pig.status || "actif",
          healthStatus: pig.health_status || "bon",
          photo: pig.photo || "",
          motherId: pig.mother_id || "",
          fatherId: pig.father_id || "",
          notes: pig.notes || "",
          createdAt: pig.created_at || new Date().toISOString(),
          updatedAt: pig.updated_at || new Date().toISOString(),
          userId: pig.user_id,
        }))
        setAnimals(mappedAnimals)
      }

      const { data: gests, error: gestsError } = await supabaseDb.getGestations(userId)
      if (!gestsError && gests) {
        const mappedGestations: Gestation[] = gests.map((g: any) => ({
          id: g.id,
          sowId: g.sow_id || "",
          sowName: g.sow_name || "",
          boarId: g.boar_id || "",
          boarName: g.boar_name || "",
          breedingDate: g.breeding_date || "",
          expectedDueDate: g.expected_due_date || "",
          actualDueDate: g.actual_due_date || "",
          status: g.status || "active",
          pigletCount: g.piglet_count || 0,
          pigletsSurvived: g.piglets_survived || 0,
          notes: g.notes || "",
          createdAt: g.created_at || new Date().toISOString(),
          userId: g.user_id,
        }))
        setGestations(mappedGestations)
      }

      const { data: cases, error: casesError } = await supabaseDb.getVeterinaryCases(userId)
      if (!casesError && cases) {
        const mappedCases: HealthCase[] = cases.map((c: any) => ({
          id: c.id,
          animalId: c.animal_id || "",
          animalName: c.animal_name || "",
          issue: c.issue || c.title || "",
          description: c.description || "",
          priority: c.priority || "medium",
          status: c.status || "open",
          treatment: c.treatment || "",
          veterinarian: c.veterinarian || "",
          photo: c.photo || "",
          cost: c.cost || 0,
          startDate: c.start_date || c.created_at || "",
          resolvedDate: c.resolved_date || "",
          createdAt: c.created_at || new Date().toISOString(),
          userId: c.user_id,
        }))
        setHealthCases(mappedCases)
      }

      const activeAnimals = (pigs || []).filter((a: any) => a.status === "actif")
      const activeGestations = (gests || []).filter((g: any) => g.status === "active")
      const activeCases = (cases || []).filter((c: any) => c.status !== "resolved")

      setStats({
        totalAnimals: activeAnimals.length,
        truies: activeAnimals.filter((a: any) => a.category === "truie").length,
        verrats: activeAnimals.filter((a: any) => a.category === "verrat").length,
        porcelets: activeAnimals.filter((a: any) => a.category === "porcelet").length,
        porcs: activeAnimals.filter((a: any) => a.category === "porc").length,
        gestationsActives: activeGestations.length,
        cassSanteActifs: activeCases.length,
        coutAlimentationMois: 0,
        alertesCount: activeCases.filter((c: any) => c.priority === "high" || c.priority === "critical").length,
      })

      const newAlerts: { type: string; title: string; description: string; priority: string; link: string }[] = []
      const today = new Date()

      activeGestations.forEach((g: any) => {
        const dueDate = new Date(g.expected_due_date || g.expectedDueDate)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          newAlerts.push({
            type: "gestation",
            title: "Mise-bas proche",
            description: `${g.sow_name || g.sowName} - ${daysUntilDue} jours`,
            priority: daysUntilDue <= 3 ? "high" : "medium",
            link: "/dashboard/reproduction",
          })
        }
      })

      activeCases.forEach((c: any) => {
        if (c.priority === "high" || c.priority === "critical") {
          newAlerts.push({
            type: "health",
            title: "Cas sanitaire urgent",
            description: `${c.animal_name || c.animalName}: ${c.issue || c.title}`,
            priority: c.priority,
            link: "/dashboard/health",
          })
        }
      })

      setAlerts(newAlerts)
      setActivities([]) // Activities will be loaded separately if needed
      setVaccinations([])
      setFeedingRecords([])

      return true
    } catch (error) {
      console.error("[AppContext] Error loading from Supabase:", error)
      return false
    }
  }, [])

  const loadFromLocalStorage = useCallback((userId?: string) => {
    const db = getDatabase(userId)
    setAnimals(db.getAnimals())
    setHealthCases(db.getHealthCases())
    setGestations(db.getGestations())
    setVaccinations(db.getVaccinations())
    setFeedingRecords(db.getFeedingRecords())
    setActivities(db.getActivities(20))
    setAlerts(db.getAlerts())
    setStats(db.getDashboardStats())
  }, [])

  const refreshData = useCallback(async () => {
    if (user?.id && useSupabase) {
      await loadFromSupabase(user.id)
    } else {
      loadFromLocalStorage(user?.id)
    }
  }, [user?.id, useSupabase, loadFromSupabase, loadFromLocalStorage])

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)

      if (user?.id && isSupabaseConfigured()) {
        setUseSupabase(true)
        const success = await loadFromSupabase(user.id)
        if (!success) {
          setUseSupabase(false)
          loadFromLocalStorage(user.id)
        }
      } else if (user?.id) {
        setUseSupabase(false)
        loadFromLocalStorage(user.id)
      } else {
        setUseSupabase(false)
        resetDatabaseInstance()
        loadFromLocalStorage(undefined)
      }

      setIsLoading(false)
    }

    initData()
  }, [user?.id, loadFromSupabase, loadFromLocalStorage])

  const addAnimal = useCallback(
    async (animal: Omit<Animal, "id" | "createdAt" | "updatedAt">) => {
      if (user?.id && useSupabase) {
        const { data, error } = await supabaseDb.addPig({
          user_id: user.id,
          identifier: animal.identifier,
          name: animal.name,
          category: animal.category,
          breed: animal.breed,
          birth_date: animal.birthDate,
          weight: animal.weight,
          status: animal.status,
          health_status: animal.healthStatus,
          photo: animal.photo,
          mother_id: animal.motherId,
          father_id: animal.fatherId,
          notes: animal.notes,
        })

        if (!error && data) {
          await refreshData()
          return {
            ...animal,
            id: data.id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          } as Animal
        }
      }

      const db = getDatabase(user?.id)
      const newAnimal = db.addAnimal(animal)
      await refreshData()
      return newAnimal
    },
    [user?.id, useSupabase, refreshData],
  )

  const updateAnimal = useCallback(
    async (id: string, updates: Partial<Animal>) => {
      if (user?.id && useSupabase) {
        const supabaseUpdates: Record<string, unknown> = {}
        if (updates.identifier !== undefined) supabaseUpdates.identifier = updates.identifier
        if (updates.name !== undefined) supabaseUpdates.name = updates.name
        if (updates.category !== undefined) supabaseUpdates.category = updates.category
        if (updates.breed !== undefined) supabaseUpdates.breed = updates.breed
        if (updates.birthDate !== undefined) supabaseUpdates.birth_date = updates.birthDate
        if (updates.weight !== undefined) supabaseUpdates.weight = updates.weight
        if (updates.status !== undefined) supabaseUpdates.status = updates.status
        if (updates.healthStatus !== undefined) supabaseUpdates.health_status = updates.healthStatus
        if (updates.photo !== undefined) supabaseUpdates.photo = updates.photo
        if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes

        const { data, error } = await supabaseDb.updatePig(id, supabaseUpdates)
        if (!error) {
          await refreshData()
          return data as Animal | null
        }
      }

      const db = getDatabase(user?.id)
      const updated = db.updateAnimal(id, updates)
      await refreshData()
      return updated
    },
    [user?.id, useSupabase, refreshData],
  )

  const deleteAnimal = useCallback(
    async (id: string) => {
      if (user?.id && useSupabase) {
        const { error } = await supabaseDb.deletePig(id)
        if (!error) {
          await refreshData()
          return true
        }
      }

      const db = getDatabase(user?.id)
      const result = db.deleteAnimal(id)
      await refreshData()
      return result
    },
    [user?.id, useSupabase, refreshData],
  )

  const sellAnimal = useCallback(
    async (id: string) => {
      return updateAnimal(id, { status: "vendu" })
    },
    [updateAnimal],
  )

  const markAnimalDead = useCallback(
    async (id: string) => {
      return updateAnimal(id, { status: "mort" })
    },
    [updateAnimal],
  )

  const getAnimalById = useCallback(
    (id: string) => {
      return animals.find((a) => a.id === id)
    },
    [animals],
  )

  const getAnimalsByCategory = useCallback(
    (category: Animal["category"]) => {
      return animals.filter((a) => a.category === category)
    },
    [animals],
  )

  const addHealthCase = useCallback(
    async (healthCase: Omit<HealthCase, "id" | "createdAt">) => {
      if (user?.id && useSupabase) {
        const { data, error } = await supabaseDb.addVeterinaryCase({
          user_id: user.id,
          animal_id: healthCase.animalId,
          animal_name: healthCase.animalName,
          issue: healthCase.issue,
          description: healthCase.description,
          priority: healthCase.priority,
          status: healthCase.status,
          treatment: healthCase.treatment,
          veterinarian: healthCase.veterinarian,
          photo: healthCase.photo,
          cost: healthCase.cost,
          start_date: healthCase.startDate,
        })

        if (!error && data) {
          await refreshData()
          return {
            ...healthCase,
            id: data.id,
            createdAt: data.created_at,
          } as HealthCase
        }
      }

      const db = getDatabase(user?.id)
      const newCase = db.addHealthCase(healthCase)
      await refreshData()
      return newCase
    },
    [user?.id, useSupabase, refreshData],
  )

  const updateHealthCase = useCallback(
    async (id: string, updates: Partial<HealthCase>) => {
      if (user?.id && useSupabase) {
        const supabaseUpdates: Record<string, unknown> = {}
        if (updates.animalId !== undefined) supabaseUpdates.animal_id = updates.animalId
        if (updates.animalName !== undefined) supabaseUpdates.animal_name = updates.animalName
        if (updates.issue !== undefined) supabaseUpdates.issue = updates.issue
        if (updates.description !== undefined) supabaseUpdates.description = updates.description
        if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority
        if (updates.status !== undefined) supabaseUpdates.status = updates.status
        if (updates.treatment !== undefined) supabaseUpdates.treatment = updates.treatment
        if (updates.veterinarian !== undefined) supabaseUpdates.veterinarian = updates.veterinarian
        if (updates.photo !== undefined) supabaseUpdates.photo = updates.photo
        if (updates.cost !== undefined) supabaseUpdates.cost = updates.cost
        if (updates.resolvedDate !== undefined) supabaseUpdates.resolved_date = updates.resolvedDate

        const { data, error } = await supabaseDb.updateVeterinaryCase(id, supabaseUpdates)
        if (!error) {
          await refreshData()
          return data as HealthCase | null
        }
      }

      const db = getDatabase(user?.id)
      const updated = db.updateHealthCase(id, updates)
      await refreshData()
      return updated
    },
    [user?.id, useSupabase, refreshData],
  )

  const deleteHealthCase = useCallback(
    async (id: string) => {
      if (user?.id && useSupabase) {
        const { error } = await supabaseDb.deleteVeterinaryCase(id)
        if (!error) {
          await refreshData()
          return true
        }
      }

      const db = getDatabase(user?.id)
      const result = db.deleteHealthCase(id)
      await refreshData()
      return result
    },
    [user?.id, useSupabase, refreshData],
  )

  const addGestation = useCallback(
    async (gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">) => {
      const breedingDate = new Date(gestation.breedingDate)
      const expectedDueDate = new Date(breedingDate)
      expectedDueDate.setDate(expectedDueDate.getDate() + 114)

      if (user?.id && useSupabase) {
        const { data, error } = await supabaseDb.addGestation({
          user_id: user.id,
          sow_id: gestation.sowId,
          sow_name: gestation.sowName,
          boar_id: gestation.boarId,
          boar_name: gestation.boarName,
          breeding_date: gestation.breedingDate,
          expected_due_date: expectedDueDate.toISOString().split("T")[0],
          status: gestation.status || "active",
          notes: gestation.notes,
        })

        if (!error && data) {
          await refreshData()
          return {
            ...gestation,
            id: data.id,
            expectedDueDate: expectedDueDate.toISOString().split("T")[0],
            createdAt: data.created_at,
          } as Gestation
        }
      }

      const db = getDatabase(user?.id)
      const newGestation = db.addGestation(gestation)
      await refreshData()
      return newGestation
    },
    [user?.id, useSupabase, refreshData],
  )

  const updateGestation = useCallback(
    async (id: string, updates: Partial<Gestation>) => {
      if (user?.id && useSupabase) {
        const supabaseUpdates: Record<string, unknown> = {}
        if (updates.sowId !== undefined) supabaseUpdates.sow_id = updates.sowId
        if (updates.sowName !== undefined) supabaseUpdates.sow_name = updates.sowName
        if (updates.boarId !== undefined) supabaseUpdates.boar_id = updates.boarId
        if (updates.boarName !== undefined) supabaseUpdates.boar_name = updates.boarName
        if (updates.breedingDate !== undefined) supabaseUpdates.breeding_date = updates.breedingDate
        if (updates.expectedDueDate !== undefined) supabaseUpdates.expected_due_date = updates.expectedDueDate
        if (updates.actualDueDate !== undefined) supabaseUpdates.actual_due_date = updates.actualDueDate
        if (updates.status !== undefined) supabaseUpdates.status = updates.status
        if (updates.pigletCount !== undefined) supabaseUpdates.piglet_count = updates.pigletCount
        if (updates.pigletsSurvived !== undefined) supabaseUpdates.piglets_survived = updates.pigletsSurvived
        if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes

        const { data, error } = await supabaseDb.updateGestation(id, supabaseUpdates)
        if (!error) {
          await refreshData()
          return data as Gestation | null
        }
      }

      const db = getDatabase(user?.id)
      const updated = db.updateGestation(id, updates)
      await refreshData()
      return updated
    },
    [user?.id, useSupabase, refreshData],
  )

  const completeGestation = useCallback(
    async (id: string, pigletCount: number, pigletsSurvived: number) => {
      if (user?.id && useSupabase) {
        const { data, error } = await supabaseDb.updateGestation(id, {
          status: "completed",
          actual_due_date: new Date().toISOString().split("T")[0],
          piglet_count: pigletCount,
          piglets_survived: pigletsSurvived,
        })
        if (!error) {
          await refreshData()
          return data as Gestation | null
        }
      }

      const db = getDatabase(user?.id)
      const result = db.completeGestation(id, pigletCount, pigletsSurvived)
      await refreshData()
      return result
    },
    [user?.id, useSupabase, refreshData],
  )

  const deleteGestation = useCallback(
    async (id: string) => {
      if (user?.id && useSupabase) {
        const { error } = await supabaseDb.deleteGestation(id)
        if (!error) {
          await refreshData()
          return true
        }
      }

      const db = getDatabase(user?.id)
      const result = db.deleteGestation(id)
      await refreshData()
      return result
    },
    [user?.id, useSupabase, refreshData],
  )

  const addVaccination = useCallback(
    (vaccination: Omit<Vaccination, "id" | "createdAt" | "status">) => {
      const db = getDatabase(user?.id)
      const newVaccination = db.addVaccination(vaccination)
      refreshData()
      return newVaccination
    },
    [user?.id, refreshData],
  )

  const completeVaccination = useCallback(
    (id: string, completedCount: number) => {
      const db = getDatabase(user?.id)
      const result = db.completeVaccination(id, completedCount)
      refreshData()
      return result
    },
    [user?.id, refreshData],
  )

  const addFeedingRecord = useCallback(
    (record: Omit<FeedingRecord, "id" | "createdAt">) => {
      const db = getDatabase(user?.id)
      const newRecord = db.addFeedingRecord(record)
      refreshData()
      return newRecord
    },
    [user?.id, refreshData],
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
        completeVaccination,
        feedingRecords,
        addFeedingRecord,
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
