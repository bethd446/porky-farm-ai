/**
 * AnimalCard Component - Carte animal premium
 * ============================================
 */

import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { ScalePress } from '../animations'
import { Badge } from './Badge'
import { AnimalAvatar } from '../AnimalAvatar'
import { colors, typography, spacing, radius, shadows } from '../../lib/designTokens'
import { ChevronRight } from 'lucide-react-native'

type AnimalStatus = 'active' | 'sick' | 'pregnant' | 'nursing' | 'sold' | 'deceased'
type AnimalCategory = 'sow' | 'boar' | 'piglet' | 'fattening'
type HealthSeverity = 'critical' | 'high' | 'medium' | 'low'

interface AnimalCardProps {
  id: string
  tagNumber: string
  name?: string
  category: AnimalCategory
  status: AnimalStatus
  healthSeverity?: HealthSeverity | null
  age?: string
  weight?: number
  photoUrl?: string | null
  onPress: () => void
  style?: ViewStyle
}

const statusConfig: Record<AnimalStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  active: { label: 'Sain', variant: 'success' },
  sick: { label: 'Malade', variant: 'error' },
  pregnant: { label: 'Gestante', variant: 'info' },
  nursing: { label: 'Allaitante', variant: 'info' },
  sold: { label: 'Vendu', variant: 'default' as any },
  deceased: { label: 'Decede', variant: 'error' },
}

const healthSeverityConfig: Record<HealthSeverity, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  critical: { label: 'Critique', variant: 'error' },
  high: { label: 'Urgent', variant: 'warning' },
  medium: { label: 'Malade', variant: 'warning' },
  low: { label: 'Suivi', variant: 'info' },
}

const categoryLabels: Record<AnimalCategory, string> = {
  sow: 'Truie',
  boar: 'Verrat',
  piglet: 'Porcelet',
  fattening: 'Engraissement',
}

const categoryEmojis: Record<AnimalCategory, string> = {
  sow: '🐷',
  boar: '🐗',
  piglet: '🐽',
  fattening: '🐖',
}

export function AnimalCard({
  id,
  tagNumber,
  name,
  category,
  status,
  healthSeverity,
  age,
  weight,
  photoUrl,
  onPress,
  style,
}: AnimalCardProps) {
  // Priorité: healthSeverity > status
  const statusInfo = healthSeverity
    ? healthSeverityConfig[healthSeverity]
    : (statusConfig[status] || statusConfig.active)
  const categoryLabel = categoryLabels[category] || category

  return (
    <ScalePress onPress={onPress} scale={0.98}>
      <View style={[styles.card, style]}>
        {/* Avatar avec photo */}
        <AnimalAvatar
          photoUrl={photoUrl}
          category={category}
          name={name || tagNumber}
          size={52}
        />

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.tagNumber} numberOfLines={1}>
              {tagNumber}
            </Text>
            {name && (
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
            )}
          </View>

          <View style={styles.meta}>
            <Text style={styles.category}>{categoryLabel}</Text>
            {age && (
              <>
                <View style={styles.dot} />
                <Text style={styles.metaText}>{age}</Text>
              </>
            )}
            {weight && (
              <>
                <View style={styles.dot} />
                <Text style={styles.metaText}>{weight} kg</Text>
              </>
            )}
          </View>
        </View>

        {/* Status & Chevron */}
        <View style={styles.rightSection}>
          <Badge
            label={statusInfo.label}
            variant={statusInfo.variant}
            size="sm"
          />
          <ChevronRight size={20} color={colors.textMuted} style={styles.chevron} />
        </View>
      </View>
    </ScalePress>
  )
}

// Version compacte pour les listes longues
export function AnimalCardCompact({
  tagNumber,
  category,
  status,
  onPress,
}: Omit<AnimalCardProps, 'id' | 'age' | 'weight' | 'name'>) {
  const statusInfo = statusConfig[status] || statusConfig.active
  const categoryLabel = categoryLabels[category] || category
  const emoji = categoryEmojis[category] || '🐷'

  return (
    <ScalePress onPress={onPress} scale={0.98}>
      <View style={styles.cardCompact}>
        <Text style={styles.emojiCompact}>{emoji}</Text>
        <Text style={styles.tagNumberCompact} numberOfLines={1}>
          {tagNumber}
        </Text>
        <Text style={styles.categoryCompact}>{categoryLabel}</Text>
        <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
      </View>
    </ScalePress>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  tagNumber: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  name: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  metaText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  // Compact
  cardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    ...shadows.sm,
  },
  emojiCompact: {
    fontSize: 20,
  },
  tagNumberCompact: {
    flex: 1,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  categoryCompact: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
})
