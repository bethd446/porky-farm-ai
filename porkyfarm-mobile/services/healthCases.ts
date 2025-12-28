import { supabase } from './supabase/client'

// Interface alignée avec la table health_records (table réelle dans Supabase)
export interface HealthCase {
  id: string
  user_id: string
  pig_id: string // health_records utilise pig_id
  pig_name?: string | null // Jointure avec pigs
  pig_identifier?: string | null // Jointure avec pigs
  title: string // health_records utilise title
  description: string | null
  severity: 'low' | 'medium' | 'high' | 'critical' | null // health_records utilise severity
  status: 'ongoing' | 'resolved' | 'chronic' | 'scheduled' // health_records utilise ces statuts
  treatment: string | null
  veterinarian: string | null
  image_url: string | null // health_records utilise image_url
  cost: number | null
  start_date: string | null
  created_at: string
  updated_at: string | null
}

export interface HealthCaseInsert {
  pig_id: string
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'ongoing' | 'resolved' | 'chronic' | 'scheduled'
  treatment?: string | null
  veterinarian?: string | null
  image_url?: string | null
  cost?: number | null
  start_date?: string | null
}

export interface HealthCaseUpdate {
  pig_id?: string
  title?: string
  description?: string | null
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'ongoing' | 'resolved' | 'chronic' | 'scheduled'
  treatment?: string | null
  veterinarian?: string | null
  image_url?: string | null
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

      // Utiliser health_records (table réelle dans Supabase)
      const { data, error } = await supabase
        .from('health_records')
        .select(`
          *,
          pigs:pig_id (
            name,
            identifier
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Si la table n'existe pas, retourner une liste vide plutôt qu'une erreur
        if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          console.warn('Table health_records non trouvée, retour d\'une liste vide')
          return { data: [], error: null }
        }
        return { data: null, error: error as Error }
      }

      // Mapper les données avec les noms des porcs depuis la jointure
      const mappedData = (data || []).map((record: any) => ({
        ...record,
        pig_name: record.pigs?.name || null,
        pig_identifier: record.pigs?.identifier || null,
      }))

      return { data: mappedData as HealthCase[], error: null }
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
        .from('health_records')
        .select(`
          *,
          pigs:pig_id (
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
        pig_name: (data as any).pigs?.name || null,
        pig_identifier: (data as any).pigs?.identifier || null,
      }
      
      return { data: mappedData as HealthCase, error: null }
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
        .from('health_records')
        .insert({ 
          ...healthCase, 
          user_id: user.id,
          type: 'disease', // Valeur par défaut pour health_records
        })
        .select(`
          *,
          pigs:pig_id (
            name,
            identifier
          )
        `)
        .single()

      if (error) return { data: null, error: error as Error }
      
      const mappedData = {
        ...data,
        pig_name: (data as any).pigs?.name || null,
        pig_identifier: (data as any).pigs?.identifier || null,
      }
      
      return { data: mappedData as HealthCase, error: null }
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
        .from('health_records')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          pigs:pig_id (
            name,
            identifier
          )
        `)
        .single()

      if (error) return { data: null, error: error as Error }
      
      const mappedData = {
        ...data,
        pig_name: (data as any).pigs?.name || null,
        pig_identifier: (data as any).pigs?.identifier || null,
      }
      
      return { data: mappedData as HealthCase, error: null }
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

      const { error } = await supabase.from('health_records').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}
