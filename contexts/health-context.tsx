"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"

export interface HealthCase {
  id: string
  user_id?: string
  pig_id?: string
  type: "disease" | "treatment" | "vaccination" | "checkup" | "injury"
  title: string
  description?: string
  diagnosis?: string
  treatment?: string
  medication?: string
  dosage?: string
  start_date: string
  end_date?: string
  veterinarian?: string
  cost?: number
  status: "ongoing" | "resolved" | "chronic" | "scheduled"
  severity?: "low" | "medium" | "high" | "critical"
  image_url?: string
  notes?: string
  created_at?: string
  // Display fields
  animal?: string
  issue?: string
  statusColor?: string
  priority?: string
  priorityColor?: string
  date?: string
}

interface HealthContextType {
  cases: HealthCase[]
  loading: boolean
  addCase: (caseData: Partial<HealthCase>) => Promise<HealthCase | null>
  updateCase: (id: string, data: Partial<HealthCase>) => Promise<boolean>
  deleteCase: (id: string) => Promise<boolean>
  refreshCases: () => Promise<void>
}

const HealthContext = createContext<HealthContextType | undefined>(undefined)

// Demo data
const demoCases: HealthCase[] = [
  {
    id: "demo-h1",
    type: "disease",
    title: "Fièvre et perte d'appétit",
    status: "ongoing",
    severity: "high",
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    treatment: "Antibiotiques - Jour 3/7",
    image_url: "/sick-pig-symptoms-veterinary.jpg",
    animal: "Truie #45",
    issue: "Fièvre et perte d'appétit",
    statusColor: "bg-amber-500",
    priority: "Haute",
    priorityColor: "bg-red-500",
    date: "Il y a 2 jours",
  },
  {
    id: "demo-h2",
    type: "disease",
    title: "Diarrhée",
    status: "ongoing",
    severity: "medium",
    start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    treatment: "Réhydratation + régime",
    image_url: "/piglet-health-check.jpg",
    animal: "Porcelet #A12-3",
    issue: "Diarrhée",
    statusColor: "bg-blue-500",
    priority: "Moyenne",
    priorityColor: "bg-amber-500",
    date: "Hier",
  },
  {
    id: "demo-h3",
    type: "injury",
    title: "Boiterie patte arrière",
    status: "ongoing",
    severity: "low",
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    treatment: "Repos + anti-inflammatoire",
    animal: "Truie #28",
    issue: "Boiterie patte arrière",
    statusColor: "bg-purple-500",
    priority: "Basse",
    priorityColor: "bg-green-500",
    date: "Il y a 3 jours",
  },
]

function computeDisplayFields(record: any): HealthCase {
  const statusColorMap: Record<string, string> = {
    ongoing: "bg-amber-500",
    resolved: "bg-green-500",
    chronic: "bg-purple-500",
    scheduled: "bg-blue-500",
  }

  const severityMap: Record<string, { priority: string; color: string }> = {
    critical: { priority: "Critique", color: "bg-red-700" },
    high: { priority: "Haute", color: "bg-red-500" },
    medium: { priority: "Moyenne", color: "bg-amber-500" },
    low: { priority: "Basse", color: "bg-green-500" },
  }

  const severityInfo = severityMap[record.severity || "medium"] || severityMap.medium

  // Calculate relative date
  const startDate = new Date(record.start_date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  let dateStr = "Aujourd'hui"
  if (diffDays === 1) dateStr = "Hier"
  else if (diffDays > 1) dateStr = `Il y a ${diffDays} jours`

  return {
    ...record,
    animal: record.animal || record.title,
    issue: record.description || record.title,
    statusColor: statusColorMap[record.status] || "bg-gray-500",
    priority: severityInfo.priority,
    priorityColor: severityInfo.color,
    date: dateStr,
  }
}

export function HealthProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<HealthCase[]>(demoCases)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          setUserId(userData.user.id)

          const { data: healthData, error } = await supabase
            .from("health_records")
            .select("*")
            .eq("user_id", userData.user.id)
            .order("created_at", { ascending: false })

          if (!error && healthData && healthData.length > 0) {
            setCases(healthData.map(computeDisplayFields))
          }
        }
      } catch {
        // Use demo data on error
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const addCase = useCallback(
    async (caseData: Partial<HealthCase>): Promise<HealthCase | null> => {
      try {
        const newCase = computeDisplayFields({
          id: `local-${Date.now()}`,
          type: caseData.type || "disease",
          title: caseData.title || caseData.animal || "Nouveau cas",
          description: caseData.issue || caseData.description,
          status: "ongoing",
          severity: caseData.severity || "medium",
          start_date: new Date().toISOString(),
          treatment: caseData.treatment,
          image_url: caseData.image_url,
          animal: caseData.animal,
          ...caseData,
        })

        if (userId) {
          const { data, error } = await supabase
            .from("health_records")
            .insert({
              user_id: userId,
              type: newCase.type,
              title: newCase.title,
              description: newCase.issue,
              status: "ongoing",
              severity: newCase.severity,
              start_date: new Date().toISOString(),
              treatment: newCase.treatment,
              image_url: newCase.image_url,
            })
            .select()
            .single()

          if (!error && data) {
            const savedCase = computeDisplayFields(data)
            setCases((prev) => [savedCase, ...prev])
            return savedCase
          }
        }

        setCases((prev) => [newCase, ...prev])
        return newCase
      } catch {
        return null
      }
    },
    [userId],
  )

  const updateCase = useCallback(async (id: string, data: Partial<HealthCase>): Promise<boolean> => {
    try {
      setCases((prev) => prev.map((c) => (c.id === id ? computeDisplayFields({ ...c, ...data }) : c)))
      return true
    } catch {
      return false
    }
  }, [])

  const deleteCase = useCallback(async (id: string): Promise<boolean> => {
    try {
      setCases((prev) => prev.filter((c) => c.id !== id))
      return true
    } catch {
      return false
    }
  }, [])

  const refreshCases = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (!error && data && data.length > 0) {
        setCases(data.map(computeDisplayFields))
      }
    } catch {
      // Keep current data
    } finally {
      setLoading(false)
    }
  }, [userId])

  return (
    <HealthContext.Provider value={{ cases, loading, addCase, updateCase, deleteCase, refreshCases }}>
      {children}
    </HealthContext.Provider>
  )
}

export function useHealth() {
  const context = useContext(HealthContext)
  if (!context) {
    throw new Error("useHealth must be used within a HealthProvider")
  }
  return context
}
