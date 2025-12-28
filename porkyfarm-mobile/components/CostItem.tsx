/**
 * Composant CostItem - Item de liste pour transaction financière
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, typography, radius, commonStyles } from '../lib/designTokens'
import type { CostEntry } from '../services/costs'

interface CostItemProps {
  entry: CostEntry
  onPress?: () => void
  isPending?: boolean
}

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    pig_purchase: '🐷',
    feed: '🌾',
    vitamins: '💊',
    medication: '💉',
    transport: '🚚',
    veterinary: '🏥',
    labor: '👷',
    misc: '📋',
    sale: '💰',
    subsidy: '🎁',
    other: '📝',
  }
  return icons[category] || '📝'
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    pig_purchase: 'Achat sujet',
    feed: 'Aliment',
    vitamins: 'Vitamines',
    medication: 'Médicament',
    transport: 'Transport',
    veterinary: 'Vétérinaire',
    labor: 'Main d\'œuvre',
    misc: 'Divers',
    sale: 'Vente',
    subsidy: 'Subvention',
    other: 'Autre',
  }
  return labels[category] || category
}

export function CostItem({ entry, onPress, isPending = false }: CostItemProps) {
  const isExpense = entry.type === 'expense'
  const amountColor = isExpense ? colors.error : colors.success

  return (
    <TouchableOpacity
      style={[commonStyles.listItem, isPending && styles.pending]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icône catégorie */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon(entry.category)}</Text>
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category}>{getCategoryLabel(entry.category)}</Text>
          {isPending && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>En attente</Text>
            </View>
          )}
        </View>
        {entry.description && (
          <Text style={styles.description} numberOfLines={1}>
            {entry.description}
          </Text>
        )}
        <Text style={styles.date}>
          {new Date(entry.transaction_date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Montant */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isExpense ? '-' : '+'}
          {Number(entry.amount).toLocaleString('fr-FR')} FCFA
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pending: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  category: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  pendingBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  pendingText: {
    fontSize: typography.fontSize.caption,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },
  description: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  date: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
  },
})

