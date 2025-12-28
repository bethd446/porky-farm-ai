import { supabase } from './supabase/client'

export interface Gestation {
  id: string
  user_id: string
  sow_id: string
  boar_id: string | null
  mating_date: string
  expected_farrowing_date: string | null
  actual_farrowing_date: string | null
  piglets_born_alive: number | null
  piglets_stillborn: number | null
  piglets_weaned: number | null
  weaning_date: string | null
  status: 'pregnant' | 'farrowed' | 'weaning' | 'completed' | 'aborted'
  notes: string | null
  created_at: string
  updated_at: string
  // Joined data
  sow_name?: string
  sow_identifier?: string
  boar_name?: string
  boar_identifier?: string
}

export interface GestationInsert {
  sow_id: string
  boar_id?: string | null
  mating_date: string
  expected_farrowing_date?: string | null
  actual_farrowing_date?: string | null
  piglets_born_alive?: number | null
  piglets_stillborn?: number | null
  piglets_weaned?: number | null
  weaning_date?: string | null
  status?: 'pregnant' | 'farrowed' | 'weaning' | 'completed' | 'aborted'
  notes?: string | null
}

export interface GestationUpdate {
  sow_id?: string
  boar_id?: string | null
  mating_date?: string
  expected_farrowing_date?: string | null
  actual_farrowing_date?: string | null
  piglets_born_alive?: number | null
  piglets_stillborn?: number | null
  piglets_weaned?: number | null
  weaning_date?: string | null
  status?: 'pregnant' | 'farrowed' | 'weaning' | 'completed' | 'aborted'
  notes?: string | null
}

// Calculer la date de mise-bas prévue (114 jours après la saillie)
export function calculateExpectedFarrowingDate(matingDate: string): string {
  const date = new Date(matingDate)
  date.setDate(date.getDate() + 114)
  return date.toISOString().split('T')[0]
}

export interface GestationsService {
  getAll: () => Promise<{ data: Gestation[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Gestation | null; error: Error | null }>
  create: (gestation: GestationInsert) => Promise<{ data: Gestation | null; error: Error | null }>
  update: (id: string, updates: GestationUpdate) => Promise<{ data: Gestation | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
}

export const gestationsService: GestationsService = {
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('gestations')
        .select(`
          *,
          sow:pigs!gestations_sow_id_fkey (
            name,
            identifier
          ),
          boar:pigs!gestations_boar_id_fkey (
            name,
            identifier
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Si la table n'existe pas, retourner une liste vide plutôt qu'une erreur
        if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          console.warn('Table gestations non trouvée, retour d\'une liste vide')
          return { data: [], error: null }
        }
        return { data: null, error: error as Error }
      }

      // Mapper les données avec les noms des truies/verrats depuis la jointure
      const mappedData = (data || []).map((record: any) => ({
        ...record,
        sow_name: record.sow?.name || null,
        sow_identifier: record.sow?.identifier || null,
        boar_name: record.boar?.name || null,
        boar_identifier: record.boar?.identifier || null,
      }))

      return { data: mappedData as Gestation[], error: null }
    } catch (err) {
      console.error('Error in gestationsService.getAll:', err)
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
        .from('gestations')
        .select(`
          *,
          sow:pigs!gestations_sow_id_fkey (
            name,
            identifier
          ),
          boar:pigs!gestations_boar_id_fkey (
            name,
            identifier
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) return { data: null, error: error as Error }
      
      const mappedData = {
        ...data,
        sow_name: (data as any).sow?.name || null,
        sow_identifier: (data as any).sow?.identifier || null,
        boar_name: (data as any).boar?.name || null,
        boar_identifier: (data as any).boar?.identifier || null,
      }
      
      return { data: mappedData as Gestation, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  create: async (gestation: GestationInsert) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      // Calculer la date prévue si non fournie
      const expectedFarrowingDate =
        gestation.expected_farrowing_date || calculateExpectedFarrowingDate(gestation.mating_date)

      const { data, error } = await supabase
        .from('gestations')
        .insert({ ...gestation, expected_farrowing_date: expectedFarrowingDate, user_id: user.id })
        .select(`
          *,
          sow:pigs!gestations_sow_id_fkey (
            name,
            identifier
          ),
          boar:pigs!gestations_boar_id_fkey (
            name,
            identifier
          )
        `)
        .single()

      if (error) return { data: null, error: error as Error }
      
      const mappedData = {
        ...data,
        sow_name: (data as any).sow?.name || null,
        sow_identifier: (data as any).sow?.identifier || null,
        boar_name: (data as any).boar?.name || null,
        boar_identifier: (data as any).boar?.identifier || null,
      }
      
      return { data: mappedData as Gestation, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  update: async (id: string, updates: GestationUpdate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('gestations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          sow:pigs!gestations_sow_id_fkey (
            name,
            identifier
          ),
          boar:pigs!gestations_boar_id_fkey (
            name,
            identifier
          )
        `)
        .single()

      if (error) return { data: null, error: error as Error }
      
      const mappedData = {
        ...data,
        sow_name: (data as any).sow?.name || null,
        sow_identifier: (data as any).sow?.identifier || null,
        boar_name: (data as any).boar?.name || null,
        boar_identifier: (data as any).boar?.identifier || null,
      }
      
      return { data: mappedData as Gestation, error: null }
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

      const { error } = await supabase.from('gestations').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}
