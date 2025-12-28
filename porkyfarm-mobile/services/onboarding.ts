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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { hasCompleted: false, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', user.id)
        .single()

      if (error) {
        // Si le champ n'existe pas encore, considérer comme non complété
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          return { hasCompleted: false, error: null }
        }
        return { hasCompleted: false, error: error as Error }
      }

      return { hasCompleted: data?.has_completed_onboarding || false, error: null }
    } catch (err) {
      return { hasCompleted: false, error: err as Error }
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

