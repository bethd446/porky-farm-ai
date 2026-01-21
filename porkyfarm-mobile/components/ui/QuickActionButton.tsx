/**
 * QuickActionButton - Bouton action rapide
 * =========================================
 * Pour les grilles d'actions rapides
 * Migré de Moti vers React Native Animated
 */

import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSlideIn, useScalePress } from '@/hooks/useAnimations'

interface QuickActionButtonProps {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  iconBgColor?: string
  onPress: () => void
  style?: ViewStyle
  delay?: number
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  iconColor,
  iconBgColor,
  onPress,
  style,
  delay = 0,
}) => {
  const bgColor = iconBgColor || `${iconColor}15`
  const { slideIn, animatedStyle: slideStyle } = useSlideIn('bottom', 20, 300, delay)
  const { onPressIn, onPressOut, animatedStyle: pressStyle } = useScalePress(0.95)

  useEffect(() => {
    slideIn()
  }, [slideIn])

  return (
    <Animated.View style={[slideStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.container, pressStyle]}>
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
})

export default QuickActionButton
