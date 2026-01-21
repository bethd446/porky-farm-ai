import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { logger } from '../lib/logger'
import { getNowISO } from '../lib/dateUtils'
import { getCurrentFarmId } from '../lib/farmHelpers'

// Interface alignée avec la table health_cases (V2.0)
export interface HealthCase {
  id: string
  farm_id: string
  animal_id: string | null // health_cases utilise animal_id (anciennement pig_id)
  animal_name?: string | null // Jointure avec pigs
  animal_identifier?: string | null // Jointure avec pigs
  title: string | null
  description: string | null
  severity: 'low' | 'medium' | 'high' | 'critical' | null
  status: string | null // health_cases utilise VARCHAR (peut être 'active', 'ongoing', 'resolved', etc.)
  symptoms: string[] | null
  suspected_disease_id: string | null
  confirmed_disease_id: string | null
  temperature: number | null
  affected_count: number | null
  quarantine_applied: boolean | null
  vet_consulted: boolean | null
  vet_visit_date: string | null
  lab_results: string | null
  treatment: string | null
  start_date: string
  resolution_date: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string | null
}

export type HealthRecordType = 'disease' | 'treatment' | 'vaccination' | 'checkup' | 'injury'

export interface HealthCaseInsert {
  animal_id: string | null // health_cases utilise animal_id
  title: string | null
  description?: string | null
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: string // 'active', 'ongoing', 'resolved', etc.
  symptoms?: string[] | null
  suspected_disease_id?: string | null
  confirmed_disease_id?: string | null
  temperature?: number | null
  affected_count?: number | null
  quarantine_applied?: boolean | null
  vet_consulted?: boolean | null
  vet_visit_date?: string | null
  lab_results?: string | null
  treatment?: string | null
  start_date?: string | null
  resolution_date?: string | null
  resolution_notes?: string | null
}

export interface HealthCaseUpdate {
  animal_id?: string | null
  title?: string | null
  description?: string | null
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: string
  symptoms?: string[] | null
  suspected_disease_id?: string | null
  confirmed_disease_id?: string | null
  temperature?: number | null
  affected_count?: number | null
  quarantine_applied?: boolean | null
  vet_consulted?: boolean | null
  vet_visit_date?: string | null
  lab_results?: string | null
  treatment?: string | null
  start_date?: string | null
  resolution_date?: string | null
  resolution_notes?: string | null
}

// Type for raw database response with joined animal data
interface HealthCaseWithJoins extends Omit<HealthCase, 'animal_name' | 'animal_identifier'> {
  pigs: { name: string | null; identifier: string | null } | null
}

export interface HealthStats {
  healthy: number
  sick: number
  total: number
  openCases: number
}

