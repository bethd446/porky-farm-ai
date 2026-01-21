/**
 * Écran liste des transactions financières (Coûts & Finances)
 */

import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { costsService, type CostEntry } from '../../../services/costs'
import { CostItem } from '../../../components/CostItem'
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper'
import { Button } from '../../../components/ui/Button'
import { colors, spacing, typography, commonStyles } from '../../../lib/designTokens'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useListData } from '../../../hooks/useData'

type FilterType = 'all' | 'expense' | 'income'

export default function CostsScreen() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterType>('all')
  const { costsVersion } = useRefresh()

  const {
    data: costs,
    loading,
    error,
    refreshing,
    isEmpty,
    refresh: onRefresh,
  } = useListData(() => costsService.getAll(), [costsVersion])

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

  return (
    <ScreenWrapper
      loading={loading}
      error={error}
      refreshing={refreshing}
      onRefresh={onRefresh}
      isEmpty={isEmpty}
      emptyIcon="wallet-outline"
      emptyTitle="Aucune transaction"
      emptyMessage="Commencez par enregistrer vos premières dépenses et entrées pour suivre vos finances."
      emptyAction={
        <Button
          title="Ajouter une transaction"
          onPress={() => router.push('/(tabs)/costs/add')}
          variant="primary"
        />
      }
      scrollable={false}
    >
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'all' ? 'Aucune transaction' : filter === 'expense' ? 'Aucune dépense' : 'Aucune entrée'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CostItem
              entry={item}
              onPress={() => router.push(`/(tabs)/costs/${item.id}`)}
              onLongPress={() => {
                const { Alert } = require('react-native')
                Alert.alert(
                  'Supprimer',
                  `Supprimer "${item.description || 'cette transaction'}" ?`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: async () => {
                        const { error } = await costsService.delete(item.id)
                        if (error) {
                          Alert.alert('Erreur', error.message)
                        } else {
                          onRefresh()
                        }
                      },
                    },
                  ]
                )
              }}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScreenWrapper>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
})

