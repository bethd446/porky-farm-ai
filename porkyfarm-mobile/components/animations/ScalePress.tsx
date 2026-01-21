/**
 * ScalePress - Animation de pression premium
 * Effet de scale avec retour haptique
 */

import React from 'react'
import { Pressable, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface ScalePressProps {
  children: React.ReactNode
  onPress?: () => void
  onLongPress?: () => void
  scale?: number
  haptic?: boolean
  hapticType?: 'light' | 'medium' | 'heavy'
  style?: ViewStyle
  disabled?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 400,
}

export function ScalePress({
  children,
  onPress,
  onLongPress,
  scale = 0.96,
  haptic = true,
  hapticType = 'light',
  style,
  disabled = false,
}: ScalePressProps) {
  const scaleValue = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }))

  const getHapticStyle = () => {
    switch (hapticType) {
      case 'heavy':
        return Haptics.ImpactFeedbackStyle.Heavy
      case 'medium':
        return Haptics.ImpactFeedbackStyle.Medium
      default:
        return Haptics.ImpactFeedbackStyle.Light
    }
  }

  const handlePressIn = () => {
    scaleValue.value = withSpring(scale, SPRING_CONFIG)
    if (haptic && !disabled) {
      Haptics.impactAsync(getHapticStyle())
    }
  }

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, SPRING_CONFIG)
  }

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style, disabled && { opacity: 0.5 }]}
    >
      {children}
    </AnimatedPressable>
  )
}
