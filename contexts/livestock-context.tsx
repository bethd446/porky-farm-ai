"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"

export interface Animal {
  id: string
  user_id?: string
  identifier: string
  name: string
  category: "sow" | "boar" | "piglet" | "fattening"
  breed: string
  birth_date?: string
  weight?: number
  status: "active" | "sick" | "pregnant" | "nursing" | "sold" | "deceased"
  origin?: string
  acquisition_date?: string
  acquisition_price?: number
  notes?: string
  image_url?: string
  building?: string
  pen?: string
  mother_id?: string
  father_id?: string
  created_at?: string
  updated_at?: string
  // Computed fields for UI compatibility
  type?: string
  age?: string
  statusColor?: string
  healthScore?: number
  nextEvent?: string
  count?: number
  image?: string
}

interface LivestockContextType {
  animals: Animal[]
  loading: boolean
  error: string | null
  addAnimal: (animal: Partial<Animal>) => Promise<Animal | null>
  updateAnimal: (id: string, data: Partial<Animal>) => Promise<boolean>
  deleteAnimal: (id: string) => Promise<boolean>
  getAnimal: (id: string) => Animal | undefined
  refreshAnimals: () => Promise<void>
  stats: {
    total: number
    truies: number
    verrats: number
    porcelets: number
    engraissement: number
  }
}

const LivestockContext = createContext<LivestockContextType | undefined>(undefined)

// Helper to compute display fields from DB fields
function computeDisplayFields(animal: any): Animal {
  const typeMap: Record<string, string> = {
    sow: "Truie",
    boar: "Verrat",
    piglet: "Porcelets",
    fattening: "Engraissement",
  }

  const statusColorMap: Record<string, string> = {
    active: "bg-green-500",
    sick: "bg-red-500",
    pregnant: "bg-pink-500",
    nursing: "bg-purple-500",
    sold: "bg-gray-500",
    deceased: "bg-gray-700",
  }

  // Calculate age from birth_date
  let age = "Non renseigné"
  if (animal.birth_date) {
    const birthDate = new Date(animal.birth_date)
    const ageInMonths = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const ageYears = Math.floor(ageInMonths / 12)
    const ageMonthsRem = ageInMonths % 12
    age = ageYears > 0 ? `${ageYears} an${ageYears > 1 ? "s" : ""} ${ageMonthsRem} mois` : `${ageMonthsRem} mois`
  }

  return {
    ...animal,
    type: typeMap[animal.category] || animal.category,
    age,
    statusColor: statusColorMap[animal.status] || "bg-gray-500",
    healthScore: animal.status === "sick" ? 70 : 95,
    nextEvent: "Pas d'événement prévu",
    image: animal.image_url,
    name: animal.name || animal.identifier,
  }
}

