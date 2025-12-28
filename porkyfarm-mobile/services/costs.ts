/**
 * Service pour les transactions financières (Coûts & Finances)
 * Utilise la table Supabase `transactions`
 * 
 * Colonnes : type ('income','expense'),
 *            category ('sale','feed','veterinary','equipment','labor','other'),
 *            amount, description, transaction_date
 */

import { supabase } from './supabase/client'

export type CostType = 'expense' | 'income'
// Catégories alignées sur le schéma Supabase réel
export type CostCategory = 'sale' | 'feed' | 'veterinary' | 'equipment' | 'labor' | 'other'

export interface CostEntry {
  id: string
  user_id: string
  type: CostType
  category: CostCategory
  amount: number
  description: string | null
  transaction_date: string
  pig_id?: string | null
  notes?: string | null
  created_at: string
}

export interface CostEntryInsert {
  type: CostType
  category: CostCategory
  amount: number
  description?: string | null
  transaction_date: string
  pig_id?: string | null
  notes?: string | null
}

export interface CostEntryUpdate {
  type?: CostType
  category?: CostCategory
  amount?: number
  description?: string | null
  transaction_date?: string
  pig_id?: string | null
  notes?: string | null
}

export interface CostSummary {
  totalExpenses: number
  totalIncome: number
  balance: number
}

export interface CostsService {
  getAll: () => Promise<{ data: CostEntry[] | null; error: Error | null }>
  getByPeriod: (
    startDate: string,
    endDate: string
  ) => Promise<{ data: CostEntry[] | null; error: Error | null }>
  create: (
    entry: CostEntryInsert
  ) => Promise<{ data: CostEntry | null; error: Error | null }>
  update: (
    id: string,
    updates: CostEntryUpdate
  ) => Promise<{ data: CostEntry | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
  getSummary: (
    period?: 'week' | 'month' | 'year'
  ) => Promise<{ data: CostSummary | null; error: Error | null }>
}

export const costsService: CostsService = {
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Costs] getAll error:', error)
        return { data: null, error: error as Error }
      }

      return { data: data as CostEntry[], error: null }
    } catch (err) {
      console.error('[Costs] getAll exception:', err)
      return { data: null, error: err as Error }
    }
  },

  getByPeriod: async (startDate: string, endDate: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false })

      if (error) {
        console.error('[Costs] getByPeriod error:', error)
        return { data: null, error: error as Error }
      }

      return { data: data as CostEntry[], error: null }
    } catch (err) {
      console.error('[Costs] getByPeriod exception:', err)
      return { data: null, error: err as Error }
    }
  },

  create: async (entry: CostEntryInsert) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...entry,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('[Costs] create error:', error)
        return { data: null, error: error as Error }
      }

      return { data: data as CostEntry, error: null }
    } catch (err) {
      console.error('[Costs] create exception:', err)
      return { data: null, error: err as Error }
    }
  },

  update: async (id: string, updates: CostEntryUpdate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('[Costs] update error:', error)
        return { data: null, error: error as Error }
      }

      return { data: data as CostEntry, error: null }
    } catch (err) {
      console.error('[Costs] update exception:', err)
      return { data: null, error: err as Error }
    }
  },

  delete: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié') }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('[Costs] delete error:', error)
        return { error: error as Error }
      }

      return { error: null }
    } catch (err) {
      console.error('[Costs] delete exception:', err)
      return { error: err as Error }
    }
  },

  getSummary: async (period: 'week' | 'month' | 'year' = 'month') => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

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
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])

      if (error) {
        console.error('[Costs] getSummary error:', error)
        return { data: null, error: error as Error }
      }

      const totalExpenses =
        data?.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0

      const totalIncome =
        data?.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0

      return {
        data: {
          totalExpenses,
          totalIncome,
          balance: totalIncome - totalExpenses,
        },
        error: null,
      }
    } catch (err) {
      console.error('[Costs] getSummary exception:', err)
      return { data: null, error: err as Error }
    }
  },
}
