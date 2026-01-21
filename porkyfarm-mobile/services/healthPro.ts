/**
 * Service Sante PRO - PorkyFarm
 * =============================
 * Gestion avancee des symptomes, diagnostics et traitements
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { getCurrentFarmId } from '../lib/farmHelpers'
import { logger } from '../lib/logger'

// ========== TYPES ==========

export interface Symptom {
  id: string
  code: string
  name: string
  category: 'respiratory' | 'digestive' | 'reproductive' | 'skin' | 'behavioral' | 'general'
  description: string | null
  severity_indicator: 'low' | 'medium' | 'high' | 'critical'
}

export interface Disease {
  id: string
  code: string
  name: string
  category: string
  description: string | null
  common_symptoms: string[]
  recommended_actions: string | null
  quarantine_required: boolean
  notifiable: boolean
}

export interface DiseaseSuggestion extends Disease {
  matchScore: number
  matchingSymptoms: string[]
}

export interface Treatment {
  id: string
  farm_id: string
  health_case_id: string | null
  animal_id: string | null
  treatment_type: 'antibiotic' | 'vaccine' | 'antiparasitic' | 'vitamin' | 'other'
  product_name: string
  dosage: string | null
  administration_route: 'oral' | 'injection' | 'topical' | 'feed' | null
  start_date: string
  end_date: string | null
  frequency: string | null
  withdrawal_meat_days: number | null
  withdrawal_date: string | null
  administered_by: string | null
  vet_prescription: boolean
  batch_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Jointures
  animal?: { id: string; identifier: string; name: string | null } | null
  health_case?: { id: string; title: string } | null
}

export interface TreatmentInsert {
  health_case_id?: string | null
  animal_id?: string | null
  treatment_type: 'antibiotic' | 'vaccine' | 'antiparasitic' | 'vitamin' | 'other'
  product_name: string
  dosage?: string | null
  administration_route?: 'oral' | 'injection' | 'topical' | 'feed' | null
  start_date: string
  end_date?: string | null
  frequency?: string | null
  withdrawal_meat_days?: number | null
  administered_by?: string | null
  vet_prescription?: boolean
  batch_number?: string | null
  notes?: string | null
}

// Categories de symptomes avec metadata
export const SYMPTOM_CATEGORIES = [
  { id: 'respiratory', label: 'Respiratoire', icon: 'fitness', color: '#3B82F6' },
  { id: 'digestive', label: 'Digestif', icon: 'nutrition', color: '#F59E0B' },
  { id: 'reproductive', label: 'Reproduction', icon: 'heart', color: '#EC4899' },
  { id: 'general', label: 'General', icon: 'body', color: '#8B5CF6' },
  { id: 'skin', label: 'Cutane', icon: 'ellipse', color: '#10B981' },
] as const

// Options de severite
export const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Faible', color: '#10B981', icon: 'checkmark-circle' },
  { value: 'medium', label: 'Moyenne', color: '#F59E0B', icon: 'alert-circle' },
  { value: 'high', label: 'Haute', color: '#F97316', icon: 'warning' },
  { value: 'critical', label: 'Critique', color: '#EF4444', icon: 'close-circle' },
] as const

// ========== SERVICE ==========

export const healthProService = {
  // ========== SYMPTOMES ==========

  /**
   * Recuperer tous les symptomes
   */
  getSymptoms: async (): Promise<{ data: Symptom[] | null; error: Error | null }> => {
    try {
      const result = await safeSupabaseQuery<Symptom[]>(
        async () =>
          await supabase
            .from('symptoms')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true }),
        'symptoms',
        true
      )
      return { data: result.data || [], error: result.error }
    } catch (err) {
      logger.error('[healthProService.getSymptoms] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Recuperer symptomes par categorie
   */
  getSymptomsByCategory: async (
    category: string
  ): Promise<{ data: Symptom[] | null; error: Error | null }> => {
    try {
      const result = await safeSupabaseQuery<Symptom[]>(
        async () =>
          await supabase
            .from('symptoms')
            .select('*')
            .eq('category', category)
            .order('name', { ascending: true }),
        'symptoms',
        true
      )
      return { data: result.data || [], error: result.error }
    } catch (err) {
      logger.error('[healthProService.getSymptomsByCategory] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  // ========== MALADIES ==========

  /**
   * Recuperer toutes les maladies
   */
  getDiseases: async (): Promise<{ data: Disease[] | null; error: Error | null }> => {
    try {
      const result = await safeSupabaseQuery<Disease[]>(
        async () =>
          await supabase
            .from('diseases')
            .select('*')
            .order('name', { ascending: true }),
        'diseases',
        true
      )
      return { data: result.data || [], error: result.error }
    } catch (err) {
      logger.error('[healthProService.getDiseases] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Suggerer des diagnostics bases sur les symptomes selectionnes
   * Retourne les maladies triees par score de correspondance
   */
  suggestDiseases: async (
    symptomCodes: string[]
  ): Promise<{ data: DiseaseSuggestion[]; error: Error | null }> => {
    try {
      if (symptomCodes.length === 0) {
        return { data: [], error: null }
      }

      const { data: diseases, error } = await supabase
        .from('diseases')
        .select('*')

      if (error) {
        return { data: [], error: new Error(error.message) }
      }

      if (!diseases || diseases.length === 0) {
        return { data: [], error: null }
      }

      // Calculer le score de correspondance pour chaque maladie
      const scored: DiseaseSuggestion[] = diseases.map((disease: Disease) => {
        const commonSymptoms = disease.common_symptoms || []
        const matchingSymptoms = commonSymptoms.filter((s) => symptomCodes.includes(s))
        const matchScore = commonSymptoms.length > 0
          ? matchingSymptoms.length / commonSymptoms.length
          : 0

        return {
          ...disease,
          matchScore,
          matchingSymptoms,
        }
      })

      // Filtrer et trier par score decroissant
      const suggestions = scored
        .filter((d) => d.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)

      return { data: suggestions, error: null }
    } catch (err) {
      logger.error('[healthProService.suggestDiseases] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  // ========== TRAITEMENTS ==========

  /**
   * Creer un nouveau traitement
   */
  createTreatment: async (
    treatment: TreatmentInsert
  ): Promise<{ data: Treatment | null; error: Error | null }> => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      // Calculer la date de fin de delai d'attente
      let withdrawalDate: string | null = null
      if (treatment.withdrawal_meat_days && treatment.end_date) {
        const endDate = new Date(treatment.end_date)
        endDate.setDate(endDate.getDate() + treatment.withdrawal_meat_days)
        withdrawalDate = endDate.toISOString().split('T')[0]
      }

      const result = await safeSupabaseQuery<Treatment>(
        async () =>
          await supabase
            .from('treatments')
            .insert({
              ...treatment,
              farm_id: farmId,
              withdrawal_date: withdrawalDate,
            })
            .select()
            .single(),
        'treatments',
        false
      )

      return { data: result.data, error: result.error }
    } catch (err) {
      logger.error('[healthProService.createTreatment] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Recuperer tous les traitements de l'utilisateur
   */
  getTreatments: async (): Promise<{ data: Treatment[] | null; error: Error | null }> => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      const result = await safeSupabaseQuery<Treatment[]>(
        async () =>
          await supabase
            .from('treatments')
            .select(`
              *,
              animal:pigs!animal_id(id, identifier, name),
              health_case:health_cases!health_case_id(id, title)
            `)
            .eq('farm_id', farmId)
            .order('start_date', { ascending: false }),
        'treatments',
        true
      )

      return { data: result.data || [], error: result.error }
    } catch (err) {
      logger.error('[healthProService.getTreatments] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Recuperer les animaux en delai d'attente (ne pas abattre)
   */
  getActiveWithdrawals: async (): Promise<{ data: Treatment[] | null; error: Error | null }> => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      const today = new Date().toISOString().split('T')[0]

      const result = await safeSupabaseQuery<Treatment[]>(
        async () =>
          await supabase
            .from('treatments')
            .select(`
              *,
              animal:pigs!animal_id(id, identifier, name)
            `)
            .eq('farm_id', farmId)
            .gt('withdrawal_date', today)
            .order('withdrawal_date', { ascending: true }),
        'treatments',
        true
      )

      return { data: result.data || [], error: result.error }
    } catch (err) {
      logger.error('[healthProService.getActiveWithdrawals] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  // ========== STATISTIQUES ==========

  /**
   * Obtenir les statistiques sante
   */
  getHealthStats: async (): Promise<{
    data: {
      activeCases: number
      recentCases: number
      activeTreatments: number
      animalsInWithdrawal: number
    } | null
    error: Error | null
  }> => {
    try {
      const farmId = await getCurrentFarmId()
      if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const today = new Date().toISOString().split('T')[0]

      // Cas actifs (table health_cases V2.0)
      const { count: activeCases } = await supabase
        .from('health_cases')
        .select('*', { count: 'exact', head: true })
        .eq('farm_id', farmId)
        .in('status', ['active', 'ongoing'])

      // Cas des 30 derniers jours
      const { count: recentCases } = await supabase
        .from('health_cases')
        .select('*', { count: 'exact', head: true })
        .eq('farm_id', farmId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Traitements en cours
      const { count: activeTreatments } = await supabase
        .from('treatments')
        .select('*', { count: 'exact', head: true })
        .eq('farm_id', farmId)
        .gte('end_date', today)

      // Animaux en delai d'attente
      const { count: withdrawalCount } = await supabase
        .from('treatments')
        .select('*', { count: 'exact', head: true })
        .eq('farm_id', farmId)
        .gt('withdrawal_date', today)

      return {
        data: {
          activeCases: activeCases || 0,
          recentCases: recentCases || 0,
          activeTreatments: activeTreatments || 0,
          animalsInWithdrawal: withdrawalCount || 0,
        },
        error: null,
      }
    } catch (err) {
      logger.error('[healthProService.getHealthStats] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },
}

export default healthProService