// Demo data for when Supabase is not connected or has no data
const demoAnimals: Animal[] = [
  {
    id: "demo-1",
    identifier: "T-032",
    name: "Truie #32",
    category: "sow",
    breed: "Large White",
    birth_date: "2022-09-15",
    weight: 185,
    status: "pregnant",
    type: "Truie",
    age: "2 ans 3 mois",
    statusColor: "bg-pink-500",
    image: "/white-sow-pig-farm.jpg",
    healthScore: 95,
    nextEvent: "Mise-bas dans 8 jours",
  },
  {
    id: "demo-2",
    identifier: "V-008",
    name: "Verrat #8",
    category: "boar",
    breed: "Duroc",
    birth_date: "2021-11-20",
    weight: 285,
    status: "active",
    type: "Verrat",
    age: "3 ans",
    statusColor: "bg-blue-500",
    image: "/duroc-boar-pig-farm.jpg",
    healthScore: 98,
    nextEvent: "Saillie prévue demain",
  },
  {
    id: "demo-3",
    identifier: "T-045",
    name: "Truie #45",
    category: "sow",
    breed: "Landrace",
    birth_date: "2023-04-10",
    weight: 165,
    status: "sick",
    type: "Truie",
    age: "1 an 8 mois",
    statusColor: "bg-amber-500",
    image: "/landrace-sow-pig-farm.jpg",
    healthScore: 72,
    nextEvent: "Fin traitement dans 3 jours",
  },
  {
    id: "demo-4",
    identifier: "L-A12",
    name: "Lot Porcelets A12",
    category: "piglet",
    breed: "Croisé",
    birth_date: "2024-10-25",
    weight: 12,
    status: "active",
    type: "Porcelets",
    age: "6 semaines",
    statusColor: "bg-green-500",
    image: "/piglets-group-farm-cute.jpg",
    healthScore: 100,
    count: 11,
    nextEvent: "Vaccination dans 2 jours",
  },
  {
    id: "demo-5",
    identifier: "T-028",
    name: "Truie #28",
    category: "sow",
    breed: "Large White",
    birth_date: "2020-12-01",
    weight: 195,
    status: "nursing",
    type: "Truie",
    age: "4 ans",
    statusColor: "bg-purple-500",
    image: "/nursing-sow-with-piglets-farm.jpg",
    healthScore: 90,
    nextEvent: "Sevrage dans 12 jours",
  },
  {
    id: "demo-6",
    identifier: "E-067",
    name: "Porc #67",
    category: "fattening",
    breed: "Croisé",
    birth_date: "2024-07-01",
    weight: 85,
    status: "active",
    type: "Engraissement",
    age: "5 mois",
    statusColor: "bg-emerald-500",
    image: "/fattening-pig-farm-healthy.jpg",
    healthScore: 96,
    nextEvent: "Pesée dans 5 jours",
  },
]

