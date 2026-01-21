/**
 * StatCard - Carte de statistique standardisée
 * =============================================
 * Affiche une valeur avec icône et label
 */

import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '../../contexts/ThemeContext'
import { useCombinedAnimation, useScalePress } from '@/hooks/useAnimations'

interface StatCardProps {
  value: number | string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  iconBgColor?: string
  onPress?: () => void
  style?: ViewStyle
  delay?: number
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  iconColor,
  iconBgColor,
  onPress,
  style,
  delay = 0,
}) => {
  const colors = useColors()
  const bgColor = iconBgColor || `${iconColor}15`
  const { animateIn, animatedStyle: entryStyle } = useCombinedAnimation({
    fade: true,
    slide: 'bottom',
    scale: true,
    duration: 400,
    delay,
  })
  const { onPressIn, onPressOut, animatedStyle: pressStyle } = useScalePress(0.98)

  useEffect(() => {
    animateIn()
  }, [animateIn])

  const content = (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        entryStyle,
        onPress ? pressStyle : undefined,
        style,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </Animated.View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {content}
      </Pressable>
    )
  }

  return content
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
})

export default StatCard
