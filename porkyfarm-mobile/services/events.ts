/**
 * Service pour les événements (Santé, Vaccination, Pesée, Naissance, Vente, etc.)
 * Utilise la table Supabase `events`
 * 
 * Colonnes : event_type ('vaccination','weighing','birth','sale','treatment','other'),
 *            title, description, cost, event_date
 */

import { supabase } from './supabase/client'

export type EventType = 'vaccination' | 'weighing' | 'birth' | 'sale' | 'treatment' | 'other'

export interface Event {
  id: string
  user_id: string
  event_type: EventType
  title: string
  description: string | null
  cost: number | null
  event_date: string
  pig_id?: string | null // Optionnel : lien vers pigs si applicable
  created_at: string
  updated_at: string | null
}

export interface EventInsert {
  event_type: EventType
  title: string
  description?: string | null
  cost?: number | null
  event_date: string
  pig_id?: string | null
}

export interface EventUpdate {
  event_type?: EventType
  title?: string
  description?: string | null
  cost?: number | null
  event_date?: string
  pig_id?: string | null
}

export interface EventsService {
  getAll: () => Promise<{ data: Event[] | null; error: Error | null }>
  getByType: (eventType: EventType) => Promise<{ data: Event[] | null; error: Error | null }>
  getByPig: (pigId: string) => Promise<{ data: Event[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Event | null; error: Error | null }>
  create: (event: EventInsert) => Promise<{ data: Event | null; error: Error | null }>
  update: (id: string, updates: EventUpdate) => Promise<{ data: Event | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
}

export const eventsService: EventsService = {
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error as Error }
      return { data: data as Event[], error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  getByType: async (eventType: EventType) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', eventType)
        .order('event_date', { ascending: false })

      if (error) return { data: null, error: error as Error }
      return { data: data as Event[], error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  getByPig: async (pigId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .eq('pig_id', pigId)
        .order('event_date', { ascending: false })

      if (error) return { data: null, error: error as Error }
      return { data: data as Event[], error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  getById: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Event, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  create: async (event: EventInsert) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...event,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Event, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  update: async (id: string, updates: EventUpdate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Event, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  delete: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié') }

      const { error } = await supabase.from('events').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}