export function LivestockProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>(demoAnimals)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          setUserId(userData.user.id)

          // Fetch animals from Supabase
          const { data: pigsData, error: pigsError } = await supabase
            .from("pigs")
            .select("*")
            .eq("user_id", userData.user.id)
            .order("created_at", { ascending: false })

          if (pigsError) {
            // Table might not exist yet, use demo data
            setAnimals(demoAnimals)
          } else if (pigsData && pigsData.length > 0) {
            setAnimals(pigsData.map(computeDisplayFields))
          } else {
            // No animals yet, keep demo data
            setAnimals(demoAnimals)
          }
        } else {
          setAnimals(demoAnimals)
        }
      } catch (err) {
        // Use demo data on error
        setAnimals(demoAnimals)
      } finally {
        setLoading(false)
      }
    }

    init()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUserId(session.user.id)
        // Refresh animals
        const { data: pigsData } = await supabase
          .from("pigs")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (pigsData && pigsData.length > 0) {
          setAnimals(pigsData.map(computeDisplayFields))
        }
      } else if (event === "SIGNED_OUT") {
        setUserId(null)
        setAnimals(demoAnimals)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const addAnimal = useCallback(
    async (animal: Partial<Animal>): Promise<Animal | null> => {
      try {
        if (!userId) {
          // Not logged in, add to local state only
          const newAnimal = computeDisplayFields({
            id: `local-${Date.now()}`,
            ...animal,
            created_at: new Date().toISOString(),
          })
          setAnimals((prev) => [newAnimal, ...prev])
          return newAnimal
        }

        const { data, error } = await supabase
          .from("pigs")
          .insert({
            user_id: userId,
            identifier: animal.identifier || animal.name || `PIG-${Date.now()}`,
            name: animal.name,
            category: animal.category || "sow",
            breed: animal.breed,
            birth_date: animal.birth_date,
            weight: animal.weight,
            status: animal.status || "active",
            origin: animal.origin,
            acquisition_date: animal.acquisition_date,
            acquisition_price: animal.acquisition_price,
            notes: animal.notes,
            image_url: animal.image_url || animal.image,
            building: animal.building,
            pen: animal.pen,
            mother_id: animal.mother_id,
            father_id: animal.father_id,
          })
          .select()
          .single()

        if (error) {
          // Fallback to local state
          const newAnimal = computeDisplayFields({
            id: `local-${Date.now()}`,
            ...animal,
            created_at: new Date().toISOString(),
          })
          setAnimals((prev) => [newAnimal, ...prev])
          return newAnimal
        }

        const newAnimal = computeDisplayFields(data)
        setAnimals((prev) => [newAnimal, ...prev])
        return newAnimal
      } catch (err) {
        setError("Erreur lors de l'ajout de l'animal")
        return null
      }
    },
    [userId],
  )

  const updateAnimal = useCallback(async (id: string, data: Partial<Animal>): Promise<boolean> => {
    try {
      if (id.startsWith("demo-") || id.startsWith("local-")) {
        // Local update only
        setAnimals((prev) =>
          prev.map((animal) => (animal.id === id ? computeDisplayFields({ ...animal, ...data }) : animal)),
        )
        return true
      }

      const { error } = await supabase
        .from("pigs")
        .update({
          name: data.name,
          identifier: data.identifier,
          category: data.category,
          breed: data.breed,
          birth_date: data.birth_date,
          weight: data.weight,
          status: data.status,
          notes: data.notes,
          image_url: data.image_url || data.image,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        setError("Erreur lors de la mise à jour")
        return false
      }

      setAnimals((prev) =>
        prev.map((animal) => (animal.id === id ? computeDisplayFields({ ...animal, ...data }) : animal)),
      )
      return true
    } catch (err) {
      setError("Erreur lors de la mise à jour")
      return false
    }
  }, [])

  const deleteAnimal = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (id.startsWith("demo-") || id.startsWith("local-")) {
        // Local delete only
        setAnimals((prev) => prev.filter((animal) => animal.id !== id))
        return true
      }

      const { error } = await supabase.from("pigs").delete().eq("id", id)

      if (error) {
        setError("Erreur lors de la suppression")
        return false
      }

      setAnimals((prev) => prev.filter((animal) => animal.id !== id))
      return true
    } catch (err) {
      setError("Erreur lors de la suppression")
      return false
    }
  }, [])

  const getAnimal = useCallback(
    (id: string) => {
      return animals.find((animal) => animal.id === id)
    },
    [animals],
  )

  const refreshAnimals = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    try {
      const { data: pigsData, error } = await supabase
        .from("pigs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (!error && pigsData && pigsData.length > 0) {
        setAnimals(pigsData.map(computeDisplayFields))
      }
    } catch (err) {
      // Keep current data on error
    } finally {
      setLoading(false)
    }
  }, [userId])

  const stats = useMemo(() => {
    const truies = animals.filter((a) => a.category === "sow" || a.type === "Truie").length
    const verrats = animals.filter((a) => a.category === "boar" || a.type === "Verrat").length
    const porcelets = animals
      .filter((a) => a.category === "piglet" || a.type === "Porcelets")
      .reduce((sum, a) => sum + (a.count || 1), 0)
    const engraissement = animals.filter((a) => a.category === "fattening" || a.type === "Engraissement").length

    return {
      total: truies + verrats + porcelets + engraissement,
      truies,
      verrats,
      porcelets,
      engraissement,
    }
  }, [animals])

  const contextValue = useMemo(
    () => ({
      animals,
      loading,
      error,
      addAnimal,
      updateAnimal,
      deleteAnimal,
      getAnimal,
      refreshAnimals,
      stats,
    }),
    [animals, loading, error, addAnimal, updateAnimal, deleteAnimal, getAnimal, refreshAnimals, stats],
  )

  return <LivestockContext.Provider value={contextValue}>{children}</LivestockContext.Provider>
}

export function useLivestock() {
  const context = useContext(LivestockContext)
  if (context === undefined) {
    throw new Error("useLivestock must be used within a LivestockProvider")
  }
  return context
}
