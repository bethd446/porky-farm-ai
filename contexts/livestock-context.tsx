"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export interface Animal {
  id: number
  name: string
  type: string
  breed: string
  age: string
  weight: string
  status: string
  statusColor: string
  image: string | null
  healthScore: number
  nextEvent: string
  count?: number
  tagNumber?: string
  birthDate?: string
  acquisitionDate?: string
  acquisitionPrice?: string
  motherId?: string
  fatherId?: string
  notes?: string
}

interface LivestockContextType {
  animals: Animal[]
  addAnimal: (animal: Omit<Animal, "id">) => void
  updateAnimal: (id: number, data: Partial<Animal>) => void
  deleteAnimal: (id: number) => void
  getAnimal: (id: number) => Animal | undefined
  getStats: () => {
    total: number
    truies: number
    verrats: number
    porcelets: number
    engraissement: number
  }
}

const LivestockContext = createContext<LivestockContextType | undefined>(undefined)

const initialAnimals: Animal[] = [
  {
    id: 1,
    name: "Truie #32",
    type: "Truie",
    breed: "Large White",
    age: "2 ans 3 mois",
    weight: "185 kg",
    status: "Gestante",
    statusColor: "bg-pink-500",
    image: "/white-sow-pig-healthy-farm.jpg",
    healthScore: 95,
    nextEvent: "Mise-bas dans 8 jours",
  },
  {
    id: 2,
    name: "Verrat #8",
    type: "Verrat",
    breed: "Duroc",
    age: "3 ans",
    weight: "285 kg",
    status: "Reproducteur",
    statusColor: "bg-blue-500",
    image: "/duroc-boar-pig-farm.jpg",
    healthScore: 98,
    nextEvent: "Saillie prévue demain",
  },
  {
    id: 3,
    name: "Truie #45",
    type: "Truie",
    breed: "Landrace",
    age: "1 an 8 mois",
    weight: "165 kg",
    status: "Sous traitement",
    statusColor: "bg-amber-500",
    image: "/landrace-sow-pig-farm.jpg",
    healthScore: 72,
    nextEvent: "Fin traitement dans 3 jours",
  },
  {
    id: 4,
    name: "Lot Porcelets A12",
    type: "Porcelets",
    breed: "Croisé",
    age: "6 semaines",
    weight: "12 kg moy.",
    status: "Sevrage",
    statusColor: "bg-green-500",
    image: "/piglets-group-farm-cute.jpg",
    healthScore: 100,
    count: 11,
    nextEvent: "Vaccination dans 2 jours",
  },
  {
    id: 5,
    name: "Truie #28",
    type: "Truie",
    breed: "Large White",
    age: "4 ans",
    weight: "195 kg",
    status: "Allaitante",
    statusColor: "bg-purple-500",
    image: "/nursing-sow-with-piglets-farm.jpg",
    healthScore: 90,
    nextEvent: "Sevrage dans 12 jours",
  },
  {
    id: 6,
    name: "Porc #67",
    type: "Engraissement",
    breed: "Croisé",
    age: "5 mois",
    weight: "85 kg",
    status: "Croissance",
    statusColor: "bg-emerald-500",
    image: "/fattening-pig-farm-healthy.jpg",
    healthScore: 96,
    nextEvent: "Pesée dans 5 jours",
  },
]

export function LivestockProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("porkyfarm_animals")
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return initialAnimals
        }
      }
    }
    return initialAnimals
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("porkyfarm_animals", JSON.stringify(animals))
    }
  }, [animals])

  const addAnimal = useCallback((animal: Omit<Animal, "id">) => {
    setAnimals((prev) => {
      const newId = Math.max(0, ...prev.map((a) => a.id)) + 1
      return [...prev, { ...animal, id: newId }]
    })
  }, [])

  const updateAnimal = useCallback((id: number, data: Partial<Animal>) => {
    setAnimals((prev) => prev.map((animal) => (animal.id === id ? { ...animal, ...data } : animal)))
  }, [])

  const deleteAnimal = useCallback((id: number) => {
    setAnimals((prev) => prev.filter((animal) => animal.id !== id))
  }, [])

  const getAnimal = useCallback(
    (id: number) => {
      return animals.find((animal) => animal.id === id)
    },
    [animals],
  )

  const getStats = useCallback(() => {
    const truies = animals.filter((a) => a.type === "Truie").length
    const verrats = animals.filter((a) => a.type === "Verrat").length
    const porcelets = animals.filter((a) => a.type === "Porcelets").reduce((sum, a) => sum + (a.count || 1), 0)
    const engraissement = animals.filter((a) => a.type === "Engraissement").length

    return {
      total: truies + verrats + porcelets + engraissement,
      truies,
      verrats,
      porcelets,
      engraissement,
    }
  }, [animals])

  return (
    <LivestockContext.Provider value={{ animals, addAnimal, updateAnimal, deleteAnimal, getAnimal, getStats }}>
      {children}
    </LivestockContext.Provider>
  )
}

export function useLivestock() {
  const context = useContext(LivestockContext)
  if (context === undefined) {
    throw new Error("useLivestock must be used within a LivestockProvider")
  }
  return context
}
