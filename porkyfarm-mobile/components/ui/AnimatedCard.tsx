/**
 * AnimatedCard - Carte animée avec React Native Animated
 * ======================================================
 * Animation d'entrée fluide pour les cartes (fade + slide + scale)
 */

import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native'
import { useCombinedAnimation, useScalePress } from '@/hooks/useAnimations'

interface AnimatedCardProps {
  children: React.ReactNode
  onPress?: () => void
  delay?: number
  style?: ViewStyle
  disabled?: boolean
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  delay = 0,
  style,
  disabled = false,
}) => {
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
        styles.card,
        entryStyle,
        onPress && !disabled ? pressStyle : undefined,
        style,
      ]}
    >
      {children}
    </Animated.View>
  )

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
})

export default AnimatedCard
