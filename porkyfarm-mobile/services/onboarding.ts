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

export interface OnboardingStatus {
  hasCompleted: boolean
  onboardingData?: any
  subscriptionTier?: string
  error?: Error | null
}

export interface OnboardingService {
  checkOnboardingStatus: () => Promise<OnboardingStatus>
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

      // Requête Supabase : SELECT id, has_completed_onboarding, onboarding_data, subscription_tier
      // FROM public.profiles WHERE id = auth.uid()
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding, onboarding_data, subscription_tier')
        .eq('id', user.id)
        .single()

      if (error) {
        // PGRST116 = No rows returned (profil n'existe pas encore)
        if (error.code === 'PGRST116') {
          return { hasCompleted: false, error: null }
        }

        // Erreur réseau
        if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('timeout')) {
          console.warn('[onboardingService] Network error:', error.message)
          return { hasCompleted: false, error: new Error('Erreur réseau. Vérifiez votre connexion.') }
        }

        // Autre erreur Supabase
        console.warn('[onboardingService] Supabase error:', error.message)
        return { hasCompleted: false, error: error as Error }
      }

      // Succès : retourner le statut avec données
      return {
        hasCompleted: Boolean(data?.has_completed_onboarding),
        onboardingData: data?.onboarding_data || null,
        subscriptionTier: data?.subscription_tier || 'free',
        error: null,
      }
    } catch (err: any) {
      // Exception non catchée
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

      // UPDATE public.profiles SET has_completed_onboarding = true, updated_at = now()
      // WHERE id = auth.uid()
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

      // UPDATE profiles SET onboarding_data = data, has_completed_onboarding = true
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_data: data as any,
          has_completed_onboarding: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        console.warn('[onboardingService] Error saving onboarding data:', error.message)
        return { error: error as Error }
      }
      return { error: null }
    } catch (err) {
      console.warn('[onboardingService] Exception saving onboarding data:', err)
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
            const tagNumber = `${categoryPrefix}-${String(i).padStart(3, '0')}`
            // Mapper category vers sex pour la table pigs
            const sex = category === 'sow' ? 'female' : category === 'boar' ? 'male' : 'unknown'
            
            await animalsService.create({
              tag_number: tagNumber,
              sex,
              breed: data.breeds[0] || null,
              status: 'active',
              birth_date: null,
              notes: null,
            })
          }
        }
      }

      // 3. Créer les tâches récurrentes quotidiennes
      await tasksService.createRecurringDailyTasks(data)

      // 4. Marquer l'onboarding comme complété (déjà fait dans saveOnboardingData)
      return { error: null }
    } catch (err) {
      console.warn('[onboardingService] Exception completing onboarding:', err)
      return { error: err as Error }
    }
  },
}
