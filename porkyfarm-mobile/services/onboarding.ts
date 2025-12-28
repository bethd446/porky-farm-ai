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
        return { hasCompleted: false, error: authError as Error }
      }

      if (!user) {
        return { hasCompleted: false, error: new Error('Non authentifié') }
      }

      // Requête Supabase : select has_completed_onboarding depuis profiles
      // La table profiles existe, la colonne has_completed_onboarding doit exister
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', user.id)
        .single()

      if (error) {
        // PGRST116 = No rows returned (profil n'existe pas encore)
        if (error.code === 'PGRST116') {
          return { hasCompleted: false, error: null }
        }

        // Erreur réseau
        if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('timeout')) {
          return { hasCompleted: false, error: new Error('Erreur réseau. Vérifiez votre connexion.') }
        }

        // Autre erreur Supabase (y compris PGRST205 si colonne manquante)
        // On retourne une erreur pour que le guard puisse gérer
        return { hasCompleted: false, error: error as Error }
      }

      // Succès : retourner le statut
      const hasCompleted = Boolean(data?.has_completed_onboarding)
      return { hasCompleted, error: null }
    } catch (err: any) {
      // Exception non catchée
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
        return { error: error as Error }
      }

      return { error: null }
    } catch (err: any) {
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
