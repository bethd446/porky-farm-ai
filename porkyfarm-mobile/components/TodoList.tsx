import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../contexts/AuthContext'
import { tasksService, type Task } from '../services/tasks'
import { colors, spacing, typography, radius } from '../lib/designTokens'
import { logger } from '../lib/logger'
import { elevation } from '../lib/design/elevation'
import { EmptyState } from './EmptyState'
import { CheckCircle2, Circle } from 'lucide-react-native'

export function TodoList() {
  const { user } = useAuthContext()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  const loadTasks = async () => {
    setLoading(true)
    const { data, error } = await tasksService.getToday()
    if (error) {
      // Ne pas logger les erreurs PGRST205 (table introuvable) comme des erreurs critiques
      // Le service retourne déjà [] avec error: null pour ces cas
      if (error.message?.includes('PGRST205') || error.message?.includes('not found')) {
        logger.warn('[TodoList] Table tasks not available, showing empty state')
      } else {
        logger.error('[TodoList] Error loading tasks:', error)
      }
    }
    // Toujours définir les tâches, même si vide (le service retourne [] pour PGRST205)
    setTasks(data || [])
    setLoading(false)
  }

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    const { error } = await tasksService.update(taskId, { completed: !isCompleted })
    if (error) {
      logger.error('[TodoList] Error updating task:', error)
    } else {
      loadTasks()
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Aucune tâche aujourd'hui"
          description="Toutes vos tâches sont terminées ! 🎉"
          emoji="✅"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do du jour</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskItem}
            onPress={() => toggleTask(item.id, item.completed)}
          >
            {item.completed ? (
              <CheckCircle2 size={24} color={colors.success} />
            ) : (
              <Circle size={24} color={colors.mutedForeground} />
            )}
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  item.completed && styles.taskTitleCompleted,
                ]}
              >
                {item.title}
              </Text>
              {item.description && (
                <Text style={styles.taskDescription}>{item.description}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...elevation.sm,
  },
  title: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.mutedForeground,
  },
  taskDescription: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
    marginTop: spacing.xs / 2,
  },
})
