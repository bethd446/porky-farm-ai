/**
 * Carte d'alerte (style UX Pilot)
 * Fond pastel, icône dans un carré coloré
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, typography, radius, shadows } from '../lib/designTokens'

export type AlertType = 'temperature' | 'vaccination' | 'health' | 'gestation' | 'other'

interface AlertCardProps {
  type: AlertType
  title: string
  description: string
  timeAgo: string
  onPress?: () => void
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

export function AlertCard({ type, title, description, timeAgo, onPress }: AlertCardProps) {
  const config = getAlertConfig(type)

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconSquare, { backgroundColor: config.iconBg }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
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
    ...shadows.sm,
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

