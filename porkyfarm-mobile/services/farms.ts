/**
 * Service pour la gestion des fermes
 * ===================================
 * Chaque utilisateur peut avoir une ou plusieurs fermes
 * Toutes les données (pigs, health_cases, etc.) sont liées à farm_id
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'

export interface Farm {
  id: string
  user_id: string
  name: string
  address: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface FarmInsert {
  name: string
  address?: string | null
  phone?: string | null
}

export interface FarmUpdate {
  name?: string
  address?: string | null
  phone?: string | null
}

export interface FarmsService {
  /**
   * Récupère toutes les fermes de l'utilisateur connecté
   */
  getAll: () => Promise<{ data: Farm[] | null; error: Error | null }>

  /**
   * Récupère la première ferme de l'utilisateur (ferme principale)
   * Utile pour la migration progressive
   */
  getPrimary: () => Promise<{ data: Farm | null; error: Error | null }>

  /**
   * Récupère une ferme par ID
   */
  getById: (id: string) => Promise<{ data: Farm | null; error: Error | null }>

  /**
   * Crée une nouvelle ferme
   */
  create: (farm: FarmInsert) => Promise<{ data: Farm | null; error: Error | null }>

  /**
   * Met à jour une ferme
   */
  update: (id: string, updates: FarmUpdate) => Promise<{ data: Farm | null; error: Error | null }>

  /**
   * Supprime une ferme
   */
  delete: (id: string) => Promise<{ error: Error | null }>
}

export const farmsService: FarmsService = {
  getAll: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Non authentifié') }

    return safeSupabaseQuery<Farm[]>(
      async () =>
        await supabase
          .from('farms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
      'farms',
      true
    )
  },

  getPrimary: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Non authentifié') }

    const result = await safeSupabaseQuery<Farm[]>(
      async () =>
        await supabase
          .from('farms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1),
      'farms',
      true
    )

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.[0] || null, error: null }
  },

  getById: async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Non authentifié') }

    return safeSupabaseQuery<Farm>(
      async () =>
        await supabase
          .from('farms')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single(),
      'farms',
      false
    )
  },

  create: async (farm: FarmInsert) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Non authentifié') }

    return safeSupabaseQuery<Farm>(
      async () =>
        await supabase
          .from('farms')
          .insert({ ...farm, user_id: user.id })
          .select()
          .single(),
      'farms',
      false
    )
  },

  update: async (id: string, updates: FarmUpdate) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Non authentifié') }

    return safeSupabaseQuery<Farm>(
      async () =>
        await supabase
          .from('farms')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single(),
      'farms',
      false
    )
  },

  delete: async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Non authentifié') }

    return safeSupabaseQuery<void>(
      async () => {
        const { error } = await supabase
          .from('farms')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
        return { data: null, error }
      },
      'farms',
      false
    ).then((result) => ({ error: result.error }))
  },
}

