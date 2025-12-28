/**
 * Écran liste des transactions financières (Coûts & Finances)
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { costsService, type CostEntry } from '../../../services/costs'
import { CostItem } from '../../../components/CostItem'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ErrorState'
import { LoadingSkeleton, AnimalCardSkeleton } from '../../../components/LoadingSkeleton'
import { colors, spacing, typography, commonStyles } from '../../../lib/designTokens'

type FilterType = 'all' | 'expense' | 'income'

export default function CostsScreen() {
  const router = useRouter()
  const [costs, setCosts] = useState<CostEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    loadCosts()
  }, [])

  const loadCosts = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await costsService.getAll()
    if (err) {
      setError(err)
    } else {
      setCosts(data || [])
    }
    setLoading(false)
  }

  const filteredCosts = costs.filter((cost) => {
    if (filter === 'all') return true
    return cost.type === filter
  })

  const getTotalExpenses = () => {
    return filteredCosts
      .filter((c) => c.type === 'expense')
      .reduce((sum, c) => sum + Number(c.amount), 0)
  }

  const getTotalIncome = () => {
    return filteredCosts
      .filter((c) => c.type === 'income')
      .reduce((sum, c) => sum + Number(c.amount), 0)
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Coûts & Finances</Text>
        </View>
        <View style={styles.content}>
          {[1, 2, 3].map((i) => (
            <AnimalCardSkeleton key={i} />
          ))}
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Coûts & Finances</Text>
        </View>
        <ErrorState message={error.message} onRetry={loadCosts} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Coûts & Finances</Text>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => router.push('/(tabs)/costs/add')}
        >
          <Text style={commonStyles.buttonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'expense' && styles.filterButtonActive]}
          onPress={() => setFilter('expense')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'expense' && styles.filterTextActive,
            ]}
          >
            Dépenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'income' && styles.filterButtonActive]}
          onPress={() => setFilter('income')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'income' && styles.filterTextActive,
            ]}
          >
            Entrées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Résumé */}
      {filteredCosts.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Dépenses</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              {getTotalExpenses().toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Entrées</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {getTotalIncome().toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Solde</Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    getTotalIncome() - getTotalExpenses() >= 0
                      ? colors.success
                      : colors.error,
                },
              ]}
            >
              {(getTotalIncome() - getTotalExpenses()).toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        </View>
      )}

      {/* Liste */}
      {filteredCosts.length === 0 ? (
        <EmptyState
          emoji="💰"
          title={filter === 'all' ? 'Aucune transaction' : filter === 'expense' ? 'Aucune dépense' : 'Aucune entrée'}
          description={
            filter === 'all'
              ? 'Commencez par enregistrer vos premières dépenses et entrées pour suivre vos finances.'
              : filter === 'expense'
                ? 'Aucune dépense enregistrée. Ajoutez vos premières dépenses pour commencer le suivi.'
                : 'Aucune entrée enregistrée. Ajoutez vos premières entrées pour commencer le suivi.'
          }
          actionLabel="Ajouter une transaction"
          onAction={() => router.push('/(tabs)/costs/add')}
        />
      ) : (
        <FlatList
          data={filteredCosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CostItem entry={item} />}
          refreshing={loading}
          onRefresh={loadCosts}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.base,
    paddingTop: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  content: {
    padding: spacing.base,
  },
  filters: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: 8,
    backgroundColor: colors.muted,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.mutedForeground,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  summary: {
    flexDirection: 'row',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.base,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    padding: spacing.base,
  },
})

