/**
 * Service Gestations - ADAPTÉ POUR FARM_ID (V2.0)
 * ================================================
 * Gestion des gestations liées à une ferme
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { logger } from '../lib/logger'
import { getNowISO, addDays, toISODateString } from '../lib/dateUtils'
import { GESTATION_PERIOD_DAYS } from '../lib/constants/config'
import { getCurrentFarmId } from '../lib/farmHelpers'

// Status aligné avec schéma Supabase V2.0
export type GestationStatus = 'en_cours' | 'terminee' | 'avortee'

// Interface alignée avec la table gestations (V2.0)
export interface Gestation {
  id: string
  farm_id: string
  sow_id: string
  boar_id: string | null
  mating_date: string
  expected_farrowing_date: string | null
  actual_farrowing_date: string | null
  piglets_born_alive: number | null
  piglets_stillborn: number | null
  piglets_weaned: number | null
  weaning_date: string | null
  status: GestationStatus
  notes: string | null
  created_at: string
  updated_at: string
  // Compatibilité
  user_id?: string
  // Joined data
  sow_name?: string | null
  sow_identifier?: string | null
  boar_name?: string | null
  boar_identifier?: string | null
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
  status?: GestationStatus
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
  status?: GestationStatus
  notes?: string | null
}

// Type for raw database response with joined pig data
interface GestationWithJoins extends Omit<Gestation, 'sow_name' | 'sow_identifier' | 'boar_name' | 'boar_identifier'> {
  sow: { name: string | null; identifier: string | null } | null
  boar: { name: string | null; identifier: string | null } | null
}

// Calculer la date de mise-bas prévue (114 jours après la saillie)
export function calculateExpectedFarrowingDate(matingDate: string): string {
  return addDays(matingDate, GESTATION_PERIOD_DAYS)
}

// Interface pour les alertes de gestation
export interface GestationAlertData {
  id: string
  sow_name: string
  sow_identifier: string | null
  days_remaining: number
  expected_date: string
  alert_level: 'critical' | 'warning' | 'info'
}

export interface GestationsService {
  getAll: (farmId?: string) => Promise<{ data: Gestation[] | null; error: Error | null }>
  getActive: (farmId?: string) => Promise<{ data: Gestation[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Gestation | null; error: Error | null }>
  getBySow: (sowId: string, farmId?: string) => Promise<{ data: Gestation[] | null; error: Error | null }>
  create: (gestation: GestationInsert, farmId?: string) => Promise<{ data: Gestation | null; error: Error | null }>
  update: (id: string, updates: GestationUpdate) => Promise<{ data: Gestation | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
  getStats: (farmId?: string) => Promise<{ data: { total: number; pregnant: number; farrowed: number; completed: number }; error: Error | null }>
  getAlerts: (farmId?: string, maxDays?: number) => Promise<{ data: GestationAlertData[] | null; error: Error | null }>
}

export const gestationsService: GestationsService = {
  /**
   * Récupérer toutes les gestations de la ferme
   */
  getAll: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      // Jointure simplifiée sans noms de FK explicites
      const result = await safeSupabaseQuery<GestationWithJoins[]>(
        async () =>
          await supabase
            .from('gestations')
            .select(`
              *,
              sow:sow_id (
                name,
                identifier
              ),
              boar:boar_id (
                name,
                identifier
              )
            `)
            .eq('farm_id', targetFarmId)
            .order('created_at', { ascending: false }),
        'gestations',
        true
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      // Mapper les données avec les noms des truies/verrats depuis la jointure
      const mappedData = (result.data || []).map((record) => ({
        ...record,
        sow_name: record.sow?.name || null,
        sow_identifier: record.sow?.identifier || null,
        boar_name: record.boar?.name || null,
        boar_identifier: record.boar?.identifier || null,
      }))

      return { data: mappedData as Gestation[], error: null }
    } catch (err) {
      logger.error('[gestations.getAll] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les gestations actives (en_cours uniquement selon schéma V2.0)
   */
  getActive: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      const result = await safeSupabaseQuery<GestationWithJoins[]>(
        async () =>
          await supabase
            .from('gestations')
            .select(`
              *,
              sow:sow_id (
                name,
                identifier
              ),
              boar:boar_id (
                name,
                identifier
              )
            `)
            .eq('farm_id', targetFarmId)
            .eq('status', 'en_cours')
            .order('expected_farrowing_date', { ascending: true }),
        'gestations',
        true
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      const mappedData = (result.data || []).map((record) => ({
        ...record,
        sow_name: record.sow?.name || null,
        sow_identifier: record.sow?.identifier || null,
        boar_name: record.boar?.name || null,
        boar_identifier: record.boar?.identifier || null,
      }))

      return { data: mappedData as Gestation[], error: null }
    } catch (err) {
      logger.error('[gestations.getActive] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer une gestation par ID
   */
  getById: async (id: string) => {
    try {
      const result = await safeSupabaseQuery<GestationWithJoins>(
        async () =>
          await supabase
            .from('gestations')
            .select(`
              *,
              sow:sow_id (
                name,
                identifier
              ),
              boar:boar_id (
                name,
                identifier
              )
            `)
            .eq('id', id)
            .single(),
        'gestations',
        false
      )

      if (result.error) return { data: null, error: result.error }

      if (!result.data) {
        return { data: null, error: null }
      }

      const mappedData: Gestation = {
        ...result.data,
        sow_name: result.data.sow?.name || null,
        sow_identifier: result.data.sow?.identifier || null,
        boar_name: result.data.boar?.name || null,
        boar_identifier: result.data.boar?.identifier || null,
      }

      return { data: mappedData, error: null }
    } catch (err) {
      logger.error('[gestations.getById] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les gestations d'une truie
   */
  getBySow: async (sowId: string, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      const result = await safeSupabaseQuery<GestationWithJoins[]>(
        async () =>
          await supabase
            .from('gestations')
            .select(`
              *,
              sow:sow_id (
                name,
                identifier
              ),
              boar:boar_id (
                name,
                identifier
              )
            `)
            .eq('farm_id', targetFarmId)
            .eq('sow_id', sowId)
            .order('mating_date', { ascending: false }),
        'gestations',
        true
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      const mappedData = (result.data || []).map((record) => ({
        ...record,
        sow_name: record.sow?.name || null,
        sow_identifier: record.sow?.identifier || null,
        boar_name: record.boar?.name || null,
        boar_identifier: record.boar?.identifier || null,
      }))

      return { data: mappedData as Gestation[], error: null }
    } catch (err) {
      logger.error('[gestations.getBySow] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Créer une nouvelle gestation
   */
  create: async (gestation: GestationInsert, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      // Calculer la date prévue si non fournie
      const expectedFarrowingDate =
        gestation.expected_farrowing_date || calculateExpectedFarrowingDate(gestation.mating_date)

      const result = await safeSupabaseQuery<GestationWithJoins>(
        async () =>
          await supabase
            .from('gestations')
            .insert({
              ...gestation,
              farm_id: targetFarmId,
              expected_farrowing_date: expectedFarrowingDate,
              status: gestation.status || 'en_cours',
            })
            .select(`
              *,
              sow:sow_id (
                name,
                identifier
              ),
              boar:boar_id (
                name,
                identifier
              )
            `)
            .single(),
        'gestations',
        false
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      if (!result.data) {
        return { data: null, error: null }
      }

      const mappedData: Gestation = {
        ...result.data,
        sow_name: result.data.sow?.name || null,
        sow_identifier: result.data.sow?.identifier || null,
        boar_name: result.data.boar?.name || null,
        boar_identifier: result.data.boar?.identifier || null,
      }

      return { data: mappedData, error: null }
    } catch (err) {
      logger.error('[gestations.create] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Mettre à jour une gestation
   */
  update: async (id: string, updates: GestationUpdate) => {
    try {
      const result = await safeSupabaseQuery<GestationWithJoins>(
        async () =>
          await supabase
            .from('gestations')
            .update({ ...updates, updated_at: getNowISO() })
            .eq('id', id)
            .select(`
              *,
              sow:sow_id (
                name,
                identifier
              ),
              boar:boar_id (
                name,
                identifier
              )
            `)
            .single(),
        'gestations',
        false
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      if (!result.data) {
        return { data: null, error: null }
      }

      const mappedData: Gestation = {
        ...result.data,
        sow_name: result.data.sow?.name || null,
        sow_identifier: result.data.sow?.identifier || null,
        boar_name: result.data.boar?.name || null,
        boar_identifier: result.data.boar?.identifier || null,
      }

      return { data: mappedData, error: null }
    } catch (err) {
      logger.error('[gestations.update] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer une gestation
   */
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('gestations')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[gestations.delete] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Obtenir les statistiques des gestations
   */
  getStats: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return {
          data: { total: 0, pregnant: 0, farrowed: 0, completed: 0 },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      const { data, error } = await supabase
        .from('gestations')
        .select('status')
        .eq('farm_id', targetFarmId)

      if (error) {
        return {
          data: { total: 0, pregnant: 0, farrowed: 0, completed: 0 },
          error: new Error(error.message),
        }
      }

      const stats = {
        total: data?.length || 0,
        pregnant: data?.filter((g) => g.status === 'en_cours').length || 0,
        farrowed: data?.filter((g) => g.status === 'terminee').length || 0,
        completed: data?.filter((g) => g.status === 'terminee').length || 0,
      }

      return { data: stats, error: null }
    } catch (err) {
      logger.error('[gestations.getStats] Error:', err)
      return {
        data: { total: 0, pregnant: 0, farrowed: 0, completed: 0 },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },

  /**
   * Récupérer les alertes de gestations (mises bas proches)
   * @param farmId - ID de la ferme (optionnel, utilise la ferme courante si non fourni)
   * @param maxDays - Nombre de jours maximum avant la mise bas (défaut: 14)
   */
  getAlerts: async (farmId?: string, maxDays = 14) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      const result = await safeSupabaseQuery<GestationWithJoins[]>(
        async () =>
          await supabase
            .from('gestations')
            .select(`
              *,
              sow:sow_id (
                name,
                identifier
              ),
              boar:boar_id (
                name,
                identifier
              )
            `)
            .eq('farm_id', targetFarmId)
            .eq('status', 'en_cours')
            .not('expected_farrowing_date', 'is', null)
            .order('expected_farrowing_date', { ascending: true }),
        'gestations',
        true
      )

      if (result.error) {
        return { data: null, error: result.error }
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Filtrer et transformer en alertes
      const alerts: GestationAlertData[] = (result.data || [])
        .map((g) => {
          if (!g.expected_farrowing_date) return null

          const expectedDate = new Date(g.expected_farrowing_date)
          expectedDate.setHours(0, 0, 0, 0)
          const daysRemaining = Math.ceil((expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          // Ne garder que les gestations dans la période d'alerte
          if (daysRemaining < 0 || daysRemaining > maxDays) return null

          // Déterminer le niveau d'alerte
          let alertLevel: 'critical' | 'warning' | 'info' = 'info'
          if (daysRemaining <= 2) {
            alertLevel = 'critical'
          } else if (daysRemaining <= 5) {
            alertLevel = 'warning'
          }

          return {
            id: g.id,
            sow_name: g.sow?.name || g.sow?.identifier || 'Truie',
            sow_identifier: g.sow?.identifier || null,
            days_remaining: daysRemaining,
            expected_date: g.expected_farrowing_date,
            alert_level: alertLevel,
          }
        })
        .filter((a): a is GestationAlertData => a !== null)
        .sort((a, b) => a.days_remaining - b.days_remaining)

      return { data: alerts, error: null }
    } catch (err) {
      logger.error('[gestations.getAlerts] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },
}

export default gestationsService
