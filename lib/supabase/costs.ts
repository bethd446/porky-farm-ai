/**
 * Service Supabase pour les transactions financières (Coûts & Finances)
 * Utilise la table `transactions` existante
 */

import { supabase } from "../client"

export type CostType = "expense" | "income"
export type CostCategory =
  | "pig_purchase"
  | "feed"
  | "vitamins"
  | "medication"
  | "transport"
  | "veterinary"
  | "labor"
  | "misc"
  | "sale"
  | "subsidy"
  | "other"

export interface CostEntry {
  id: string
  user_id: string
  type: CostType
  category: CostCategory
  amount: number
  description?: string | null
  transaction_date: string
  pig_id?: string | null
  notes?: string | null
  created_at: string
}

export interface CostEntryInsert {
  type: CostType
  category: CostCategory
  amount: number
  description?: string
  transaction_date: string
  pig_id?: string
  notes?: string
}

export interface CostEntryUpdate {
  type?: CostType
  category?: CostCategory
  amount?: number
  description?: string
  transaction_date?: string
  pig_id?: string
  notes?: string
}

export interface CostSummary {
  totalExpenses: number
  totalIncome: number
  balance: number
}

/**
 * Récupère toutes les transactions de l'utilisateur
 */
export async function getAllCosts(): Promise<{ data: CostEntry[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error("Non authentifié") }
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Costs] getAllCosts error:", error)
      return { data: null, error: error as Error }
    }

    return { data: data as CostEntry[], error: null }
  } catch (err) {
    console.error("[Costs] getAllCosts exception:", err)
    return { data: null, error: err as Error }
  }
}

/**
 * Récupère les transactions sur une période
 */
export async function getCostsByPeriod(
  startDate: string,
  endDate: string
): Promise<{ data: CostEntry[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error("Non authentifié") }
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .order("transaction_date", { ascending: false })

    if (error) {
      console.error("[Costs] getCostsByPeriod error:", error)
      return { data: null, error: error as Error }
    }

    return { data: data as CostEntry[], error: null }
  } catch (err) {
    console.error("[Costs] getCostsByPeriod exception:", err)
    return { data: null, error: err as Error }
  }
}

/**
 * Crée une nouvelle transaction
 */
export async function createCostEntry(
  entry: CostEntryInsert
): Promise<{ data: CostEntry | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error("Non authentifié") }
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...entry,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[Costs] createCostEntry error:", error)
      return { data: null, error: error as Error }
    }

    return { data: data as CostEntry, error: null }
  } catch (err) {
    console.error("[Costs] createCostEntry exception:", err)
    return { data: null, error: err as Error }
  }
}

/**
 * Met à jour une transaction
 */
export async function updateCostEntry(
  id: string,
  updates: CostEntryUpdate
): Promise<{ data: CostEntry | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error("Non authentifié") }
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[Costs] updateCostEntry error:", error)
      return { data: null, error: error as Error }
    }

    return { data: data as CostEntry, error: null }
  } catch (err) {
    console.error("[Costs] updateCostEntry exception:", err)
    return { data: null, error: err as Error }
  }
}

/**
 * Supprime une transaction
 */
export async function deleteCostEntry(id: string): Promise<{ data: null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error("Non authentifié") }
    }

    const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("[Costs] deleteCostEntry error:", error)
      return { data: null, error: error as Error }
    }

    return { data: null, error: null }
  } catch (err) {
    console.error("[Costs] deleteCostEntry exception:", err)
    return { data: null, error: err as Error }
  }
}

/**
 * Récupère un résumé des coûts sur une période
 */
export async function getCostSummary(
  period: "week" | "month" | "year" = "month"
): Promise<{ data: CostSummary | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error("Non authentifié") }
    }

    // Calculer les dates
    const endDate = new Date()
    const startDate = new Date()
    switch (period) {
      case "week":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "month":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", user.id)
      .gte("transaction_date", startDate.toISOString().split("T")[0])
      .lte("transaction_date", endDate.toISOString().split("T")[0])

    if (error) {
      console.error("[Costs] getCostSummary error:", error)
      return { data: null, error: error as Error }
    }

    const totalExpenses =
      data
        ?.filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0

    const totalIncome =
      data
        ?.filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0

    return {
      data: {
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
      },
      error: null,
    }
  } catch (err) {
    console.error("[Costs] getCostSummary exception:", err)
    return { data: null, error: err as Error }
  }
}

