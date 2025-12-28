/**
 * Composant LoadingSkeleton (React Native)
 * Pour afficher un skeleton loader pendant le chargement
 */

import { View, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { colors, spacing, radius } from '../lib/designTokens'

interface LoadingSkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: any
}

export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = radius.sm,
  style,
}: LoadingSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  )
}

// Skeleton pour carte d'animal
export function AnimalCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <LoadingSkeleton width={60} height={60} borderRadius={radius.md} />
      <View style={skeletonStyles.content}>
        <LoadingSkeleton width="70%" height={18} style={skeletonStyles.line} />
        <LoadingSkeleton width="50%" height={14} style={skeletonStyles.line} />
      </View>
    </View>
  )
}

// Skeleton pour carte de stats
export function StatCardSkeleton() {
  return (
    <View style={skeletonStyles.statCard}>
      <LoadingSkeleton width="40%" height={32} style={skeletonStyles.value} />
      <LoadingSkeleton width="60%" height={16} style={skeletonStyles.label} />
      <LoadingSkeleton width="50%" height={14} style={skeletonStyles.change} />
    </View>
  )
}

const skeletonStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.base,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  line: {
    marginBottom: spacing.xs,
  },
  statCard: {
    backgroundColor: colors.card,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  value: {
    marginBottom: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  change: {},
})

