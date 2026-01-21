/**
 * Card Component - VERSION SIMPLIFIÉE
 * =====================================
 * Carte avec couleurs string directes
 * Sans ThemeContext ni animations complexes
 */

import { ReactNode } from 'react'
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'

type CardVariant = 'default' | 'elevated' | 'outlined'

interface CardProps {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  variant?: CardVariant
  onPress?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  children,
  style,
  variant = 'default',
  onPress,
  padding = 'md',
}: CardProps) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return styles.default
      case 'elevated':
        return styles.elevated
      case 'outlined':
        return styles.outlined
      default:
        return styles.default
    }
  }

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 }
      case 'sm':
        return { padding: 12 }
      case 'md':
        return { padding: 16 }
      case 'lg':
        return { padding: 24 }
      default:
        return { padding: 16 }
    }
  }

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.base,
          getVariantStyle(),
          getPaddingStyle(),
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    )
  }

  return (
    <View style={[styles.base, getVariantStyle(), getPaddingStyle(), style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
})

export default Card