export interface HealthCasesService {
  getAll: () => Promise<{ data: HealthCase[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: HealthCase | null; error: Error | null }>
  create: (healthCase: HealthCaseInsert) => Promise<{ data: HealthCase | null; error: Error | null }>
  update: (id: string, updates: HealthCaseUpdate) => Promise<{ data: HealthCase | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
  getOpenCases: () => Promise<{ data: HealthCase[] | null; error: Error | null }>
  getHealthStats: () => Promise<{ data: HealthStats; error: Error | null }>
}

export const healthCasesService: HealthCasesService = {
  getAll: async () => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      // Utiliser health_cases (table V2.0) - jointure simplifiée
      const result = await safeSupabaseQuery<HealthCaseWithJoins[]>(
        async () =>
          await supabase
            .from('health_cases')
            .select(`
              *,
              pigs:animal_id (
                name,
                identifier
              )
            `)
            .eq('farm_id', farmId)
            .order('created_at', { ascending: false }),
        'health_cases',
        true
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      // Mapper les données avec les noms des animaux depuis la jointure
      const mappedData = (result.data || []).map((record) => ({
        ...record,
        animal_name: record.pigs?.name || null,
        animal_identifier: record.pigs?.identifier || null,
      }))

      return { data: mappedData as HealthCase[], error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      logger.error('Error in healthCasesService.getAll:', errorMessage)
      return { data: [], error: null } // Retourner liste vide plutôt qu'erreur
    }
  },

  getById: async (id: string) => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      const result = await safeSupabaseQuery<HealthCaseWithJoins>(
        async () =>
          await supabase
            .from('health_cases')
            .select(`
              *,
              pigs:animal_id (
                name,
                identifier
              )
            `)
            .eq('id', id)
            .eq('farm_id', farmId)
            .single(),
        'health_cases',
        false
      )

      if (result.error) return { data: null, error: result.error }

      if (!result.data) {
        return { data: null, error: null }
      }

      const mappedData: HealthCase = {
        ...result.data,
        animal_name: result.data.pigs?.name || null,
        animal_identifier: result.data.pigs?.identifier || null,
      }

      return { data: mappedData, error: null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue')
      return { data: null, error }
    }
  },

  create: async (healthCase: HealthCaseInsert) => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      const result = await safeSupabaseQuery<HealthCaseWithJoins>(
        async () =>
          await supabase
            .from('health_cases')
            .insert({
              ...healthCase,
              farm_id: farmId,
              status: healthCase.status || 'active',
              start_date: healthCase.start_date || new Date().toISOString().split('T')[0],
            })
            .select(`
              *,
              pigs:animal_id (
                name,
                identifier
              )
            `)
            .single(),
        'health_cases',
        false
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      if (!result.data) {
        return { data: null, error: null }
      }

      const mappedData: HealthCase = {
        ...result.data,
        animal_name: result.data.pigs?.name || null,
        animal_identifier: result.data.pigs?.identifier || null,
      }

      return { data: mappedData, error: null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue')
      return { data: null, error }
    }
  },

  update: async (id: string, updates: HealthCaseUpdate) => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      const result = await safeSupabaseQuery<HealthCaseWithJoins>(
        async () =>
          await supabase
            .from('health_cases')
            .update({ ...updates, updated_at: getNowISO() })
            .eq('id', id)
            .eq('farm_id', farmId)
            .select(`
              *,
              pigs:animal_id (
                name,
                identifier
              )
            `)
            .single(),
        'health_cases',
        false
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      if (!result.data) {
        return { data: null, error: null }
      }

      const mappedData: HealthCase = {
        ...result.data,
        animal_name: result.data.pigs?.name || null,
        animal_identifier: result.data.pigs?.identifier || null,
      }

      return { data: mappedData, error: null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue')
      return { data: null, error }
    }
  },

  delete: async (id: string) => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { error: new Error('Aucune ferme trouvée') }

      const result = await safeSupabaseQuery<null>(
        async () =>
          await supabase
            .from('health_cases')
            .delete()
            .eq('id', id)
            .eq('farm_id', farmId),
        'health_cases',
        false
      )

      return { error: result.error }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue')
      return { error }
    }
  },

  /**
   * Récupérer les cas ouverts (active ou ongoing)
   */
  getOpenCases: async () => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      const result = await safeSupabaseQuery<HealthCaseWithJoins[]>(
        async () =>
          await supabase
            .from('health_cases')
            .select(`
              *,
              pigs:animal_id (
                name,
                identifier
              )
            `)
            .eq('farm_id', farmId)
            .in('status', ['active', 'ongoing'])
            .order('created_at', { ascending: false }),
        'health_cases',
        true
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      const mappedData = (result.data || []).map((record) => ({
        ...record,
        animal_name: record.pigs?.name || null,
        animal_identifier: record.pigs?.identifier || null,
      }))

      return { data: mappedData as HealthCase[], error: null }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      logger.error('Error in healthCasesService.getOpenCases:', errorMessage)
      return { data: [], error: null }
    }
  },

  /**
   * Récupérer les statistiques de santé du cheptel
   * - Total animaux actifs
   * - Animaux en santé (sans cas ouvert)
   * - Animaux malades (avec cas ouvert)
   * - Nombre de cas ouverts
   */
  getHealthStats: async () => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) {
        return {
          data: { healthy: 0, sick: 0, total: 0, openCases: 0 },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      // Récupérer tous les animaux actifs (FR: actif, EN: active)
      const { data: allAnimals, error: animalsError } = await supabase
        .from('pigs')
        .select('id')
        .eq('farm_id', farmId)
        .in('status', ['actif', 'active'])

      if (animalsError) {
        logger.error('[healthCases.getHealthStats] Animals error:', animalsError)
        return {
          data: { healthy: 0, sick: 0, total: 0, openCases: 0 },
          error: new Error(animalsError.message),
        }
      }

      const totalAnimals = allAnimals?.length || 0

      // Récupérer les cas ouverts avec leurs animal_id
      const { data: openCases, error: casesError } = await supabase
        .from('health_cases')
        .select('animal_id')
        .eq('farm_id', farmId)
        .in('status', ['active', 'ongoing'])

      if (casesError) {
        logger.error('[healthCases.getHealthStats] Cases error:', casesError)
        return {
          data: { healthy: totalAnimals, sick: 0, total: totalAnimals, openCases: 0 },
          error: new Error(casesError.message),
        }
      }

      // Compter les animaux uniques avec des cas ouverts
      const sickAnimalIds = new Set(
        (openCases || [])
          .filter((c) => c.animal_id)
          .map((c) => c.animal_id)
      )
      const sickCount = sickAnimalIds.size
      const healthyCount = Math.max(0, totalAnimals - sickCount)
      const openCasesCount = openCases?.length || 0

      return {
        data: {
          healthy: healthyCount,
          sick: sickCount,
          total: totalAnimals,
          openCases: openCasesCount,
        },
        error: null,
      }
    } catch (err: unknown) {
      logger.error('[healthCases.getHealthStats] Error:', err)
      return {
        data: { healthy: 0, sick: 0, total: 0, openCases: 0 },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },
}
