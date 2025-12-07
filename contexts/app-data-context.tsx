"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

// Types
export interface Animal {
  id: string
  identifier: string
  name: string
  category: "truie" | "verrat" | "porcelet" | "engraissement"
  status: "healthy" | "sick" | "pregnant" | "nursing"
  weight: number
  birthDate: string
  entryDate: string
  breed: string
  origin: string
  price: number
  notes: string
  photo: string | null
  createdAt: string
  updatedAt: string
}

export interface HealthCase {
  id: string
  animalId: string
  animalName: string
  issue: string
  priority: "Haute" | "Moyenne" | "Basse"
  status: "active" | "ongoing" | "resolved"
  treatment: string
  photo: string | null
  date: string
  resolvedDate: string | null
  createdAt: string
}

export interface Gestation {
  id: string
  sowId: string
  sowName: string
  boarId: string
  boarName: string
  breedingDate: string
  dueDate: string
  status: "active" | "completed" | "failed"
  notes: string
  pigletCount: number | null
  createdAt: string
}

export interface Activity {
  id: string
  type: "animal_added" | "animal_updated" | "animal_deleted" | "health_case" | "gestation" | "vaccination" | "feeding"
  title: string
  description: string
  entityId: string
  entityType: "animal" | "health" | "gestation" | "vaccination"
  timestamp: string
}

export interface FeedingRecord {
  id: string
  category: string
  animalCount: number
  dailyAmount: number
  monthlyAmount: number
  date: string
}

interface AppDataContextType {
  // Animals
  animals: Animal[]
  addAnimal: (animal: Omit<Animal, "id" | "createdAt" | "updatedAt">) => Animal
  updateAnimal: (id: string, data: Partial<Animal>) => void
  deleteAnimal: (id: string) => void
  getAnimalById: (id: string) => Animal | undefined
  getAnimalsByCategory: (category: Animal["category"]) => Animal[]

  // Health Cases
  healthCases: HealthCase[]
  addHealthCase: (data: Omit<HealthCase, "id" | "createdAt">) => HealthCase
  updateHealthCase: (id: string, data: Partial<HealthCase>) => void
  resolveHealthCase: (id: string) => void
  deleteHealthCase: (id: string) => void

  // Gestations
  gestations: Gestation[]
  addGestation: (data: Omit<Gestation, "id" | "createdAt">) => Gestation
  updateGestation: (id: string, data: Partial<Gestation>) => void
  completeGestation: (id: string, pigletCount: number) => void
  deleteGestation: (id: string) => void

  // Activities
  activities: Activity[]

  // Feeding Records
  feedingRecords: FeedingRecord[]
  addFeedingRecord: (data: Omit<FeedingRecord, "id">) => void

  // Stats
  stats: {
    totalAnimals: number
    truies: number
    verrats: number
    porcelets: number
    engraissement: number
    healthyCount: number
    sickCount: number
    pregnantCount: number
    activeHealthCases: number
    activeGestations: number
    upcomingBirths: number
  }

  // Alerts
  alerts: {
    id: string
    type: "warning" | "danger" | "info" | "success"
    title: string
    message: string
    date: string
    actionLabel?: string
    actionUrl?: string
  }[]

  // Loading state
  isLoading: boolean
}

const AppDataContext = createContext<AppDataContextType | null>(null)

