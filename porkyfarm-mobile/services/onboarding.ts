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
  checkOnboardingStatus: () => Promise<{ hasCompleted: boolean; error: Error | null }>
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
        console.error('[onboardingService] Auth error:', authError)
        return { hasCompleted: false, error: authError as Error }
      }

      if (!user) {
        console.log('[onboardingService] No user found')
        return { hasCompleted: false, error: new Error('Non authentifié') }
      }

      // Requête Supabase avec gestion d'erreurs robuste
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', user.id)
        .single()

      if (error) {
        // Codes d'erreur Supabase courants
        const errorCode = error.code || ''
        const errorMessage = error.message || ''

        // PGRST116 = No rows returned (profil n'existe pas encore)
        if (errorCode === 'PGRST116' || errorMessage.includes('No rows')) {
          console.log('[onboardingService] Profile not found, considering onboarding not completed')
          return { hasCompleted: false, error: null }
        }

        // PGRST205 = Table not found (schéma pas encore migré)
        if (errorCode === 'PGRST205' || errorMessage.includes('does not exist') || errorMessage.includes('not found')) {
          console.warn('[onboardingService] Table or column not found, considering onboarding not completed')
          return { hasCompleted: false, error: null }
        }

        // Erreur réseau
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
          console.error('[onboardingService] Network error:', error)
          return { hasCompleted: false, error: new Error('Erreur réseau. Vérifiez votre connexion.') }
        }

        // Autre erreur Supabase
        console.error('[onboardingService] Supabase error:', error)
        return { hasCompleted: false, error: error as Error }
      }

      // Succès : retourner le statut
      const hasCompleted = Boolean(data?.has_completed_onboarding)
      console.log('[onboardingService] Onboarding status:', hasCompleted)
      return { hasCompleted, error: null }
    } catch (err: any) {
      // Exception non catchée (timeout, erreur réseau, etc.)
      console.error('[onboardingService] Exception:', err)
      const error = err instanceof Error ? err : new Error('Erreur inattendue lors de la vérification')
      return { hasCompleted: false, error }
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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          has_completed_onboarding: true,
          onboarding_data: data as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) return { error: updateError as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}

