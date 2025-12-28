import { supabase } from './supabase/client'

// Interface alignée avec la table public.pigs
// Colonnes : id, user_id, tag_number, birth_date, sex, breed, status, weight_history, photo_url, mother_id, father_id, notes, created_at, updated_at
export interface Animal {
  id: string
  user_id: string
  tag_number: string // tag_number au lieu de identifier
  birth_date: string | null
  sex: 'male' | 'female' | 'unknown' // sex au lieu de category
  breed: string | null
  status: string // status (active, sick, pregnant, nursing, sold, deceased, etc.)
  weight_history: any | null // weight_history (JSONB) au lieu de weight
  photo_url: string | null // photo_url au lieu de image_url
  mother_id: string | null
  father_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Helper pour mapper category (UI) vers sex (DB)
export function mapCategoryToSex(category: 'sow' | 'boar' | 'piglet' | 'fattening'): 'male' | 'female' | 'unknown' {
  if (category === 'sow') return 'female'
  if (category === 'boar') return 'male'
  return 'unknown' // piglet ou fattening
}

// Helper pour mapper sex (DB) vers category (UI) pour affichage
export function mapSexToCategory(sex: string): 'sow' | 'boar' | 'piglet' | 'fattening' {
  if (sex === 'female') return 'sow'
  if (sex === 'male') return 'boar'
  return 'fattening' // unknown par défaut
}

// Interface pour l'UI (garde category pour compatibilité)
export interface AnimalInsert {
  tag_number: string
  birth_date?: string | null
  sex: 'male' | 'female' | 'unknown' // Utiliser directement sex
  breed?: string | null
  status?: string
  weight_history?: any | null // weight_history (JSONB)
  photo_url?: string | null // photo_url
  mother_id?: string | null
  father_id?: string | null
  notes?: string | null
}

export interface AnimalUpdate {
  tag_number?: string
  birth_date?: string | null
  sex?: 'male' | 'female' | 'unknown'
  breed?: string | null
  status?: string
  weight_history?: any | null
  photo_url?: string | null
  mother_id?: string | null
  father_id?: string | null
  notes?: string | null
}

export interface AnimalsService {
  getAll: () => Promise<{ data: Animal[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Animal | null; error: Error | null }>
  create: (animal: AnimalInsert) => Promise<{ data: Animal | null; error: Error | null }>
  update: (id: string, updates: AnimalUpdate) => Promise<{ data: Animal | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
}

export const animalsService: AnimalsService = {
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('pigs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error as Error }
      return { data: data as Animal[], error: null }
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
        .from('pigs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Animal, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  create: async (animal: AnimalInsert) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('pigs')
        .insert({ ...animal, user_id: user.id })
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Animal, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  update: async (id: string, updates: AnimalUpdate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('pigs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Animal, error: null }
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

      const { error } = await supabase.from('pigs').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}
