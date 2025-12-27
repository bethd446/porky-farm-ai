import { supabase } from './supabase/client'

export interface FeedStock {
  id: string
  user_id: string
  feed_type: string
  quantity_kg: number
  unit_price: number | null
  supplier: string | null
  purchase_date: string | null
  expiry_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FeedStockInsert {
  feed_type: string
  quantity_kg: number
  unit_price?: number | null
  supplier?: string | null
  purchase_date?: string | null
  expiry_date?: string | null
  notes?: string | null
}

export interface FeedStockUpdate {
  feed_type?: string
  quantity_kg?: number
  unit_price?: number | null
  supplier?: string | null
  purchase_date?: string | null
  expiry_date?: string | null
  notes?: string | null
}

export interface FeedingService {
  getStock: () => Promise<{ data: FeedStock[] | null; error: Error | null }>
  addStock: (stock: FeedStockInsert) => Promise<{ data: FeedStock | null; error: Error | null }>
  updateStock: (id: string, updates: FeedStockUpdate) => Promise<{ data: FeedStock | null; error: Error | null }>
  deleteStock: (id: string) => Promise<{ error: Error | null }>
  calculateRation: (animalWeight: number, category: string) => Promise<{ dailyRation: number; weeklyRation: number }>
}

export const feedingService: FeedingService = {
  getStock: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('feed_stock')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Si la table n'existe pas, retourner une liste vide plutôt qu'une erreur
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Table feed_stock non trouvée, retour d\'une liste vide')
          return { data: [], error: null }
        }
        return { data: null, error: error as Error }
      }
      return { data: data as FeedStock[], error: null }
    } catch (err) {
      console.error('Error in feedingService.getStock:', err)
      return { data: [], error: null } // Retourner liste vide plutôt qu'erreur
    }
  },

  addStock: async (stock: FeedStockInsert) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('feed_stock')
        .insert({ ...stock, user_id: user.id })
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as FeedStock, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  updateStock: async (id: string, updates: FeedStockUpdate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('feed_stock')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as FeedStock, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  deleteStock: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié') }

      const { error } = await supabase.from('feed_stock').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },

  calculateRation: async (animalWeight: number, category: string) => {
    // Calcul simplifié basé sur le poids et la catégorie
    // Rations approximatives en kg/jour
    const rationsPerKg: Record<string, number> = {
      sow: 0.03, // 3% du poids pour truie
      boar: 0.025, // 2.5% pour verrat
      piglet: 0.05, // 5% pour porcelet
      fattening: 0.04, // 4% pour porc d'engraissement
    }

    const dailyRation = animalWeight * (rationsPerKg[category] || 0.035)
    const weeklyRation = dailyRation * 7

    return { dailyRation: Math.round(dailyRation * 100) / 100, weeklyRation: Math.round(weeklyRation * 100) / 100 }
  },
}
