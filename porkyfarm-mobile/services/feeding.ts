/**
 * Service Feeding - ADAPTÉ POUR FARM_ID (V2.0)
 * =============================================
 * Gestion du stock alimentaire lié à une ferme
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { logger } from '../lib/logger'
import { getNowISO, toISODateString } from '../lib/dateUtils'
import { FEED_RATIOS } from '../lib/constants/config'
import { getCurrentFarmId } from '../lib/farmHelpers'

export type FeedCategory = 'sow' | 'boar' | 'piglet' | 'fattening'

// Interface alignée avec la table feed_stock (V2.0)
export interface FeedStock {
  id: string
  farm_id: string
  feed_type: string
  quantity_kg: number
  unit_price: number | null
  supplier: string | null
  purchase_date: string | null
  expiry_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Compatibilité
  user_id?: string
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
  getStock: (farmId?: string) => Promise<{ data: FeedStock[] | null; error: Error | null }>
  getStockById: (id: string) => Promise<{ data: FeedStock | null; error: Error | null }>
  getStockByType: (feedType: string, farmId?: string) => Promise<{ data: FeedStock[] | null; error: Error | null }>
  addStock: (stock: FeedStockInsert, farmId?: string) => Promise<{ data: FeedStock | null; error: Error | null }>
  updateStock: (id: string, updates: FeedStockUpdate) => Promise<{ data: FeedStock | null; error: Error | null }>
  deleteStock: (id: string) => Promise<{ error: Error | null }>
  adjustQuantity: (id: string, quantityDelta: number) => Promise<{ data: FeedStock | null; error: Error | null }>
  calculateRation: (animalWeight: number, category: FeedCategory) => Promise<{ dailyRation: number; weeklyRation: number }>
  getStats: (farmId?: string) => Promise<{ data: { totalStock: number; totalValue: number; byType: Record<string, number> }; error: Error | null }>
}

export const feedingService: FeedingService = {
  /**
   * Récupérer tout le stock alimentaire
   */
  getStock: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<FeedStock[]>(
        async () =>
          await supabase
            .from('feed_stock')
            .select('*')
            .eq('farm_id', targetFarmId)
            .order('feed_type', { ascending: true })
            .order('created_at', { ascending: false }),
        'feed_stock',
        true
      )
    } catch (err) {
      logger.error('[feeding.getStock] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer un stock par ID
   */
  getStockById: async (id: string) => {
    try {
      return safeSupabaseQuery<FeedStock>(
        async () =>
          await supabase
            .from('feed_stock')
            .select('*')
            .eq('id', id)
            .single(),
        'feed_stock',
        false
      )
    } catch (err) {
      logger.error('[feeding.getStockById] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer le stock par type d'aliment
   */
  getStockByType: async (feedType: string, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<FeedStock[]>(
        async () =>
          await supabase
            .from('feed_stock')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('feed_type', feedType)
            .order('created_at', { ascending: false }),
        'feed_stock',
        true
      )
    } catch (err) {
      logger.error('[feeding.getStockByType] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Ajouter du stock
   */
  addStock: async (stock: FeedStockInsert, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<FeedStock>(
        async () =>
          await supabase
            .from('feed_stock')
            .insert({
              ...stock,
              farm_id: targetFarmId,
              purchase_date: stock.purchase_date || toISODateString(new Date()),
            })
            .select()
            .single(),
        'feed_stock',
        false
      )
    } catch (err) {
      logger.error('[feeding.addStock] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Mettre à jour le stock
   */
  updateStock: async (id: string, updates: FeedStockUpdate) => {
    try {
      return safeSupabaseQuery<FeedStock>(
        async () =>
          await supabase
            .from('feed_stock')
            .update({ ...updates, updated_at: getNowISO() })
            .eq('id', id)
            .select()
            .single(),
        'feed_stock',
        false
      )
    } catch (err) {
      logger.error('[feeding.updateStock] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer un stock
   */
  deleteStock: async (id: string) => {
    try {
      const { error } = await supabase
        .from('feed_stock')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[feeding.deleteStock] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Ajuster la quantité (addition/soustraction)
   */
  adjustQuantity: async (id: string, quantityDelta: number) => {
    try {
      // Récupérer le stock actuel
      const { data: current, error: fetchError } = await supabase
        .from('feed_stock')
        .select('quantity_kg')
        .eq('id', id)
        .single()

      if (fetchError) {
        return { data: null, error: new Error(fetchError.message) }
      }

      const newQuantity = Math.max(0, (current?.quantity_kg || 0) + quantityDelta)

      return safeSupabaseQuery<FeedStock>(
        async () =>
          await supabase
            .from('feed_stock')
            .update({
              quantity_kg: newQuantity,
              updated_at: getNowISO(),
            })
            .eq('id', id)
            .select()
            .single(),
        'feed_stock',
        false
      )
    } catch (err) {
      logger.error('[feeding.adjustQuantity] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Calculer les rations alimentaires
   */
  calculateRation: async (animalWeight: number, category: FeedCategory) => {
    // Calcul simplifié basé sur le poids et la catégorie
    const DEFAULT_RATIO = 0.035 // 3.5% par défaut si catégorie inconnue
    const DAYS_PER_WEEK = 7

    const dailyRation = animalWeight * (FEED_RATIOS[category] ?? DEFAULT_RATIO)
    const weeklyRation = dailyRation * DAYS_PER_WEEK

    return {
      dailyRation: Math.round(dailyRation * 100) / 100,
      weeklyRation: Math.round(weeklyRation * 100) / 100,
    }
  },

  /**
   * Obtenir les statistiques du stock
   */
  getStats: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return {
          data: { totalStock: 0, totalValue: 0, byType: {} },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      const { data, error } = await supabase
        .from('feed_stock')
        .select('feed_type, quantity_kg, unit_price')
        .eq('farm_id', targetFarmId)

      if (error) {
        return {
          data: { totalStock: 0, totalValue: 0, byType: {} },
          error: new Error(error.message),
        }
      }

      const entries = data || []
      const totalStock = entries.reduce((sum, s) => sum + Number(s.quantity_kg || 0), 0)
      const totalValue = entries.reduce((sum, s) => {
        const qty = Number(s.quantity_kg || 0)
        const price = Number(s.unit_price || 0)
        return sum + (qty * price)
      }, 0)

      const byType: Record<string, number> = {}
      entries.forEach((s) => {
        byType[s.feed_type] = (byType[s.feed_type] || 0) + Number(s.quantity_kg || 0)
      })

      return {
        data: {
          totalStock: Math.round(totalStock * 100) / 100,
          totalValue: Math.round(totalValue),
          byType,
        },
        error: null,
      }
    } catch (err) {
      logger.error('[feeding.getStats] Error:', err)
      return {
        data: { totalStock: 0, totalValue: 0, byType: {} },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },
}

export default feedingService
