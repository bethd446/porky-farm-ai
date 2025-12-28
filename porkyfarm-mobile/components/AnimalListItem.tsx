/**
 * Item de liste animal premium (style UX Pilot + Ultra Design)
 * Photo avec ombre, badge avec gradient, alignements pixel perfect
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, typography, radius } from '../lib/designTokens'
import { premiumGradients, premiumShadows, premiumStyles } from '../lib/premiumStyles'
import type { Animal } from '../services/animals'

interface AnimalListItemProps {
  animal: Animal
  onPress?: () => void
  premium?: boolean
}

const getStatusBadge = (status: string, category: string) => {
  // Mapper les statuts DB vers les labels français
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    active: { label: 'Sain', color: colors.success, bgColor: colors.successLight },
    sick: { label: 'Soins', color: colors.warning, bgColor: colors.warningLight },
    pregnant: { label: 'Gestation', color: '#ec4899', bgColor: '#fce7f3' },
    nursing: { label: 'Allaitement', color: colors.info, bgColor: colors.infoLight },
    sold: { label: 'Vendu', color: colors.mutedForeground, bgColor: colors.muted },
    deceased: { label: 'Décédé', color: colors.error, bgColor: colors.errorLight },
  }

  // Si c'est un porcelet, afficher "Porcelet" au lieu du statut
  if (category === 'piglet') {
    return { label: 'Porcelet', color: colors.info, bgColor: colors.infoLight }
  }

  return statusMap[status] || { label: status, color: colors.mutedForeground, bgColor: colors.muted }
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    sow: 'Truie',
    boar: 'Verrat',
    piglet: 'Porcelet',
    fattening: 'Porc',
  }
  return labels[category] || category
}

const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return 'Âge inconnu'
  const birth = new Date(birthDate)
  const now = new Date()
  const months = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} jour${days > 1 ? 's' : ''}`
  }
  if (months < 12) {
    return `${months} mois`
  }
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) {
    return `${years} an${years > 1 ? 's' : ''}`
  }
  return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`
}

export function AnimalListItem({ animal, onPress, premium = true }: AnimalListItemProps) {
  const badge = getStatusBadge(animal.status, animal.category)
  const age = calculateAge(animal.birth_date)
  const identifier = animal.identifier || `Porc #${animal.id.slice(0, 6)}`

  const getBadgeGradient = (): readonly [string, string, ...string[]] => {
    if (badge.color === colors.success) return premiumGradients.success.icon
    if (badge.color === colors.warning) return premiumGradients.warning.icon
    if (badge.color === colors.info) return premiumGradients.info.icon
    if (badge.color === colors.error) return premiumGradients.error.icon
    return [badge.bgColor, badge.bgColor] as const
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        premium && premiumShadows.card.soft,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Photo avec ombre premium */}
      <View style={[
        styles.photoContainer,
        premium && premiumShadows.icon.soft,
      ]}>
        {animal.photo ? (
          <Image source={{ uri: animal.photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>🐷</Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.identifier}>{identifier}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{age}</Text>
          {animal.weight && (
            <>
              <Text style={styles.metaSeparator}> • </Text>
              <Text style={styles.metaText}>{animal.weight} kg</Text>
            </>
          )}
        </View>
      </View>

      {/* Badge statut avec gradient premium */}
      {premium ? (
        <LinearGradient
          colors={getBadgeGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.badge, premiumStyles.badge]}
        >
          <Text style={[styles.badgeText, { color: '#ffffff' }]}>{badge.label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      )}

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: spacing.base,
    backgroundColor: colors.muted,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
  },
  photoPlaceholderText: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  identifier: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  metaSeparator: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
  },
  chevron: {
    fontSize: 24,
    color: colors.mutedForeground,
  },
})

