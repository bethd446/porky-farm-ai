import { supabase } from './supabase/client'
import { animalsService } from './animals'
import { tasksService } from './tasks'
import { logger } from '../lib/logger'

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

export type OnboardingStatusResult = {
  hasCompleted: boolean
  onboardingData: any | null
  subscriptionTier: string
  hasError: boolean
  errorMessage?: string
}

export interface OnboardingService {
  checkOnboardingStatus: () => Promise<OnboardingStatusResult>
  markOnboardingCompleted: () => Promise<{ error: Error | null }>
  saveOnboardingData: (data: OnboardingData) => Promise<{ error: Error | null; persisted: boolean }>
  completeOnboarding: (data: OnboardingData) => Promise<{ error: Error | null; persisted: boolean }>
}

export const onboardingService: OnboardingService = {
  async checkOnboardingStatus(): Promise<OnboardingStatusResult> {
    logger.debug('[onboardingService] checkOnboardingStatus called')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          hasCompleted: false,
          onboardingData: null,
          subscriptionTier: 'free',
          hasError: true,
          errorMessage: authError?.message || 'Non authentifié',
        }
      }

      // Lire directement depuis profiles (suppression de la dépendance à ensure_profile_exists)
      // Essayer d'abord avec les colonnes spécifiques (sans subscription_tier qui n'existe pas)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, has_completed_onboarding, onboarding_data')
        .eq('id', user.id)
        .single()

      logger.debug('[onboardingService] Raw result:', { data, error })

      // Si erreur "column does not exist", essayer avec select('*') et gérer gracieusement
      if (error && (error.code === '42703' || error.message?.includes('does not exist'))) {
        logger.warn('[onboardingService] Colonnes manquantes, utilisation de select(*)')
        
        // Fallback : sélectionner toutes les colonnes et gérer l'absence
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (fallbackError) {
          // Si le profil n'existe vraiment pas, retourner une erreur claire
          if (fallbackError.code === 'PGRST116') {
            return {
              hasCompleted: false,
              onboardingData: null,
              subscriptionTier: 'free',
              hasError: true,
              errorMessage: 'Profil utilisateur introuvable. Exécutez scripts/010-fix-onboarding-columns-definitive.sql dans Supabase.',
            }
          }
          
          return {
            hasCompleted: false,
            onboardingData: null,
            subscriptionTier: 'free',
            hasError: true,
            errorMessage: fallbackError.message,
          }
        }

        const row: any = fallbackData ?? {}
        
        // Gérer l'absence des colonnes gracieusement
        return {
          hasCompleted: row.has_completed_onboarding ?? false,
          onboardingData: row.onboarding_data ?? null,
          subscriptionTier: 'free', // Valeur par défaut, subscription_tier n'existe pas dans le schéma
          hasError: false,
        }
      }

      if (error) {
        logger.warn('[onboardingService] Supabase error:', error.message)
        
        // Si le profil n'existe pas, retourner une erreur claire
        if (error.code === 'PGRST116') {
          return {
            hasCompleted: false,
            onboardingData: null,
            subscriptionTier: 'free',
            hasError: true,
            errorMessage: 'Profil utilisateur introuvable. Exécutez scripts/010-fix-onboarding-columns-definitive.sql dans Supabase.',
          }
        }
        
        return {
          hasCompleted: false,
          onboardingData: null,
          subscriptionTier: 'free',
          hasError: true,
          errorMessage: error.message,
        }
      }

      const row: any = data ?? {}

      return {
        hasCompleted: !!row.has_completed_onboarding,
        onboardingData: row.onboarding_data ?? null,
        subscriptionTier: 'free', // Valeur par défaut, subscription_tier n'existe pas dans le schéma
        hasError: false,
      }
    } catch (err: any) {
      logger.warn('[onboardingService] Unexpected error:', err)
      return {
        hasCompleted: false,
        onboardingData: null,
        subscriptionTier: 'free',
        hasError: true,
        errorMessage: err?.message ?? 'Unexpected error',
      }
    }
  },

  async markOnboardingCompleted(): Promise<{ error: Error | null }> {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return { error: new Error('Non authentifié') }

    // Mettre à jour directement (suppression de la dépendance à ensure_profile_exists)
    // Essayer de mettre à jour avec has_completed_onboarding
    const { error } = await supabase
      .from('profiles')
      .update({ has_completed_onboarding: true })
      .eq('id', userId)

    if (error) {
      // Si la colonne n'existe pas, retourner une erreur explicite
      if (error.code === '42703' || error.message?.includes('does not exist')) {
        logger.error('[onboardingService] Colonne has_completed_onboarding n\'existe pas. Exécutez scripts/010-fix-onboarding-columns-definitive.sql dans Supabase.')
        return { error: new Error('Colonne has_completed_onboarding manquante. Exécutez scripts/010-fix-onboarding-columns-definitive.sql dans Supabase.') }
      }
      logger.error('[onboardingService] Error marking completed:', error.message)
      return { error: error as Error }
    }

    // Vérifier que la mise à jour a bien été effectuée (relecture avec fallback)
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', userId)
      .single()

    // Si erreur "column does not exist", essayer avec select('*')
    if (verifyError && (verifyError.code === '42703' || verifyError.message?.includes('does not exist'))) {
      const { data: fallbackData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!fallbackData || !(fallbackData as any).has_completed_onboarding) {
        logger.error('[onboardingService] Verification failed: onboarding not persisted (retry)')
        return { error: new Error('Échec de la vérification : les données n\'ont pas été persistées') }
      }
    } else if (verifyError || !verifyData?.has_completed_onboarding) {
      logger.error('[onboardingService] Verification failed: onboarding not persisted')
      return { error: new Error('Échec de la vérification : les données n\'ont pas été persistées') }
    }

    return { error: null }
  },

  saveOnboardingData: async (data: OnboardingData): Promise<{ error: Error | null; persisted: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié'), persisted: false }

      // Construire l'objet de mise à jour
      const updateData: any = {
        onboarding_data: data as any,
        updated_at: new Date().toISOString(),
      }

      // Essayer d'abord avec has_completed_onboarding
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          has_completed_onboarding: true,
        })
        .eq('id', user.id)

      if (error) {
        // Si erreur "column does not exist", essayer sans has_completed_onboarding
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          logger.warn('[onboardingService] Colonnes manquantes. Exécutez scripts/008-fix-profiles-columns.sql dans Supabase.')
          // Sauvegarder au moins onboarding_data
          const { error: fallbackError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
          
          if (fallbackError) {
            logger.error('[onboardingService] Error saving onboarding data:', fallbackError.message)
            return { error: fallbackError as Error, persisted: false }
          }
          
          // Vérifier la persistance (relecture)
          const { data: verifyData, error: verifyError } = await supabase
            .from('profiles')
            .select('onboarding_data')
            .eq('id', user.id)
            .single()

          if (verifyError || !verifyData?.onboarding_data) {
            return { error: new Error('Échec de la vérification : les données n\'ont pas été persistées'), persisted: false }
          }

          return { error: null, persisted: true }
        }
        logger.error('[onboardingService] Error saving onboarding data:', error.message)
        return { error: error as Error, persisted: false }
      }

      // Vérifier la persistance (relecture après écriture)
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('onboarding_data, has_completed_onboarding')
        .eq('id', user.id)
        .single()

      if (verifyError) {
        logger.error('[onboardingService] Verification failed:', verifyError.message)
        return { error: new Error('Échec de la vérification : impossible de relire les données'), persisted: false }
      }

      // Vérifier que les données sont bien présentes
      if (!verifyData?.onboarding_data) {
        logger.error('[onboardingService] Verification failed: onboarding_data not found')
        return { error: new Error('Échec de la vérification : les données n\'ont pas été persistées'), persisted: false }
      }

      return { error: null, persisted: true }
    } catch (err) {
      logger.error('[onboardingService] Exception saving onboarding data:', err)
      return { error: err as Error, persisted: false }
    }
  },

  completeOnboarding: async (data: OnboardingData): Promise<{ error: Error | null; persisted: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié'), persisted: false }

      // 1. Sauvegarder les données d'onboarding (avec vérification de persistance)
      const saveResult = await onboardingService.saveOnboardingData(data)
      if (saveResult.error || !saveResult.persisted) {
        logger.error('[onboardingService] Failed to save onboarding data:', saveResult.error?.message)
        return { error: saveResult.error || new Error('Échec de la sauvegarde des données d\'onboarding'), persisted: false }
      }

      // 2. Créer les animaux automatiquement (avec vérification d'erreurs)
      const animalsToCreate: Array<{ category: 'sow' | 'boar' | 'piglet' | 'fattening'; count: number }> = [
        { category: 'sow', count: data.sows },
        { category: 'boar', count: data.boars },
        { category: 'fattening', count: data.fattening },
        { category: 'piglet', count: data.piglets },
      ]

      const createdAnimals: string[] = []
      const animalErrors: Error[] = []

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
            const sex = category === 'sow' ? 'female' : category === 'boar' ? 'male' : 'unknown'

            const { data: animal, error: animalError } = await animalsService.create({
              tag_number: tagNumber,
              sex,
              breed: data.breeds[0] || null,
              status: 'active',
              birth_date: null,
              notes: null,
            })

            if (animalError || !animal) {
              logger.error(`[onboardingService] Failed to create animal ${tagNumber}:`, animalError?.message)
              animalErrors.push(animalError || new Error(`Échec création ${tagNumber}`))
            } else {
              createdAnimals.push(animal.id)
            }
          }
        }
      }

      // Si aucune création d'animal n'a réussi, c'est un échec critique
      if (createdAnimals.length === 0 && data.totalPigs > 0) {
        logger.error('[onboardingService] No animals created despite totalPigs > 0')
        return { error: new Error('Échec de la création des animaux. Aucun animal n\'a pu être créé.'), persisted: false }
      }

      // Si certaines créations ont échoué, loguer mais continuer
      if (animalErrors.length > 0) {
        logger.warn(`[onboardingService] ${animalErrors.length} animal(s) failed to create, but ${createdAnimals.length} succeeded`)
      }

      // 3. Créer les tâches récurrentes quotidiennes (avec vérification d'erreurs)
      const { data: tasks, error: tasksError } = await tasksService.createRecurringDailyTasks(data)
      if (tasksError) {
        logger.error('[onboardingService] Failed to create tasks:', tasksError.message)
        // Les tâches ne sont pas critiques, on continue mais on logue l'erreur
        logger.warn('[onboardingService] Continuing despite task creation failure')
      } else if (!tasks || tasks.length === 0) {
        logger.warn('[onboardingService] No tasks created')
      }

      // 4. Marquer l'onboarding comme complété (avec vérification de persistance)
      const markResult = await onboardingService.markOnboardingCompleted()
      if (markResult.error) {
        logger.error('[onboardingService] Failed to mark onboarding as completed:', markResult.error.message)
        return { error: markResult.error, persisted: false }
      }

      // 5. Vérification finale : relire le statut pour confirmer la persistance complète
      const finalCheck = await onboardingService.checkOnboardingStatus()
      if (finalCheck.hasError || !finalCheck.hasCompleted) {
        logger.error('[onboardingService] Final verification failed: onboarding not marked as completed')
        return { error: new Error('Échec de la vérification finale : l\'onboarding n\'est pas marqué comme complété'), persisted: false }
      }

      return { error: null, persisted: true }
    } catch (err) {
      logger.error('[onboardingService] Exception completing onboarding:', err)
      return { error: err as Error, persisted: false }
    }
  },
}
