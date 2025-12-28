import { supabase } from './supabase/client'

export interface Animal {
  id: string
  user_id: string
  identifier: string
  name: string | null
  category: 'sow' | 'boar' | 'piglet' | 'fattening'
  breed: string | null
  birth_date: string | null
  weight: number | null
  status: 'active' | 'sick' | 'pregnant' | 'nursing' | 'sold' | 'deceased'
  image_url: string | null // La table pigs utilise image_url
  mother_id: string | null
  father_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AnimalInsert {
  identifier: string
  name?: string | null
  category: 'sow' | 'boar' | 'piglet' | 'fattening'
  breed?: string | null
  birth_date?: string | null
  weight?: number | null
  status?: 'active' | 'sick' | 'pregnant' | 'nursing' | 'sold' | 'deceased'
  image_url?: string | null // La table pigs utilise image_url, pas photo
  mother_id?: string | null
  father_id?: string | null
  notes?: string | null
}

export interface AnimalUpdate {
  identifier?: string
  name?: string | null
  category?: 'sow' | 'boar' | 'piglet' | 'fattening'
  breed?: string | null
  birth_date?: string | null
  weight?: number | null
  status?: 'active' | 'sick' | 'pregnant' | 'nursing' | 'sold' | 'deceased'
  image_url?: string | null
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

