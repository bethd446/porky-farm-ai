/**
 * Service Events - ADAPTÉ POUR FARM_ID (V2.0)
 * ============================================
 * Gestion des événements (Santé, Vaccination, Pesée, Naissance, Vente, etc.)
 * Utilise la table Supabase `events`
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { getNowISO, toISODateString } from '../lib/dateUtils'
import { getCurrentFarmId } from '../lib/farmHelpers'
import { logger } from '../lib/logger'

export type EventType = 'vaccination' | 'weighing' | 'birth' | 'sale' | 'treatment' | 'other'

// Interface alignée avec la table events (V2.0)
export interface Event {
  id: string
  farm_id: string
  event_type: EventType
  title: string
  description: string | null
  cost: number | null
  event_date: string
  animal_id?: string | null
  pig_id?: string | null // Compatibilité
  created_at: string
  updated_at: string | null
  // Compatibilité
  user_id?: string
  // Jointures
  animal?: { id: string; name: string; identifier: string } | null
}

export interface EventInsert {
  event_type: EventType
  title: string
  description?: string | null
  cost?: number | null
  event_date: string
  animal_id?: string | null
  pig_id?: string | null // Compatibilité
}

export interface EventUpdate {
  event_type?: EventType
  title?: string
  description?: string | null
  cost?: number | null
  event_date?: string
  animal_id?: string | null
  pig_id?: string | null
}

export interface EventsService {
  getAll: (farmId?: string, limit?: number) => Promise<{ data: Event[] | null; error: Error | null }>
  getByType: (eventType: EventType, farmId?: string) => Promise<{ data: Event[] | null; error: Error | null }>
  getByAnimal: (animalId: string, farmId?: string) => Promise<{ data: Event[] | null; error: Error | null }>
  getByPeriod: (startDate: string, endDate: string, farmId?: string) => Promise<{ data: Event[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Event | null; error: Error | null }>
  create: (event: EventInsert, farmId?: string) => Promise<{ data: Event | null; error: Error | null }>
  update: (id: string, updates: EventUpdate) => Promise<{ data: Event | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
  getStats: (farmId?: string) => Promise<{ data: { total: number; byType: Record<string, number> }; error: Error | null }>
}

export const eventsService: EventsService = {
  /**
   * Récupérer tous les événements
   */
  getAll: async (farmId?: string, limit = 50) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Event[]>(
        async () =>
          await supabase
            .from('events')
            .select('*, animal:pigs(id, name, identifier)')
            .eq('farm_id', targetFarmId)
            .order('event_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit),
        'events',
        true
      )
    } catch (err) {
      logger.error('[events.getAll] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les événements par type
   */
  getByType: async (eventType: EventType, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Event[]>(
        async () =>
          await supabase
            .from('events')
            .select('*, animal:pigs(id, name, identifier)')
            .eq('farm_id', targetFarmId)
            .eq('event_type', eventType)
            .order('event_date', { ascending: false }),
        'events',
        true
      )
    } catch (err) {
      logger.error('[events.getByType] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les événements d'un animal
   */
  getByAnimal: async (animalId: string, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Event[]>(
        async () =>
          await supabase
            .from('events')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('animal_id', animalId)
            .order('event_date', { ascending: false }),
        'events',
        true
      )
    } catch (err) {
      logger.error('[events.getByAnimal] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les événements par période
   */
  getByPeriod: async (startDate: string, endDate: string, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Event[]>(
        async () =>
          await supabase
            .from('events')
            .select('*, animal:pigs(id, name, identifier)')
            .eq('farm_id', targetFarmId)
            .gte('event_date', startDate)
            .lte('event_date', endDate)
            .order('event_date', { ascending: false }),
        'events',
        true
      )
    } catch (err) {
      logger.error('[events.getByPeriod] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer un événement par ID
   */
  getById: async (id: string) => {
    try {
      return safeSupabaseQuery<Event>(
        async () =>
          await supabase
            .from('events')
            .select('*, animal:pigs(id, name, identifier)')
            .eq('id', id)
            .single(),
        'events',
        false
      )
    } catch (err) {
      logger.error('[events.getById] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Créer un événement
   */
  create: async (event: EventInsert, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      // Normaliser les données (compatibilité pig_id → animal_id)
      const normalizedEvent = {
        ...event,
        farm_id: targetFarmId,
        animal_id: event.animal_id || event.pig_id || null,
        event_date: event.event_date || toISODateString(new Date()),
      }

      // Supprimer pig_id s'il existe (on utilise animal_id)
      delete (normalizedEvent as Record<string, unknown>).pig_id

      return safeSupabaseQuery<Event>(
        async () =>
          await supabase
            .from('events')
            .insert(normalizedEvent)
            .select('*, animal:pigs(id, name, identifier)')
            .single(),
        'events',
        false
      )
    } catch (err) {
      logger.error('[events.create] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Mettre à jour un événement
   */
  update: async (id: string, updates: EventUpdate) => {
    try {
      // Normaliser les données
      const normalizedUpdates: Record<string, unknown> = {
        ...updates,
        updated_at: getNowISO(),
      }

      // Si pig_id fourni, mapper vers animal_id
      if (updates.pig_id && !updates.animal_id) {
        normalizedUpdates.animal_id = updates.pig_id
        delete normalizedUpdates.pig_id
      }

      return safeSupabaseQuery<Event>(
        async () =>
          await supabase
            .from('events')
            .update(normalizedUpdates)
            .eq('id', id)
            .select('*, animal:pigs(id, name, identifier)')
            .single(),
        'events',
        false
      )
    } catch (err) {
      logger.error('[events.update] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer un événement
   */
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[events.delete] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Obtenir les statistiques des événements
   */
  getStats: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return {
          data: { total: 0, byType: {} },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      const { data, error } = await supabase
        .from('events')
        .select('event_type')
        .eq('farm_id', targetFarmId)

      if (error) {
        return {
          data: { total: 0, byType: {} },
          error: new Error(error.message),
        }
      }

      const entries = data || []
      const byType: Record<string, number> = {}
      entries.forEach((e) => {
        byType[e.event_type] = (byType[e.event_type] || 0) + 1
      })

      return {
        data: {
          total: entries.length,
          byType,
        },
        error: null,
      }
    } catch (err) {
      logger.error('[events.getStats] Error:', err)
      return {
        data: { total: 0, byType: {} },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },
}

export default eventsService
