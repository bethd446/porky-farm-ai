/**
 * Badge Component - Indicateur de notification/compteur
 * =====================================================
 */

import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { typography, spacing } from '../../lib/designTokens'
import { useColors } from '../../contexts/ThemeContext'
import { ThemeColors } from '../../lib/theme/tokens'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  label?: string | number
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  style?: ViewStyle
}

const getVariantStyles = (colors: ThemeColors) => ({
  default: {
    backgroundColor: colors.primarySurface,
    color: colors.primary,
  },
  success: {
    backgroundColor: colors.successLight,
    color: colors.success,
  },
  warning: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
  },
  error: {
    backgroundColor: colors.errorLight,
    color: colors.error,
  },
  info: {
    backgroundColor: colors.infoLight,
    color: colors.info,
  },
})

const sizeStyles = {
  sm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    fontSize: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
  md: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.small,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  lg: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.bodySmall,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
  },
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
  style,
}: BadgeProps) {
  const colors = useColors()
  const variantStyles = getVariantStyles(colors)
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: variantStyle.backgroundColor },
          style,
        ]}
      />
    )
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyle.backgroundColor },
        {
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          minWidth: sizeStyle.minWidth,
          height: sizeStyle.height,
          borderRadius: sizeStyle.borderRadius,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: variantStyle.color, fontSize: sizeStyle.fontSize },
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})
