/**
 * Carte d'alerte premium (style UX Pilot + Ultra Design)
 * Fond pastel, icône dans un carré avec gradient, bordures colorées
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, typography, radius } from '../lib/designTokens'
import { premiumGradients, premiumShadows, premiumStyles } from '../lib/premiumStyles'

export type AlertType = 'temperature' | 'vaccination' | 'health' | 'gestation' | 'other'

interface AlertCardProps {
  type: AlertType
  title: string
  description: string
  timeAgo: string
  onPress?: () => void
  premium?: boolean
}

const getAlertConfig = (type: AlertType) => {
  switch (type) {
    case 'temperature':
      return {
        icon: '🌡️',
        bgColor: colors.warningLight,
        iconBg: '#f59e0b',
        borderColor: colors.warning,
      }
    case 'vaccination':
      return {
        icon: '💉',
        bgColor: colors.infoLight,
        iconBg: colors.info,
        borderColor: colors.info,
      }
    case 'health':
      return {
        icon: '🏥',
        bgColor: colors.errorLight,
        iconBg: colors.error,
        borderColor: colors.error,
      }
    case 'gestation':
      return {
        icon: '👶',
        bgColor: '#fce7f3',
        iconBg: '#ec4899',
        borderColor: '#ec4899',
      }
    default:
      return {
        icon: '⚠️',
        bgColor: colors.muted,
        iconBg: colors.mutedForeground,
        borderColor: colors.border,
      }
  }
}

export function AlertCard({ type, title, description, timeAgo, onPress, premium = true }: AlertCardProps) {
  const config = getAlertConfig(type)

  const getGradient = (): readonly [string, string, ...string[]] => {
    switch (type) {
      case 'temperature':
        return premiumGradients.warning.icon
      case 'vaccination':
        return premiumGradients.info.icon
      case 'health':
        return premiumGradients.error.icon
      case 'gestation':
        return ['#ec4899', '#f472b6'] as const
      default:
        return [config.iconBg, config.iconBg] as const
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: config.bgColor, borderColor: config.borderColor },
        premium && premiumShadows.card.soft,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {premium ? (
        <LinearGradient
          colors={getGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconSquare, premiumStyles.iconGradientContainer]}
        >
          <Text style={styles.icon}>{config.icon}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.iconSquare, { backgroundColor: config.iconBg }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    borderLeftWidth: 3, // Bordure gauche colorée pour premium
  },
  iconSquare: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  description: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    lineHeight: typography.fontSize.bodySmall * typography.lineHeight.normal,
  },
  timeAgo: {
    fontSize: typography.fontSize.caption,
    color: colors.subtleForeground,
  },
  chevron: {
    fontSize: 24,
    color: colors.mutedForeground,
    marginLeft: spacing.sm,
  },
})

