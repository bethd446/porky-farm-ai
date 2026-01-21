/**
 * Shimmer - Skeleton loading premium
 * Effet de chargement anime elegant
 */

import React, { useEffect } from 'react'
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../contexts/ThemeContext'

interface ShimmerProps {
  width: DimensionValue
  height: number
  borderRadius?: number
  style?: ViewStyle
}

export function Shimmer({
  width,
  height,
  borderRadius = 8,
  style,
}: ShimmerProps) {
  const { colors, isDark } = useTheme()
  const translateX = useSharedValue(-1)

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    )
  }, [translateX])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [-1, 1],
          [-200, 200]
        ),
      },
    ],
  }))

  const baseColor = isDark ? '#1E3D2E' : '#E8F0EB'
  const highlightColor = isDark ? '#2D4A3A' : '#F5FAF7'

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', highlightColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  )
}

// Skeleton Card pre-construit
export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.row}>
        <Shimmer width={48} height={48} borderRadius={12} />
        <View style={skeletonStyles.content}>
          <Shimmer width="60%" height={16} />
          <Shimmer width="40%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  )
}

// Skeleton Stat Card
export function SkeletonStatCard() {
  return (
    <View style={skeletonStyles.statCard}>
      <Shimmer width={44} height={44} borderRadius={12} />
      <Shimmer width={60} height={28} style={{ marginTop: 8 }} />
      <Shimmer width={80} height={14} style={{ marginTop: 4 }} />
    </View>
  )
}

// Skeleton List
interface SkeletonListProps {
  count?: number
}

export function SkeletonList({ count = 3 }: SkeletonListProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  )
}

const skeletonStyles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
})
