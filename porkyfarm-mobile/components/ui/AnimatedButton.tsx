/**
 * AnimatedButton - Bouton animé avec React Native Animated
 * ========================================================
 * Animation de pression fluide (scale down on press)
 */

import React from 'react'
import { Text, StyleSheet, Pressable, Animated, ViewStyle, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useScalePress } from '@/hooks/useAnimations'

interface AnimatedButtonProps {
  title: string
  onPress: () => void
  icon?: keyof typeof Ionicons.glyphMap
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'small' | 'medium' | 'large'
  style?: ViewStyle
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  style,
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const { onPressIn, onPressOut, animatedStyle } = useScalePress(0.96)
  const isDisabled = disabled || loading

  const getBackgroundColor = () => {
    if (isDisabled) return '#D1D5DB'
    switch (variant) {
      case 'primary':
        return '#10B981'
      case 'secondary':
        return '#F3F4F6'
      case 'outline':
        return 'transparent'
      case 'danger':
        return '#EF4444'
      default:
        return '#10B981'
    }
  }

  const getTextColor = () => {
    if (isDisabled) return '#9CA3AF'
    switch (variant) {
      case 'primary':
        return '#FFFFFF'
      case 'secondary':
        return '#374151'
      case 'outline':
        return '#10B981'
      case 'danger':
        return '#FFFFFF'
      default:
        return '#FFFFFF'
    }
  }

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 }
      case 'medium':
        return { paddingVertical: 14, paddingHorizontal: 24 }
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32 }
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 }
    }
  }

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14
      case 'medium':
        return 16
      case 'large':
        return 18
      default:
        return 16
    }
  }

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          getPadding(),
          { backgroundColor: getBackgroundColor() },
          variant === 'outline' && styles.outline,
          fullWidth && styles.fullWidth,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={size === 'small' ? 16 : 20}
                color={getTextColor()}
                style={styles.icon}
              />
            )}
            <Text
              style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  outline: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  fullWidth: {
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
})

export default AnimatedButton
