/**
 * Service Costs - ADAPTÉ POUR FARM_ID (V2.0)
 * ==========================================
 * Gestion des coûts et finances liés à une ferme
 * Table: costs (anciennement transactions)
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { logger } from '../lib/logger'
import { toISODateString } from '../lib/dateUtils'
import { getCurrentFarmId } from '../lib/farmHelpers'

export type CostType = 'expense' | 'income'
// Schéma V2.0 - valeurs françaises uniquement
export type CostCategory = 'alimentation' | 'veterinaire' | 'equipement' | 'main_oeuvre' | 'transport' | 'vente' | 'autre'

// Interface alignée avec la table costs (V2.0)
export interface CostEntry {
  id: string
  farm_id: string
  animal_id?: string | null
  type: CostType
  category: CostCategory
  amount: number
  description?: string | null
  cost_date: string
  transaction_date?: string // Compatibilité
  supplier?: string | null
  invoice_number?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
  // Jointures
  animal?: { id: string; name: string; identifier: string } | null
}

export interface CostEntryInsert {
  animal_id?: string | null
  type: CostType
  category: CostCategory
  amount: number
  description?: string | null
  cost_date?: string
  transaction_date?: string // Compatibilité
  supplier?: string | null
  invoice_number?: string | null
  notes?: string | null
}

export interface CostEntryUpdate {
  animal_id?: string | null
  type?: CostType
  category?: CostCategory
  amount?: number
  description?: string | null
  cost_date?: string
  transaction_date?: string
  supplier?: string | null
  invoice_number?: string | null
  notes?: string | null
}

export interface CostSummary {
  totalExpenses: number
  totalIncome: number
  balance: number
  byCategory?: Record<string, number>
}

export interface CostsService {
  getAll: (farmId?: string, limit?: number) => Promise<{ data: CostEntry[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: CostEntry | null; error: Error | null }>
  getByCategory: (category: CostCategory, farmId?: string) => Promise<{ data: CostEntry[] | null; error: Error | null }>
  getByPeriod: (startDate: string, endDate: string, farmId?: string) => Promise<{ data: CostEntry[] | null; error: Error | null }>
  create: (entry: CostEntryInsert, farmId?: string) => Promise<{ data: CostEntry | null; error: Error | null }>
  update: (id: string, updates: CostEntryUpdate) => Promise<{ data: CostEntry | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
  getSummary: (period?: 'week' | 'month' | 'year', farmId?: string) => Promise<{ data: CostSummary | null; error: Error | null }>
  getStats: (farmId?: string) => Promise<{ data: { total: number; byCategory: Record<string, number>; monthlyAverage: number }; error: Error | null }>
}

export const costsService: CostsService = {
  /**
   * Récupérer toutes les transactions
   */
  getAll: async (farmId?: string, limit = 50) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<CostEntry[]>(
        async () =>
          await supabase
            .from('costs')
            .select('*, animal:pigs(id, name, identifier)')
            .eq('farm_id', targetFarmId)
            .order('cost_date', { ascending: false })
            .limit(limit),
        'costs',
        true
      )
    } catch (err) {
      logger.error('[costs.getAll] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer une transaction par ID
   */
  getById: async (id: string) => {
    try {
      return safeSupabaseQuery<CostEntry>(
        async () =>
          await supabase
            .from('costs')
            .select('*, animal:pigs(id, name, identifier)')
            .eq('id', id)
            .single(),
        'costs',
        false
      )
    } catch (err) {
      logger.error('[costs.getById] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les transactions par catégorie
   */
  getByCategory: async (category: CostCategory, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<CostEntry[]>(
        async () =>
          await supabase
            .from('costs')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('category', category)
            .order('cost_date', { ascending: false }),
        'costs',
        true
      )
    } catch (err) {
      logger.error('[costs.getByCategory] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les transactions par période
   */
  getByPeriod: async (startDate: string, endDate: string, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<CostEntry[]>(
        async () =>
          await supabase
            .from('costs')
            .select('*')
            .eq('farm_id', targetFarmId)
            .gte('cost_date', startDate)
            .lte('cost_date', endDate)
            .order('cost_date', { ascending: false }),
        'costs',
        true
      )
    } catch (err) {
      logger.error('[costs.getByPeriod] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Créer une nouvelle transaction
   */
  create: async (entry: CostEntryInsert, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      // Normaliser les données (compatibilité)
      const normalizedEntry = {
        ...entry,
        farm_id: targetFarmId,
        cost_date: entry.cost_date || entry.transaction_date || toISODateString(new Date()),
      }

      // Supprimer transaction_date s'il existe
      delete (normalizedEntry as Record<string, unknown>).transaction_date

      return safeSupabaseQuery<CostEntry>(
        async () =>
          await supabase
            .from('costs')
            .insert(normalizedEntry)
            .select()
            .single(),
        'costs',
        false
      )
    } catch (err) {
      logger.error('[costs.create] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Mettre à jour une transaction
   */
  update: async (id: string, updates: CostEntryUpdate) => {
    try {
      // Normaliser les données
      const normalizedUpdates: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Si transaction_date fourni, mapper vers cost_date
      if (updates.transaction_date && !updates.cost_date) {
        normalizedUpdates.cost_date = updates.transaction_date
        delete normalizedUpdates.transaction_date
      }

      return safeSupabaseQuery<CostEntry>(
        async () =>
          await supabase
            .from('costs')
            .update(normalizedUpdates)
            .eq('id', id)
            .select()
            .single(),
        'costs',
        false
      )
    } catch (err) {
      logger.error('[costs.update] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer une transaction
   */
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('costs')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[costs.delete] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Obtenir le résumé financier pour une période
   */
  getSummary: async (period: 'week' | 'month' | 'year' = 'month', farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      // Calculer les dates
      const endDate = new Date()
      const startDate = new Date()
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const { data, error } = await supabase
        .from('costs')
        .select('type, amount, category')
        .eq('farm_id', targetFarmId)
        .gte('cost_date', toISODateString(startDate))
        .lte('cost_date', toISODateString(endDate))

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      const entries = data || []
      const totalExpenses = entries
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

      const totalIncome = entries
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

      const byCategory: Record<string, number> = {}
      entries.forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount || 0)
      })

      return {
        data: {
          totalExpenses,
          totalIncome,
          balance: totalIncome - totalExpenses,
          byCategory,
        },
        error: null,
      }
    } catch (err) {
      logger.error('[costs.getSummary] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Obtenir les statistiques financières
   */
  getStats: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return {
          data: { total: 0, byCategory: {}, monthlyAverage: 0 },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      // Récupérer les dépenses des 12 derniers mois
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 12)

      const { data, error } = await supabase
        .from('costs')
        .select('amount, category, cost_date')
        .eq('farm_id', targetFarmId)
        .eq('type', 'expense')
        .gte('cost_date', toISODateString(startDate))

      if (error) {
        return {
          data: { total: 0, byCategory: {}, monthlyAverage: 0 },
          error: new Error(error.message),
        }
      }

      const entries = data || []
      const total = entries.reduce((sum, c) => sum + Number(c.amount || 0), 0)

      const byCategory: Record<string, number> = {}
      entries.forEach((c) => {
        byCategory[c.category] = (byCategory[c.category] || 0) + Number(c.amount || 0)
      })

      return {
        data: {
          total: Math.round(total),
          byCategory,
          monthlyAverage: Math.round(total / 12),
        },
        error: null,
      }
    } catch (err) {
      logger.error('[costs.getStats] Error:', err)
      return {
        data: { total: 0, byCategory: {}, monthlyAverage: 0 },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },
}

export default costsService
