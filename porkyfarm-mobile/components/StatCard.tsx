/**
 * Carte de statistique premium (mobile)
 * Avec gradient sur icône, ombres douces, animations
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { LucideIcon } from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../lib/designTokens'
import { premiumGradients, premiumShadows, premiumStyles } from '../lib/premiumStyles'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  variant?: 'primary' | 'success' | 'warning' | 'info'
  onPress?: () => void
  premium?: boolean
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  variant = 'primary',
  onPress,
  premium = true,
}: StatCardProps) {
  const getGradient = () => {
    switch (variant) {
      case 'success':
        return premiumGradients.success.icon
      case 'warning':
        return premiumGradients.warning.icon
      case 'info':
        return premiumGradients.info.icon
      default:
        return premiumGradients.primary.medium
    }
  }

  const getIconColor = () => {
    if (iconColor) return iconColor
    switch (variant) {
      case 'success':
        return colors.success
      case 'warning':
        return colors.warning
      case 'info':
        return colors.info
      default:
        return colors.primary
    }
  }

  const Component = onPress ? TouchableOpacity : View

  return (
    <Component
      style={[
        styles.container,
        premium && styles.containerPremium,
        premium && premiumShadows.card.soft,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        {premium ? (
          <LinearGradient
            colors={getGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconContainer, premiumStyles.iconGradientContainer]}
          >
            <Icon size={20} color="#ffffff" />
          </LinearGradient>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
            <Icon size={20} color={getIconColor()} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </Component>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  containerPremium: {
    // Styles premium ajoutés via premiumShadows
  },
  content: {
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  textContainer: {
    gap: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  label: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    fontWeight: typography.fontWeight.medium,
  },
})

