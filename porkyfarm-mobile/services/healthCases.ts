import { supabase } from './supabase/client'

// Interface alignée avec la table veterinary_cases (utilisée par le web)
export interface HealthCase {
  id: string
  user_id: string
  animal_id: string // veterinary_cases utilise animal_id
  animal_name: string | null
  issue: string // veterinary_cases utilise issue (pas title)
  description: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'resolved' | 'monitoring'
  treatment: string | null
  veterinarian: string | null
  photo: string | null
  cost: number | null
  start_date: string | null
  created_at: string
  updated_at: string | null
}

export interface HealthCaseInsert {
  animal_id: string
  animal_name?: string | null
  issue: string
  description: string
  priority?: 'high' | 'medium' | 'low'
  status?: 'active' | 'resolved' | 'monitoring'
  treatment?: string | null
  veterinarian?: string | null
  photo?: string | null
  cost?: number | null
  start_date?: string | null
}

export interface HealthCaseUpdate {
  animal_id?: string
  animal_name?: string | null
  issue?: string
  description?: string | null
  priority?: 'high' | 'medium' | 'low'
  status?: 'active' | 'resolved' | 'monitoring'
  treatment?: string | null
  veterinarian?: string | null
  photo?: string | null
  cost?: number | null
  start_date?: string | null
}

export interface HealthCasesService {
  getAll: () => Promise<{ data: HealthCase[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: HealthCase | null; error: Error | null }>
  create: (healthCase: HealthCaseInsert) => Promise<{ data: HealthCase | null; error: Error | null }>
  update: (id: string, updates: HealthCaseUpdate) => Promise<{ data: HealthCase | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
}

export const healthCasesService: HealthCasesService = {
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      // Utiliser veterinary_cases (table utilisée par le web)
      const { data, error } = await supabase
        .from('veterinary_cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Si la table n'existe pas, retourner une liste vide plutôt qu'une erreur
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Table veterinary_cases non trouvée, retour d\'une liste vide')
          return { data: [], error: null }
        }
        return { data: null, error: error as Error }
      }

      return { data: data as HealthCase[], error: null }
    } catch (err) {
      console.error('Error in healthCasesService.getAll:', err)
      return { data: [], error: null } // Retourner liste vide plutôt qu'erreur
    }
  },

  getById: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('veterinary_cases')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as HealthCase, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  create: async (healthCase: HealthCaseInsert) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('veterinary_cases')
        .insert({ ...healthCase, user_id: user.id })
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as HealthCase, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  update: async (id: string, updates: HealthCaseUpdate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('veterinary_cases')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as HealthCase, error: null }
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

      const { error } = await supabase.from('veterinary_cases').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}
