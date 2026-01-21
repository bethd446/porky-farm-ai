/**
 * Service Tasks - ADAPTÉ POUR FARM_ID (V2.0)
 * ===========================================
 * Gestion des tâches quotidiennes liées à une ferme
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { logger } from '../lib/logger'
import { getNowISO, getTodayISO, toISODateString } from '../lib/dateUtils'
import { DEFAULT_TASK_TIMES } from '../lib/constants/config'
import { getCurrentFarmId } from '../lib/farmHelpers'
import { notificationService } from './notifications'

// Type for task metadata
export interface TaskMetadata {
  category?: 'sow' | 'boar' | 'piglet' | 'fattening'
  ration?: number
  [key: string]: string | number | boolean | undefined
}

// Type for onboarding data used to create tasks
export interface OnboardingTaskData {
  feedingFrequency?: 'twice' | 'thrice'
  sows?: number
  piglets?: number
  fattening?: number
  rationSows?: number
  rationPiglets?: number
  rationFattening?: number
}

// Interface alignée avec la table tasks (V2.0)
export interface Task {
  id: string
  farm_id: string
  title: string
  description: string | null
  type: 'health' | 'feeding' | 'cleaning' | 'reproduction' | 'admin' | 'other'
  frequency: 'daily' | 'weekly' | 'event_based' | 'one_time'
  due_date: string | null
  due_time: string | null
  completed: boolean
  completed_at: string | null
  related_animal_id: string | null
  related_health_case_id: string | null
  related_gestation_id: string | null
  metadata: TaskMetadata | null
  created_at: string
  updated_at: string | null
  // Compatibilité
  user_id?: string
}

export interface TaskInsert {
  title: string
  description?: string | null
  type: 'health' | 'feeding' | 'cleaning' | 'reproduction' | 'admin' | 'other'
  frequency: 'daily' | 'weekly' | 'event_based' | 'one_time'
  due_date?: string | null
  due_time?: string | null
  related_animal_id?: string | null
  related_health_case_id?: string | null
  related_gestation_id?: string | null
  metadata?: TaskMetadata | null
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  type?: 'health' | 'feeding' | 'cleaning' | 'reproduction' | 'admin' | 'other'
  frequency?: 'daily' | 'weekly' | 'event_based' | 'one_time'
  due_date?: string | null
  due_time?: string | null
  completed?: boolean
  completed_at?: string | null
  related_animal_id?: string | null
  related_health_case_id?: string | null
  related_gestation_id?: string | null
  metadata?: TaskMetadata | null
}

export interface TasksService {
  getAll: (filters?: { completed?: boolean; type?: string; dueDate?: string }, farmId?: string) => Promise<{ data: Task[] | null; error: Error | null }>
  getToday: (farmId?: string) => Promise<{ data: Task[] | null; error: Error | null }>
  getPending: (farmId?: string) => Promise<{ data: Task[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Task | null; error: Error | null }>
  create: (task: TaskInsert, farmId?: string) => Promise<{ data: Task | null; error: Error | null }>
  update: (id: string, updates: TaskUpdate) => Promise<{ data: Task | null; error: Error | null }>
  complete: (id: string) => Promise<{ data: Task | null; error: Error | null }>
  uncomplete: (id: string) => Promise<{ data: Task | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
  createRecurringDailyTasks: (onboardingData: OnboardingTaskData, farmId?: string) => Promise<{ data: Task[] | null; error: Error | null }>
  getStats: (farmId?: string) => Promise<{ data: { total: number; completed: number; pending: number; byType: Record<string, number> }; error: Error | null }>
}

export const tasksService: TasksService = {
  /**
   * Récupérer toutes les tâches avec filtres
   */
  getAll: async (filters = {}, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('farm_id', targetFarmId)

      if (filters.completed !== undefined) {
        query = query.eq('completed', filters.completed)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.dueDate) {
        query = query.eq('due_date', filters.dueDate)
      }

      return safeSupabaseQuery<Task[]>(
        async () => await query.order('due_date', { ascending: true }).order('due_time', { ascending: true }),
        'tasks',
        true
      )
    } catch (err) {
      logger.error('[tasks.getAll] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les tâches du jour
   */
  getToday: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      const today = getTodayISO()

      return safeSupabaseQuery<Task[]>(
        async () =>
          await supabase
            .from('tasks')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('completed', false)
            .or(`due_date.is.null,due_date.eq.${today},frequency.eq.daily`)
            .order('due_time', { ascending: true }),
        'tasks',
        true
      )
    } catch (err) {
      logger.error('[tasks.getToday] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les tâches en attente
   */
  getPending: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Task[]>(
        async () =>
          await supabase
            .from('tasks')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('completed', false)
            .order('due_date', { ascending: true })
            .order('due_time', { ascending: true }),
        'tasks',
        true
      )
    } catch (err) {
      logger.error('[tasks.getPending] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer une tâche par ID
   */
  getById: async (id: string) => {
    try {
      return safeSupabaseQuery<Task>(
        async () =>
          await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single(),
        'tasks',
        false
      )
    } catch (err) {
      logger.error('[tasks.getById] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Créer une tâche
   */
  create: async (task: TaskInsert, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      const result = await safeSupabaseQuery<Task>(
        async () =>
          await supabase
            .from('tasks')
            .insert({
              ...task,
              farm_id: targetFarmId,
              completed: false,
            })
            .select()
            .single(),
        'tasks',
        false
      )

      // Planifier la notification si la tâche a une date/heure
      if (result.data && result.data.due_date && result.data.due_time) {
        await scheduleTaskNotification(result.data)
      }

      return result
    } catch (err) {
      logger.error('[tasks.create] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Mettre à jour une tâche
   */
  update: async (id: string, updates: TaskUpdate) => {
    try {
      const result = await safeSupabaseQuery<Task>(
        async () =>
          await supabase
            .from('tasks')
            .update({ ...updates, updated_at: getNowISO() })
            .eq('id', id)
            .select()
            .single(),
        'tasks',
        false
      )

      // Replanifier la notification si nécessaire
      if (result.data && result.data.due_date && result.data.due_time && !result.data.completed) {
        await scheduleTaskNotification(result.data)
      }

      return result
    } catch (err) {
      logger.error('[tasks.update] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Marquer une tâche comme complétée
   */
  complete: async (id: string) => {
    try {
      const now = getNowISO()

      const result = await safeSupabaseQuery<Task>(
        async () =>
          await supabase
            .from('tasks')
            .update({
              completed: true,
              completed_at: now,
              updated_at: now,
            })
            .eq('id', id)
            .select()
            .single(),
        'tasks',
        false
      )

      // Annuler la notification
      if (result.data) {
        await notificationService.cancelNotification(`task_${id}`)
      }

      return result
    } catch (err) {
      logger.error('[tasks.complete] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Marquer une tâche comme non complétée
   */
  uncomplete: async (id: string) => {
    try {
      return safeSupabaseQuery<Task>(
        async () =>
          await supabase
            .from('tasks')
            .update({
              completed: false,
              completed_at: null,
              updated_at: getNowISO(),
            })
            .eq('id', id)
            .select()
            .single(),
        'tasks',
        false
      )
    } catch (err) {
      logger.error('[tasks.uncomplete] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer une tâche
   */
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[tasks.delete] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Créer les tâches récurrentes (onboarding)
   */
  createRecurringDailyTasks: async (onboardingData: OnboardingTaskData, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      const tasks: TaskInsert[] = []

      // Tâches d'alimentation basées sur la fréquence
      const feedingFrequency = onboardingData.feedingFrequency || 'twice'
      const feedingTimes = feedingFrequency === 'thrice'
        ? [DEFAULT_TASK_TIMES.morning, DEFAULT_TASK_TIMES.midday, DEFAULT_TASK_TIMES.evening]
        : [DEFAULT_TASK_TIMES.morning, DEFAULT_TASK_TIMES.evening]

      if ((onboardingData.sows ?? 0) > 0) {
        feedingTimes.forEach((time) => {
          tasks.push({
            title: `Nourrir les truies (${time})`,
            description: `Ration quotidienne: ${onboardingData.rationSows ?? 2.5} kg/sujet`,
            type: 'feeding',
            frequency: 'daily',
            due_time: time,
            metadata: { category: 'sow', ration: onboardingData.rationSows ?? 2.5 },
          })
        })
      }

      if ((onboardingData.piglets ?? 0) > 0) {
        feedingTimes.forEach((time) => {
          tasks.push({
            title: `Nourrir les porcelets (${time})`,
            description: `Ration quotidienne: ${onboardingData.rationPiglets ?? 0.5} kg/sujet`,
            type: 'feeding',
            frequency: 'daily',
            due_time: time,
            metadata: { category: 'piglet', ration: onboardingData.rationPiglets ?? 0.5 },
          })
        })
      }

      if ((onboardingData.fattening ?? 0) > 0) {
        feedingTimes.forEach((time) => {
          tasks.push({
            title: `Nourrir les porcs d'engraissement (${time})`,
            description: `Ration quotidienne: ${onboardingData.rationFattening ?? 3} kg/sujet`,
            type: 'feeding',
            frequency: 'daily',
            due_time: time,
            metadata: { category: 'fattening', ration: onboardingData.rationFattening ?? 3 },
          })
        })
      }

      // Tâches de santé
      tasks.push({
        title: 'Vérifier l\'état de santé général',
        description: 'Inspecter tous les animaux pour détecter les signes de maladie',
        type: 'health',
        frequency: 'daily',
        due_time: DEFAULT_TASK_TIMES.inspection,
      })

      // Tâches de nettoyage
      tasks.push({
        title: 'Nettoyer les principales cases',
        description: 'Maintenir l\'hygiène des installations',
        type: 'cleaning',
        frequency: 'daily',
        due_time: DEFAULT_TASK_TIMES.cleaning,
      })

      // Insérer toutes les tâches
      return safeSupabaseQuery<Task[]>(
        async () =>
          await supabase
            .from('tasks')
            .insert(tasks.map((t) => ({ ...t, farm_id: targetFarmId, completed: false })))
            .select(),
        'tasks',
        true
      )
    } catch (err) {
      logger.error('[tasks.createRecurringDailyTasks] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Obtenir les statistiques des tâches
   */
  getStats: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return {
          data: { total: 0, completed: 0, pending: 0, byType: {} },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('type, completed')
        .eq('farm_id', targetFarmId)

      if (error) {
        return {
          data: { total: 0, completed: 0, pending: 0, byType: {} },
          error: new Error(error.message),
        }
      }

      const entries = data || []
      const byType: Record<string, number> = {}
      entries.forEach((t) => {
        byType[t.type] = (byType[t.type] || 0) + 1
      })

      return {
        data: {
          total: entries.length,
          completed: entries.filter((t) => t.completed).length,
          pending: entries.filter((t) => !t.completed).length,
          byType,
        },
        error: null,
      }
    } catch (err) {
      logger.error('[tasks.getStats] Error:', err)
      return {
        data: { total: 0, completed: 0, pending: 0, byType: {} },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },
}

/**
 * Planifier une notification pour une tâche
 */
async function scheduleTaskNotification(task: Task): Promise<void> {
  if (!task.due_date || !task.due_time) return

  try {
    const [hours, minutes] = task.due_time.split(':').map(Number)
    const scheduledDate = new Date(task.due_date)
    scheduledDate.setHours(hours, minutes, 0, 0)

    // Si la tâche est récurrente, planifier une notification quotidienne
    if (task.frequency === 'daily') {
      await notificationService.scheduleDailyNotification(
        `task_${task.id}`,
        `🔔 ${task.title}`,
        task.description || 'Tâche à effectuer',
        hours,
        Math.max(0, minutes - 15) // 15 minutes avant
      )
    } else {
      // Notification unique
      await notificationService.scheduleTaskNotification(
        task.id,
        `🔔 ${task.title}`,
        task.description || 'Tâche à effectuer',
        scheduledDate,
        15
      )
    }
  } catch (error) {
    logger.error('[tasks] Error scheduling notification:', error)
  }
}

export default tasksService