// Initial demo data
const initialAnimals: Animal[] = [
  {
    id: "1",
    identifier: "TR-001",
    name: "Bella",
    category: "truie",
    status: "pregnant",
    weight: 220,
    birthDate: "2022-03-15",
    entryDate: "2022-06-01",
    breed: "Large White",
    origin: "Ferme locale",
    price: 350000,
    notes: "Excellente reproductrice",
    photo: null,
    createdAt: "2022-06-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "2",
    identifier: "TR-002",
    name: "Rosa",
    category: "truie",
    status: "nursing",
    weight: 195,
    birthDate: "2022-08-20",
    entryDate: "2022-11-15",
    breed: "Landrace",
    origin: "Import",
    price: 400000,
    notes: "Bonne laitière - 12 porcelets",
    photo: null,
    createdAt: "2022-11-15T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "3",
    identifier: "TR-003",
    name: "Luna",
    category: "truie",
    status: "healthy",
    weight: 180,
    birthDate: "2023-01-10",
    entryDate: "2023-04-01",
    breed: "Duroc",
    origin: "Ferme locale",
    price: 320000,
    notes: "",
    photo: null,
    createdAt: "2023-04-01T10:00:00Z",
    updatedAt: "2024-09-01T10:00:00Z",
  },
  {
    id: "4",
    identifier: "VR-001",
    name: "Max",
    category: "verrat",
    status: "healthy",
    weight: 280,
    birthDate: "2021-06-20",
    entryDate: "2021-12-01",
    breed: "Piétrain",
    origin: "Import Belgique",
    price: 600000,
    notes: "Excellent géniteur",
    photo: null,
    createdAt: "2021-12-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "5",
    identifier: "VR-002",
    name: "Rocky",
    category: "verrat",
    status: "healthy",
    weight: 260,
    birthDate: "2022-02-15",
    entryDate: "2022-08-01",
    breed: "Large White",
    origin: "Ferme locale",
    price: 500000,
    notes: "",
    photo: null,
    createdAt: "2022-08-01T10:00:00Z",
    updatedAt: "2024-08-01T10:00:00Z",
  },
  {
    id: "6",
    identifier: "PC-001",
    name: "Petit 1",
    category: "porcelet",
    status: "healthy",
    weight: 12,
    birthDate: "2024-10-15",
    entryDate: "2024-10-15",
    breed: "Croisé",
    origin: "Né sur place",
    price: 25000,
    notes: "Portée de Rosa",
    photo: null,
    createdAt: "2024-10-15T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "7",
    identifier: "PC-002",
    name: "Petit 2",
    category: "porcelet",
    status: "healthy",
    weight: 11,
    birthDate: "2024-10-15",
    entryDate: "2024-10-15",
    breed: "Croisé",
    origin: "Né sur place",
    price: 25000,
    notes: "Portée de Rosa",
    photo: null,
    createdAt: "2024-10-15T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "8",
    identifier: "EG-001",
    name: "Gros 1",
    category: "engraissement",
    status: "healthy",
    weight: 85,
    birthDate: "2024-05-01",
    entryDate: "2024-07-15",
    breed: "Croisé",
    origin: "Né sur place",
    price: 120000,
    notes: "Croissance rapide",
    photo: null,
    createdAt: "2024-07-15T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "9",
    identifier: "TR-004",
    name: "Daisy",
    category: "truie",
    status: "sick",
    weight: 175,
    birthDate: "2023-03-20",
    entryDate: "2023-07-01",
    breed: "Hampshire",
    origin: "Import",
    price: 380000,
    notes: "Sous traitement - boiterie",
    photo: null,
    createdAt: "2023-07-01T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
]

const initialHealthCases: HealthCase[] = [
  {
    id: "h1",
    animalId: "9",
    animalName: "Daisy (TR-004)",
    issue: "Boiterie membre postérieur gauche",
    priority: "Haute",
    status: "ongoing",
    treatment: "Anti-inflammatoires + repos",
    photo: null,
    date: "20 Nov 2024",
    resolvedDate: null,
    createdAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "h2",
    animalId: "6",
    animalName: "Petit 1 (PC-001)",
    issue: "Diarrhée légère",
    priority: "Moyenne",
    status: "ongoing",
    treatment: "Électrolytes + surveillance",
    photo: null,
    date: "22 Nov 2024",
    resolvedDate: null,
    createdAt: "2024-11-22T10:00:00Z",
  },
]

const initialGestations: Gestation[] = [
  {
    id: "g1",
    sowId: "1",
    sowName: "Bella (TR-001)",
    boarId: "4",
    boarName: "Max (VR-001)",
    breedingDate: "2024-09-01",
    dueDate: "2024-12-24",
    status: "active",
    notes: "Échographie OK - 11 fœtus",
    pigletCount: null,
    createdAt: "2024-09-01T10:00:00Z",
  },
]

const initialActivities: Activity[] = [
  {
    id: "a1",
    type: "health_case",
    title: "Cas sanitaire signalé",
    description: "Boiterie détectée sur Daisy",
    entityId: "h1",
    entityType: "health",
    timestamp: "2024-11-20T10:00:00Z",
  },
  {
    id: "a2",
    type: "gestation",
    title: "Gestation confirmée",
    description: "Bella - 11 fœtus détectés",
    entityId: "g1",
    entityType: "gestation",
    timestamp: "2024-09-15T10:00:00Z",
  },
  {
    id: "a3",
    type: "animal_added",
    title: "Nouveaux porcelets",
    description: "Portée de Rosa - 12 porcelets",
    entityId: "6",
    entityType: "animal",
    timestamp: "2024-10-15T10:00:00Z",
  },
]

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [healthCases, setHealthCases] = useState<HealthCase[]>([])
  const [gestations, setGestations] = useState<Gestation[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedAnimals = localStorage.getItem("porkyfarm_animals")
        const storedHealth = localStorage.getItem("porkyfarm_health")
        const storedGestations = localStorage.getItem("porkyfarm_gestations")
        const storedActivities = localStorage.getItem("porkyfarm_activities")
        const storedFeeding = localStorage.getItem("porkyfarm_feeding")

        setAnimals(storedAnimals ? JSON.parse(storedAnimals) : initialAnimals)
        setHealthCases(storedHealth ? JSON.parse(storedHealth) : initialHealthCases)
        setGestations(storedGestations ? JSON.parse(storedGestations) : initialGestations)
        setActivities(storedActivities ? JSON.parse(storedActivities) : initialActivities)
        setFeedingRecords(storedFeeding ? JSON.parse(storedFeeding) : [])
      } catch (error) {
        console.error("Error loading data:", error)
        setAnimals(initialAnimals)
        setHealthCases(initialHealthCases)
        setGestations(initialGestations)
        setActivities(initialActivities)
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("porkyfarm_animals", JSON.stringify(animals))
    }
  }, [animals, isLoading])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("porkyfarm_health", JSON.stringify(healthCases))
    }
  }, [healthCases, isLoading])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("porkyfarm_gestations", JSON.stringify(gestations))
    }
  }, [gestations, isLoading])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("porkyfarm_activities", JSON.stringify(activities))
    }
  }, [activities, isLoading])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("porkyfarm_feeding", JSON.stringify(feedingRecords))
    }
  }, [feedingRecords, isLoading])

  // Helper to add activity
  const addActivity = useCallback((activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    setActivities((prev) => [newActivity, ...prev].slice(0, 50)) // Keep last 50
  }, [])

  // Animal functions
  const addAnimal = useCallback(
    (data: Omit<Animal, "id" | "createdAt" | "updatedAt">): Animal => {
      const newAnimal: Animal = {
        ...data,
        id: `animal-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setAnimals((prev) => [newAnimal, ...prev])
      addActivity({
        type: "animal_added",
        title: "Nouvel animal ajouté",
        description: `${newAnimal.name} (${newAnimal.identifier}) - ${newAnimal.category}`,
        entityId: newAnimal.id,
        entityType: "animal",
      })
      return newAnimal
    },
    [addActivity],
  )

  const updateAnimal = useCallback(
    (id: string, data: Partial<Animal>) => {
      setAnimals((prev) => prev.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a)))
      const animal = animals.find((a) => a.id === id)
      if (animal) {
        addActivity({
          type: "animal_updated",
          title: "Animal mis à jour",
          description: `${animal.name} (${animal.identifier})`,
          entityId: id,
          entityType: "animal",
        })
      }
    },
    [animals, addActivity],
  )

  const deleteAnimal = useCallback(
    (id: string) => {
      const animal = animals.find((a) => a.id === id)
      setAnimals((prev) => prev.filter((a) => a.id !== id))
      if (animal) {
        addActivity({
          type: "animal_deleted",
          title: "Animal supprimé",
          description: `${animal.name} (${animal.identifier})`,
          entityId: id,
          entityType: "animal",
        })
      }
    },
    [animals, addActivity],
  )

  const getAnimalById = useCallback((id: string) => animals.find((a) => a.id === id), [animals])

  const getAnimalsByCategory = useCallback(
    (category: Animal["category"]) => animals.filter((a) => a.category === category),
    [animals],
  )

  // Health Case functions
  const addHealthCase = useCallback(
    (data: Omit<HealthCase, "id" | "createdAt">): HealthCase => {
      const newCase: HealthCase = {
        ...data,
        id: `health-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      setHealthCases((prev) => [newCase, ...prev])

      // Update animal status to sick
      if (data.animalId) {
        setAnimals((prev) => prev.map((a) => (a.id === data.animalId ? { ...a, status: "sick" as const } : a)))
      }

      addActivity({
        type: "health_case",
        title: "Cas sanitaire signalé",
        description: `${data.animalName} - ${data.issue}`,
        entityId: newCase.id,
        entityType: "health",
      })
      return newCase
    },
    [addActivity],
  )

  const updateHealthCase = useCallback((id: string, data: Partial<HealthCase>) => {
    setHealthCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const resolveHealthCase = useCallback(
    (id: string) => {
      const healthCase = healthCases.find((c) => c.id === id)
      setHealthCases((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "resolved" as const, resolvedDate: new Date().toISOString() } : c,
        ),
      )

      // Update animal status back to healthy
      if (healthCase?.animalId) {
        const otherActiveCases = healthCases.filter(
          (c) => c.animalId === healthCase.animalId && c.id !== id && c.status !== "resolved",
        )
        if (otherActiveCases.length === 0) {
          setAnimals((prev) =>
            prev.map((a) => (a.id === healthCase.animalId ? { ...a, status: "healthy" as const } : a)),
          )
        }
      }
    },
    [healthCases],
  )

  const deleteHealthCase = useCallback((id: string) => {
    setHealthCases((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Gestation functions
  const addGestation = useCallback(
    (data: Omit<Gestation, "id" | "createdAt">): Gestation => {
      const newGestation: Gestation = {
        ...data,
        id: `gest-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      setGestations((prev) => [newGestation, ...prev])

      // Update sow status to pregnant
      if (data.sowId) {
        setAnimals((prev) => prev.map((a) => (a.id === data.sowId ? { ...a, status: "pregnant" as const } : a)))
      }

      addActivity({
        type: "gestation",
        title: "Nouvelle gestation",
        description: `${data.sowName} saillie par ${data.boarName}`,
        entityId: newGestation.id,
        entityType: "gestation",
      })
      return newGestation
    },
    [addActivity],
  )

  const updateGestation = useCallback((id: string, data: Partial<Gestation>) => {
    setGestations((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
  }, [])

  const completeGestation = useCallback(
    (id: string, pigletCount: number) => {
      const gestation = gestations.find((g) => g.id === id)
      setGestations((prev) => prev.map((g) => (g.id === id ? { ...g, status: "completed" as const, pigletCount } : g)))

      // Update sow status to nursing
      if (gestation?.sowId) {
        setAnimals((prev) => prev.map((a) => (a.id === gestation.sowId ? { ...a, status: "nursing" as const } : a)))
      }

      addActivity({
        type: "gestation",
        title: "Mise-bas réussie",
        description: `${gestation?.sowName} - ${pigletCount} porcelets`,
        entityId: id,
        entityType: "gestation",
      })
    },
    [gestations, addActivity],
  )

  const deleteGestation = useCallback((id: string) => {
    setGestations((prev) => prev.filter((g) => g.id !== id))
  }, [])

  // Feeding functions
  const addFeedingRecord = useCallback((data: Omit<FeedingRecord, "id">) => {
    const newRecord: FeedingRecord = {
      ...data,
      id: `feed-${Date.now()}`,
    }
    setFeedingRecords((prev) => [newRecord, ...prev].slice(0, 100))
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const truies = animals.filter((a) => a.category === "truie")
    const verrats = animals.filter((a) => a.category === "verrat")
    const porcelets = animals.filter((a) => a.category === "porcelet")
    const engraissement = animals.filter((a) => a.category === "engraissement")

    const activeHealthCases = healthCases.filter((c) => c.status !== "resolved").length
    const activeGestations = gestations.filter((g) => g.status === "active").length

    // Calculate upcoming births (within 14 days)
    const today = new Date()
    const upcomingBirths = gestations.filter((g) => {
      if (g.status !== "active") return false
      const dueDate = new Date(g.dueDate)
      const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil >= 0 && daysUntil <= 14
    }).length

    return {
      totalAnimals: animals.length,
      truies: truies.length,
      verrats: verrats.length,
      porcelets: porcelets.length,
      engraissement: engraissement.length,
      healthyCount: animals.filter((a) => a.status === "healthy").length,
      sickCount: animals.filter((a) => a.status === "sick").length,
      pregnantCount: animals.filter((a) => a.status === "pregnant").length,
      activeHealthCases,
      activeGestations,
      upcomingBirths,
    }
  }, [animals, healthCases, gestations])

  // Generate alerts based on data
  const alerts = useMemo(() => {
    const alertsList: AppDataContextType["alerts"] = []

    // Upcoming births alert
    const today = new Date()
    gestations
      .filter((g) => g.status === "active")
      .forEach((g) => {
        const dueDate = new Date(g.dueDate)
        const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 7 && daysUntil >= 0) {
          alertsList.push({
            id: `alert-birth-${g.id}`,
            type: daysUntil <= 3 ? "danger" : "warning",
            title: "Mise-bas imminente",
            message: `${g.sowName} - terme prévu dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`,
            date: g.dueDate,
            actionLabel: "Voir gestation",
            actionUrl: "/dashboard/reproduction",
          })
        }
      })

    // Active health cases alert
    healthCases
      .filter((c) => c.status !== "resolved" && c.priority === "Haute")
      .forEach((c) => {
        alertsList.push({
          id: `alert-health-${c.id}`,
          type: "danger",
          title: "Cas sanitaire urgent",
          message: `${c.animalName} - ${c.issue}`,
          date: c.date,
          actionLabel: "Voir le cas",
          actionUrl: "/dashboard/health",
        })
      })

    // Low weight piglets warning (example)
    animals
      .filter((a) => a.category === "porcelet" && a.weight < 8)
      .forEach((a) => {
        alertsList.push({
          id: `alert-weight-${a.id}`,
          type: "warning",
          title: "Poids insuffisant",
          message: `${a.name} (${a.identifier}) - ${a.weight}kg seulement`,
          date: new Date().toISOString(),
          actionLabel: "Voir l'animal",
          actionUrl: `/dashboard/livestock/${a.id}`,
        })
      })

    return alertsList.slice(0, 10) // Max 10 alerts
  }, [gestations, healthCases, animals])

  const value: AppDataContextType = {
    animals,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    getAnimalById,
    getAnimalsByCategory,
    healthCases,
    addHealthCase,
    updateHealthCase,
    resolveHealthCase,
    deleteHealthCase,
    gestations,
    addGestation,
    updateGestation,
    completeGestation,
    deleteGestation,
    activities,
    feedingRecords,
    addFeedingRecord,
    stats,
    alerts,
    isLoading,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider")
  }
  return context
}
