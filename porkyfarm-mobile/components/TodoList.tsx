/**
 * Composant To-Do Liste quotidienne
 * Affiche les tâches du jour avec cases à cocher
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { tasksService, type Task } from '../services/tasks'
import { colors, spacing, typography, radius, shadows } from '../lib/designTokens'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react-native'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

interface TodoListProps {
  maxItems?: number
  showCompleted?: boolean
}

export function TodoList({ maxItems = 6, showCompleted = false }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: tasksError } = await tasksService.getToday()
      if (tasksError) throw tasksError

      let filteredTasks = data || []
      if (!showCompleted) {
        filteredTasks = filteredTasks.filter((t) => !t.completed)
      }
      if (maxItems) {
        filteredTasks = filteredTasks.slice(0, maxItems)
      }

      setTasks(filteredTasks)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        // Démarquer comme non complété
        await tasksService.update(taskId, { completed: false, completed_at: null })
      } else {
        // Marquer comme complété
        await tasksService.complete(taskId)
      }
      loadTasks() // Recharger la liste
    } catch (err) {
      console.error('Error toggling task:', err)
    }
  }

  const getTaskIcon = (task: Task) => {
    if (task.completed) {
      return <CheckCircle2 size={20} color={colors.success} />
    }
    if (task.due_time) {
      const now = new Date()
      const [hours, minutes] = task.due_time.split(':')
      const dueTime = new Date()
      dueTime.setHours(parseInt(hours, 10), parseInt(minutes, 10))
      if (dueTime < now) {
        return <AlertCircle size={20} color={colors.error} />
      }
    }
    return <Circle size={20} color={colors.mutedForeground} />
  }

  const getTaskTypeColor = (type: Task['type']) => {
    const colorsMap: Record<Task['type'], string> = {
      health: colors.error,
      feeding: colors.warning,
      cleaning: colors.info,
      reproduction: colors.primary,
      admin: colors.mutedForeground,
      other: colors.mutedForeground,
    }
    return colorsMap[type] || colors.mutedForeground
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error.message} onRetry={loadTasks} />
      </View>
    )
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Aucune tâche aujourd'hui"
          message="Toutes vos tâches sont terminées ! 🎉"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>To-Do du jour</Text>
        <Text style={styles.subtitle}>{tasks.filter((t) => !t.completed).length} tâche(s) restante(s)</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskItem, task.completed && styles.taskItemCompleted]}
            onPress={() => handleToggleComplete(task.id, task.completed)}
            activeOpacity={0.7}
          >
            <View style={styles.taskLeft}>
              {getTaskIcon(task)}
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={1}>
                    {task.description}
                  </Text>
                )}
                {task.due_time && (
                  <View style={styles.taskMeta}>
                    <Clock size={12} color={colors.mutedForeground} />
                    <Text style={styles.taskTime}>{task.due_time}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={[styles.taskTypeBadge, { backgroundColor: `${getTaskTypeColor(task.type)}20` }]}>
              <Text style={[styles.taskTypeText, { color: getTaskTypeColor(task.type) }]}>
                {task.type === 'health' ? 'Santé' : task.type === 'feeding' ? 'Alimentation' : task.type === 'cleaning' ? 'Nettoyage' : task.type === 'reproduction' ? 'Repro' : 'Autre'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.base,
    ...shadows.md,
  },
  header: {
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  list: {
    maxHeight: 400,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  taskItemCompleted: {
    opacity: 0.6,
    borderLeftColor: colors.success,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
    marginBottom: spacing.xs / 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.mutedForeground,
  },
  taskDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.xs / 2,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  taskTime: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
  },
  taskTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  taskTypeText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
  },
})

