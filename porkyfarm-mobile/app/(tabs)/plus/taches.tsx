/**
 * Taches - Gestion des taches de l'elevage
 * =========================================
 * Liste et suivi des taches a effectuer
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, FlatList, Animated, Easing, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { tasksService, Task } from '../../../services/tasks'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingScreen } from '../../../components/ui/LoadingScreen'
import { useRefresh } from '../../../contexts/RefreshContext'
import { logger } from '../../../lib/logger'

type FilterType = 'all' | 'pending' | 'completed'

// ═══════════════════════════════════════════════════════════════
// Animated Empty State Component
// ═══════════════════════════════════════════════════════════════
interface EmptyStateProps {
  filter: FilterType
}

function AnimatedEmptyState({ filter }: EmptyStateProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={[styles.emptyContainer, { opacity, transform: [{ scale }] }]}>
      <Ionicons name="checkbox" size={56} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Aucune tache</Text>
      <Text style={styles.emptyMessage}>
        {filter === 'pending'
          ? 'Toutes les taches sont terminees !'
          : filter === 'completed'
          ? 'Aucune tache terminee'
          : 'Commencez par ajouter une tache'}
      </Text>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════════
// Animated Task Item Component
// ═══════════════════════════════════════════════════════════════
interface TaskItemProps {
  item: Task
  index: number
  priority: 'high' | 'normal' | 'low'
  onToggle: (task: Task) => void
  onLongPress: (task: Task) => void
}

function AnimatedTaskItem({ item, index, priority, onToggle, onLongPress }: TaskItemProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateX = useRef(new Animated.Value(-20)).current
  const delay = index * 40

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        delay,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <Pressable
        style={styles.taskItem}
        onPress={() => onToggle(item)}
        onLongPress={() => onLongPress(item)}
      >
        <View style={[
          styles.checkbox,
          item.completed && styles.checkboxCompleted
        ]}>
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          )}
        </View>
        <View style={styles.taskContent}>
          <Text style={[
            styles.taskTitle,
            item.completed && styles.taskTitleCompleted
          ]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.taskDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          {item.due_date && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar" size={12} color="#9CA3AF" />
              <Text style={styles.dueDate}>
                {new Date(item.due_date).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </View>
        <View style={[
          styles.priorityBadge,
          priority === 'high' && styles.priorityHigh,
          priority === 'low' && styles.priorityLow,
        ]}>
          <Text style={styles.priorityText}>
            {priority === 'high' ? 'Urgent' : priority === 'low' ? 'Faible' : 'Normal'}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Screen Component
// ═══════════════════════════════════════════════════════════════
export default function TachesScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tasksVersion, refreshTasks } = useRefresh()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const loadTasks = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const { data, error: fetchError } = await tasksService.getAll()
      if (fetchError) throw fetchError
      setTasks(data || [])
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Recharger quand tasksVersion change (refresh global)
  useEffect(() => {
    loadTasks()
  }, [tasksVersion])

  // Recharger aussi au focus
  useFocusEffect(
    useCallback(() => {
      loadTasks()
    }, [loadTasks])
  )

  const toggleTask = async (task: Task) => {
    try {
      if (task.completed) {
        await tasksService.uncomplete(task.id)
      } else {
        await tasksService.complete(task.id)
      }
      refreshTasks() // Refresh global temps reel
    } catch (err: any) {
      logger.error('Erreur toggle task:', err)
    }
  }

  const handleDelete = async (task: Task) => {
    Alert.alert(
      'Supprimer',
      `Supprimer "${task.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const { error } = await tasksService.delete(task.id)
            if (error) {
              Alert.alert('Erreur', error.message)
            } else {
              refreshTasks() // Refresh global temps reel
            }
          },
        },
      ]
    )
  }

  const handleEdit = (task: Task) => {
    // Navigation vers l'ecran d'edition (a creer)
    router.push(`/(tabs)/plus/taches/${task.id}` as any)
  }

  const handleLongPress = (task: Task) => {
    Alert.alert(
      task.title,
      'Que voulez-vous faire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Modifier', onPress: () => handleEdit(task) },
        { text: 'Supprimer', style: 'destructive', onPress: () => handleDelete(task) },
      ]
    )
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  // Priorite basee sur le type de tache
  const getTaskPriority = (task: Task): 'high' | 'normal' | 'low' => {
    if (task.type === 'health') return 'high'
    if (task.type === 'reproduction') return 'high'
    if (task.type === 'feeding') return 'normal'
    return 'low'
  }

  if (loading && !refreshing) {
    return <LoadingScreen message="Chargement des taches..." />
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ErrorState message={error} onRetry={() => loadTasks()} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Taches</Text>
          <Text style={styles.subtitle}>
            {pendingCount} en attente - {completedCount} terminees
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'pending', label: 'En attente' },
          { key: 'completed', label: 'Terminees' },
        ].map((f) => (
          <Pressable
            key={f.key}
            style={[
              styles.filterButton,
              filter === f.key && styles.filterButtonActive
            ]}
            onPress={() => setFilter(f.key as FilterType)}
          >
            <Text style={[
              styles.filterText,
              filter === f.key && styles.filterTextActive
            ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => loadTasks(true)}
        ListEmptyComponent={() => <AnimatedEmptyState filter={filter} />}
        renderItem={({ item, index }) => {
          const priority = getTaskPriority(item)
          return (
            <AnimatedTaskItem
              item={item}
              index={index}
              priority={priority}
              onToggle={toggleTask}
              onLongPress={handleLongPress}
            />
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    marginLeft: 14,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityLow: {
    backgroundColor: '#E0F2FE',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
})
