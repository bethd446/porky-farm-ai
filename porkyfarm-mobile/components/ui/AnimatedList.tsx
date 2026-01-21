/**
 * AnimatedList - Liste animée avec stagger effect
 * ================================================
 * Animation d'entrée progressive pour les éléments de liste
 * Migré de Moti vers React Native Animated
 */

import React, { useEffect } from 'react'
import {
  FlatList,
  FlatListProps,
  RefreshControl,
  ViewStyle,
  StyleSheet,
  View,
  Text,
  Animated,
} from 'react-native'
import { useListItemAnimation, useCombinedAnimation } from '@/hooks/useAnimations'

// Composant wrapper pour chaque item avec animation
const AnimatedListItem: React.FC<{
  children: React.ReactNode
  index: number
  staggerDelay: number
  style?: ViewStyle
}> = ({ children, index, staggerDelay, style }) => {
  const { animate, animatedStyle } = useListItemAnimation(
    index,
    staggerDelay,
    300
  )

  useEffect(() => {
    animate()
  }, [animate])

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
}

// Composant Empty State animé
const AnimatedEmptyState: React.FC<{
  icon: string
  title: string
  message: string
}> = ({ icon, title, message }) => {
  const { animateIn, animatedStyle } = useCombinedAnimation({
    fade: true,
    scale: true,
    duration: 400,
  })

  useEffect(() => {
    animateIn()
  }, [animateIn])

  return (
    <Animated.View style={[styles.emptyContainer, animatedStyle]}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </Animated.View>
  )
}

interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  refreshing?: boolean
  onRefresh?: () => void
  emptyIcon?: string
  emptyTitle?: string
  emptyMessage?: string
  itemStyle?: ViewStyle
  staggerDelay?: number
}

export function AnimatedList<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing = false,
  onRefresh,
  emptyIcon = '📭',
  emptyTitle = 'Aucun élément',
  emptyMessage = 'La liste est vide pour le moment',
  itemStyle,
  staggerDelay = 50,
  ...props
}: AnimatedListProps<T>) {
  if (data.length === 0 && !refreshing) {
    return (
      <AnimatedEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
      />
    )
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => (
        <AnimatedListItem
          index={index}
          staggerDelay={Math.min(staggerDelay, 10)} // Cap delay for performance
          style={itemStyle}
        >
          {renderItem(item, index)}
        </AnimatedListItem>
      )}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={data.length === 0 ? styles.emptyList : undefined}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyList: {
    flexGrow: 1,
  },
})

export default AnimatedList
