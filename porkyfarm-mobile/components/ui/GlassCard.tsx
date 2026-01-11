/**
 * GlassCard - Card avec effet glassmorphism subtil
 * ================================================
 * Blur 12px, transparence 85%, border subtile
 */

import React, { ReactNode } from 'react'
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useTheme } from '../../contexts/ThemeContext'
import { spacing, radius, shadows } from '../../lib/theme/tokens'

interface GlassCardProps {
  children: ReactNode
  style?: ViewStyle
  onPress?: () => void
  disabled?: boolean
  /** Niveau d'elevation: 'flat' | 'raised' | 'floating' */
  elevation?: 'flat' | 'raised' | 'floating'
  /** Padding interne */
  padding?: keyof typeof spacing | number
  /** Border radius */
  borderRadius?: keyof typeof radius | number
  /** Desactiver l'animation press */
  noAnimation?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function GlassCard({
  children,
  style,
  onPress,
  disabled = false,
  elevation = 'raised',
  padding = 'lg',
  borderRadius = 'xl',
  noAnimation = false,
}: GlassCardProps) {
  const { colors, isDark } = useTheme()
  const scale = useSharedValue(1)

  const paddingValue = typeof padding === 'number' ? padding : spacing[padding]
  const radiusValue = typeof borderRadius === 'number' ? borderRadius : radius[borderRadius]

  const elevationStyles = {
    flat: shadows.none,
    raised: shadows.md,
    floating: shadows.glass,
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (!noAnimation && onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 })
    }
  }

  const handlePressOut = () => {
    if (!noAnimation && onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 })
    }
  }

  const glassStyle: ViewStyle = {
    backgroundColor: isDark
      ? 'rgba(31, 41, 55, 0.85)'
      : 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.3)',
    borderRadius: radiusValue,
    padding: paddingValue,
    ...elevationStyles[elevation],
  }

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[animatedStyle, glassStyle, disabled && styles.disabled, style]}
      >
        {children}
      </AnimatedPressable>
    )
  }

  return (
    <View style={[glassStyle, style]}>
      {children}
    </View>
  )
}

/**
 * GlassCardHeader - Header pour GlassCard
 */
interface GlassCardHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function GlassCardHeader({ title, subtitle, icon, action }: GlassCardHeaderProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {icon && <View style={styles.headerIcon}>{icon}</View>}
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {action && <View>{action}</View>}
    </View>
  )
}

/**
 * GlassCardContent - Contenu avec spacing
 */
export function GlassCardContent({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.content, style]}>{children}</View>
}

/**
 * GlassCardFooter - Footer avec actions
 */
export function GlassCardFooter({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme()

  return (
    <View style={[styles.footer, { borderTopColor: colors.border }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
})

export default GlassCard
