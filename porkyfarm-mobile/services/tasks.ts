import { supabase } from './supabase/client'

export interface Task {
  id: string
  user_id: string
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
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string | null
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
  metadata?: Record<string, any> | null
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
  metadata?: Record<string, any> | null
}

export interface TasksService {
  getAll: (filters?: { completed?: boolean; type?: string; dueDate?: string }) => Promise<{ data: Task[] | null; error: Error | null }>
  getToday: () => Promise<{ data: Task[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Task | null; error: Error | null }>
  create: (task: TaskInsert) => Promise<{ data: Task | null; error: Error | null }>
  update: (id: string, updates: TaskUpdate) => Promise<{ data: Task | null; error: Error | null }>
  complete: (id: string) => Promise<{ data: Task | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
  createRecurringDailyTasks: (onboardingData: any) => Promise<{ data: Task[] | null; error: Error | null }>
}

export const tasksService: TasksService = {
  getAll: async (filters = {}) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      let query = supabase.from('tasks').select('*').eq('user_id', user.id)

      if (filters.completed !== undefined) {
        query = query.eq('completed', filters.completed)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.dueDate) {
        query = query.eq('due_date', filters.dueDate)
      }

      const { data, error } = await query.order('due_date', { ascending: true }).order('due_time', { ascending: true })

      if (error) return { data: null, error: error as Error }
      return { data: data as Task[], error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  getToday: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .or(`due_date.is.null,due_date.eq.${today},frequency.eq.daily`)
        .order('due_time', { ascending: true })

      if (error) return { data: null, error: error as Error }
      return { data: data as Task[], error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  getById: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Task, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  create: async (task: TaskInsert) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Task, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  update: async (id: string, updates: TaskUpdate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Task, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  complete: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data: data as Task, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  delete: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié') }

      const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },

  createRecurringDailyTasks: async (onboardingData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const tasks: TaskInsert[] = []

      // Tâches d'alimentation basées sur la fréquence
      const feedingFrequency = onboardingData.feedingFrequency || 'twice'
      const feedingTimes = feedingFrequency === 'twice' ? ['08:00', '18:00'] : ['08:00', '13:00', '18:00']

      if (onboardingData.sows > 0) {
        feedingTimes.forEach((time) => {
          tasks.push({
            title: `Nourrir les truies (${time})`,
            description: `Ration quotidienne: ${onboardingData.rationSows || 2.5} kg/sujet`,
            type: 'feeding',
            frequency: 'daily',
            due_time: time,
            metadata: { category: 'sow', ration: onboardingData.rationSows || 2.5 },
          })
        })
      }

      if (onboardingData.piglets > 0) {
        feedingTimes.forEach((time) => {
          tasks.push({
            title: `Nourrir les porcelets (${time})`,
            description: `Ration quotidienne: ${onboardingData.rationPiglets || 0.5} kg/sujet`,
            type: 'feeding',
            frequency: 'daily',
            due_time: time,
            metadata: { category: 'piglet', ration: onboardingData.rationPiglets || 0.5 },
          })
        })
      }

      if (onboardingData.fattening > 0) {
        feedingTimes.forEach((time) => {
          tasks.push({
            title: `Nourrir les porcs d'engraissement (${time})`,
            description: `Ration quotidienne: ${onboardingData.rationFattening || 3} kg/sujet`,
            type: 'feeding',
            frequency: 'daily',
            due_time: time,
            metadata: { category: 'fattening', ration: onboardingData.rationFattening || 3 },
          })
        })
      }

      // Tâches de santé
      tasks.push({
        title: 'Vérifier l\'état de santé général',
        description: 'Inspecter tous les animaux pour détecter les signes de maladie',
        type: 'health',
        frequency: 'daily',
        due_time: '09:00',
      })

      // Tâches de nettoyage
      tasks.push({
        title: 'Nettoyer les principales cases',
        description: 'Maintenir l\'hygiène des installations',
        type: 'cleaning',
        frequency: 'daily',
        due_time: '10:00',
      })

      // Insérer toutes les tâches
      const { data, error } = await supabase
        .from('tasks')
        .insert(tasks.map((t) => ({ ...t, user_id: user.id })))
        .select()

      if (error) return { data: null, error: error as Error }
      return { data: data as Task[], error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },
}

