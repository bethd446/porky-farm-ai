"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export interface Gestation {
  id: string
  sow: string
  boar: string
  breedingDate: string
  dueDate: string
  day: number
  totalDays: number
  status: string
  statusColor: string
  image: string
  notes: string
}

const DEFAULT_GESTATIONS: Gestation[] = [
  {
    id: "1",
    sow: "Truie #32",
    boar: "Verrat #8",
    breedingDate: "25 Août 2025",
    dueDate: "18 Déc 2025",
    day: 104,
    totalDays: 114,
    status: "Proche terme",
    statusColor: "bg-red-500",
    image: "/pregnant-sow.jpg",
    notes: "Échographie OK - 12 fœtus détectés",
  },
  {
    id: "2",
    sow: "Truie #18",
    boar: "Verrat #5",
    breedingDate: "15 Sept 2025",
    dueDate: "7 Jan 2026",
    day: 82,
    totalDays: 114,
    status: "En cours",
    statusColor: "bg-green-500",
    image: "/sow-pig.jpg",
    notes: "Gestation confirmée",
  },
]

export function useGestations() {
  const { user } = useAuth()
  const [gestations, setGestations] = useState<Gestation[]>(DEFAULT_GESTATIONS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateGestationStatus = (breedingDate: Date): { day: number; status: string; statusColor: string } => {
    const today = new Date()
    const daysPassed = Math.floor((today.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24))
    const day = Math.max(0, Math.min(daysPassed, 114))

    let status: string
    let statusColor: string

    if (day < 30) {
      status = "Début gestation"
      statusColor = "bg-blue-500"
    } else if (day < 100) {
      status = "En cours"
      statusColor = "bg-green-500"
    } else {
      status = "Proche terme"
      statusColor = "bg-red-500"
    }

    return { day, status, statusColor }
  }

  const calculateDueDate = (breedingDate: Date): Date => {
    const dueDate = new Date(breedingDate)
    dueDate.setDate(dueDate.getDate() + 114)
    return dueDate
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const loadGestations = useCallback(async () => {
    if (!user) {
      setGestations(DEFAULT_GESTATIONS)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("gestations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        const mapped = data.map((g: any) => {
          const breedingDate = new Date(g.breeding_date)
          const { day, status, statusColor } = calculateGestationStatus(breedingDate)
          const dueDate = calculateDueDate(breedingDate)

          return {
            id: g.id,
            sow: g.sow_name || g.sow,
            boar: g.boar_name || g.boar,
            breedingDate: formatDate(breedingDate),
            dueDate: formatDate(dueDate),
            day,
            totalDays: 114,
            status,
            statusColor,
            image: g.image_url || "/sow-pig.jpg",
            notes: g.notes || "",
          }
        })
        setGestations(mapped)
      } else {
        setGestations(DEFAULT_GESTATIONS)
      }
    } catch (err) {
      console.error("Error loading gestations:", err)
      setError("Erreur lors du chargement des gestations")
      setGestations(DEFAULT_GESTATIONS)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadGestations()
  }, [loadGestations])

  const addGestation = useCallback(
    async (data: { sow: string; boar: string; breedingDate: string; notes?: string }) => {
      const breedingDate = new Date(data.breedingDate)
      const { day, status, statusColor } = calculateGestationStatus(breedingDate)
      const dueDate = calculateDueDate(breedingDate)

      const newGestation: Gestation = {
        id: Date.now().toString(),
        sow: data.sow,
        boar: data.boar,
        breedingDate: formatDate(breedingDate),
        dueDate: formatDate(dueDate),
        day,
        totalDays: 114,
        status,
        statusColor,
        image: "/sow-pig.jpg",
        notes: data.notes || "Nouvelle gestation enregistrée",
      }

      if (user) {
        try {
          const { data: inserted, error } = await supabase
            .from("gestations")
            .insert({
              user_id: user.id,
              sow_name: data.sow,
              boar_name: data.boar,
              breeding_date: data.breedingDate,
              expected_farrowing_date: dueDate.toISOString().split("T")[0],
              notes: data.notes,
              status: "confirmed",
            })
            .select()
            .single()

          if (!error && inserted) {
            newGestation.id = inserted.id
          }
        } catch (err) {
          console.error("Error saving gestation:", err)
        }
      }

      setGestations((prev) => [newGestation, ...prev])
      return newGestation
    },
    [user],
  )

  const deleteGestation = useCallback(
    async (id: string) => {
      if (user) {
        try {
          await supabase.from("gestations").delete().eq("id", id).eq("user_id", user.id)
        } catch (err) {
          console.error("Error deleting gestation:", err)
        }
      }
      setGestations((prev) => prev.filter((g) => g.id !== id))
    },
    [user],
  )

  const updateGestation = useCallback(
    async (id: string, updates: Partial<Gestation>) => {
      if (user) {
        try {
          await supabase
            .from("gestations")
            .update({
              sow_name: updates.sow,
              boar_name: updates.boar,
              notes: updates.notes,
            })
            .eq("id", id)
            .eq("user_id", user.id)
        } catch (err) {
          console.error("Error updating gestation:", err)
        }
      }
      setGestations((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
    },
    [user],
  )

  return {
    gestations,
    loading,
    error,
    addGestation,
    deleteGestation,
    updateGestation,
    refresh: loadGestations,
  }
}
