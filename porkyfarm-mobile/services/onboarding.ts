import { supabase } from './supabase/client'
import { animalsService } from './animals'
import { tasksService } from './tasks'

export interface OnboardingData {
  totalPigs: number
  sows: number
  boars: number
  fattening: number
  piglets: number
  breeds: string[]
  feedingFrequency: 'twice' | 'thrice'
  rationSows?: number
  rationLactating?: number
  rationFattening?: number
  rationPiglets?: number
  surface?: number
  buildingType?: 'closed' | 'semi_open' | 'outdoor'
  mainGoal?: 'health' | 'reproduction' | 'costs' | 'all'
}

export interface OnboardingService {
  checkOnboardingStatus: () => Promise<{ hasCompleted: boolean; error?: Error | null }>
  markOnboardingCompleted: () => Promise<{ error: Error | null }>
  saveOnboardingData: (data: OnboardingData) => Promise<{ error: Error | null }>
  completeOnboarding: (data: OnboardingData) => Promise<{ error: Error | null }>
}

export const onboardingService: OnboardingService = {
  checkOnboardingStatus: async () => {
    try {
      // Vérifier l'authentification
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.warn('[onboardingService] Auth error:', authError.message)
        return { hasCompleted: false, error: authError as Error }
      }

      if (!user) {
        return { hasCompleted: false, error: new Error('Non authentifié') }
      }

      // Requête Supabase : select has_completed_onboarding
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', user.id)
        .single()

      if (error) {
        const errorCode = error.code || ''
        const errorMessage = error.message || ''

        // PGRST116 = No rows returned (profil n'existe pas encore)
        if (errorCode === 'PGRST116' || errorMessage.includes('No rows')) {
          // Comportement gracieux : considérer comme non complété, pas d'erreur
          return { hasCompleted: false, error: null }
        }

        // PGRST205 = Table/column not found (schéma pas encore migré)
        if (errorCode === 'PGRST205' || errorMessage.includes('does not exist') || errorMessage.includes('not found')) {
          // Comportement gracieux : considérer comme non complété, pas d'erreur
          // Pas de console.warn pour éviter les warnings répétés
          return { hasCompleted: false, error: null }
        }

        // Erreur réseau
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
          console.warn('[onboardingService] Network error:', error.message)
          return { hasCompleted: false, error: new Error('Erreur réseau. Vérifiez votre connexion.') }
        }

        // Autre erreur Supabase
        console.warn('[onboardingService] Supabase error:', error.message)
        return { hasCompleted: false, error: error as Error }
      }

      // Succès : retourner le statut
      const hasCompleted = Boolean(data?.has_completed_onboarding)
      return { hasCompleted, error: null }
    } catch (err: any) {
      // Exception non catchée (timeout, erreur réseau, etc.)
      console.warn('[onboardingService] Exception:', err?.message || 'Erreur inattendue')
      const error = err instanceof Error ? err : new Error('Erreur inattendue lors de la vérification')
      return { hasCompleted: false, error }
    }
  },

  markOnboardingCompleted: async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return { error: new Error('Non authentifié') }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          has_completed_onboarding: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        console.warn('[onboardingService] Error marking onboarding completed:', error.message)
        return { error: error as Error }
      }

      return { error: null }
    } catch (err: any) {
      console.warn('[onboardingService] Exception marking onboarding completed:', err?.message)
      return { error: err instanceof Error ? err : new Error('Erreur lors de la mise à jour') }
    }
  },

  saveOnboardingData: async (data: OnboardingData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié') }

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_data: data as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },

  completeOnboarding: async (data: OnboardingData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié') }

      // 1. Sauvegarder les données d'onboarding
      await onboardingService.saveOnboardingData(data)

      // 2. Créer les animaux automatiquement
      const animalsToCreate: Array<{ category: 'sow' | 'boar' | 'piglet' | 'fattening'; count: number }> = [
        { category: 'sow', count: data.sows },
        { category: 'boar', count: data.boars },
        { category: 'fattening', count: data.fattening },
        { category: 'piglet', count: data.piglets },
      ]

      for (const { category, count } of animalsToCreate) {
        if (count > 0) {
          const categoryPrefix = {
            sow: 'TRUIE',
            boar: 'VERRAT',
            piglet: 'PORCELET',
            fattening: 'ENGRAISSEMENT',
          }[category]

          for (let i = 1; i <= count; i++) {
            const identifier = `${categoryPrefix}-${String(i).padStart(3, '0')}`
            await animalsService.create({
              identifier,
              category,
              breed: data.breeds[0] || null,
              status: 'active',
              name: null,
              birth_date: null,
              weight: null,
              notes: null,
              image_url: null,
            })
          }
        }
      }

      // 3. Créer les tâches récurrentes quotidiennes
      await tasksService.createRecurringDailyTasks(data)

      // 4. Marquer l'onboarding comme complété
      const { error: updateError } = await onboardingService.markOnboardingCompleted()

      if (updateError) return { error: updateError }
      
      // 5. Sauvegarder aussi les données d'onboarding
      await onboardingService.saveOnboardingData(data)

      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}
