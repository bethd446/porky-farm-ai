/**
 * Composant CostItem - Item de liste pour transaction financière
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing, typography, radius } from '../lib/designTokens'
import { elevation } from '../lib/design/elevation'
import type { CostEntry } from '../services/costs'

interface CostItemProps {
  entry: CostEntry
  onPress?: () => void
  onLongPress?: () => void
  isPending?: boolean
}

const getCategoryIcon = (category: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
    feed: 'barley',
    veterinary: 'hospital-box',
    equipment: 'wrench',
    labor: 'account-hard-hat',
    sale: 'cash',
    other: 'file-document-outline',
  }
  return icons[category] || 'file-document-outline'
}

const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    feed: '#FF9800',
    veterinary: '#E91E63',
    equipment: '#607D8B',
    labor: '#795548',
    sale: '#4CAF50',
    other: '#9E9E9E',
  }
  return categoryColors[category] || '#9E9E9E'
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    feed: 'Aliment',
    veterinary: 'Vétérinaire',
    equipment: 'Équipement',
    labor: 'Main d\'œuvre',
    sale: 'Vente',
    other: 'Autre',
  }
  return labels[category] || category
}

export function CostItem({ entry, onPress, onLongPress, isPending = false }: CostItemProps) {
  const isExpense = entry.type === 'expense'
  const amountColor = isExpense ? colors.error : colors.success

  return (
    <TouchableOpacity
      style={[styles.listItem, isPending && styles.pending]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Icône catégorie */}
      <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(entry.category) + '20' }]}>
        <MaterialCommunityIcons
          name={getCategoryIcon(entry.category)}
          size={24}
          color={getCategoryColor(entry.category)}
        />
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
          {entry.cost_date || entry.transaction_date
            ? new Date(entry.cost_date || entry.transaction_date!).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '-'
          }
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...elevation.xs,
  },
  pending: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
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
