/**
 * AnimatedBadge - Badge avec animation de pulsation
 * ==================================================
 * Pour alertes, notifications, compteurs importants
 */

import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePulse, useFadeIn } from '@/hooks/useAnimations'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface AnimatedBadgeProps {
  label?: string | number
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: keyof typeof Ionicons.glyphMap
  pulse?: boolean
  dot?: boolean
  style?: ViewStyle
}

const variantColors = {
  default: {
    bg: '#ECFDF5',
    text: '#10B981',
  },
  success: {
    bg: '#ECFDF5',
    text: '#10B981',
  },
  warning: {
    bg: '#FEF3C7',
    text: '#F59E0B',
  },
  error: {
    bg: '#FEE2E2',
    text: '#EF4444',
  },
  info: {
    bg: '#DBEAFE',
    text: '#3B82F6',
  },
}

const sizeConfig = {
  sm: {
    paddingH: 8,
    paddingV: 2,
    fontSize: 11,
    iconSize: 12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    dotSize: 6,
  },
  md: {
    paddingH: 10,
    paddingV: 4,
    fontSize: 13,
    iconSize: 14,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    dotSize: 8,
  },
  lg: {
    paddingH: 12,
    paddingV: 6,
    fontSize: 15,
    iconSize: 16,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    dotSize: 10,
  },
}

export function AnimatedBadge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  pulse = false,
  dot = false,
  style,
}: AnimatedBadgeProps) {
  const { startPulse, stopPulse, animatedStyle: pulseStyle } = usePulse(0.95, 1.05)
  const { fadeIn, animatedStyle: fadeStyle } = useFadeIn(200)

  const colors = variantColors[variant]
  const config = sizeConfig[size]

  useEffect(() => {
    fadeIn()
  }, [fadeIn])

  useEffect(() => {
    if (pulse) {
      startPulse()
    } else {
      stopPulse()
    }
    return () => stopPulse()
  }, [pulse, startPulse, stopPulse])

  // Dot variant
  if (dot) {
    return (
      <Animated.View
        style={[
          styles.dot,
          {
            width: config.dotSize,
            height: config.dotSize,
            borderRadius: config.dotSize / 2,
            backgroundColor: colors.text,
          },
          fadeStyle,
          pulse ? pulseStyle : undefined,
          style,
        ]}
      />
    )
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: config.paddingH,
          paddingVertical: config.paddingV,
          minWidth: config.minWidth,
          height: config.height,
          borderRadius: config.borderRadius,
        },
        fadeStyle,
        pulse ? pulseStyle : undefined,
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={config.iconSize}
          color={colors.text}
          style={styles.icon}
        />
      )}
      {label !== undefined && (
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              fontSize: config.fontSize,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 4,
  },
  dot: {},
})

export default AnimatedBadge
