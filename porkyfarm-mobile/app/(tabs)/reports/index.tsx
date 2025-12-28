/**
 * Écran Rapports / Statistiques
 * Vue d'ensemble des données de l'élevage
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../../contexts/AuthContext'
import { animalsService } from '../../../services/animals'
import { healthCasesService } from '../../../services/healthCases'
import { gestationsService } from '../../../services/gestations'
import { costsService } from '../../../services/costs'
import { colors, spacing, typography, radius, shadows } from '../../../lib/designTokens'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ErrorState'
import { PiggyBank, Heart, AlertTriangle, Baby, TrendingUp } from 'lucide-react-native'

export default function ReportsScreen() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState({
    totalAnimals: 0,
    healthyCount: 0,
    careRequired: 0,
    activeGestations: 0,
    totalExpenses: 0,
    totalIncome: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      // Charger les animaux
      const { data: animals, error: animalsError } = await animalsService.getAll()
      if (animalsError) throw animalsError

      const animalsList = animals || []
      const activeAnimals = animalsList.filter(
        (a) => a.status === 'active' || a.status === 'sick' || a.status === 'pregnant' || a.status === 'nursing'
      )

      // Charger les cas de santé
      const { data: healthCases, error: healthError } = await healthCasesService.getAll()
      if (healthError) throw healthError

      const casesList = healthCases || []
      const activeCases = casesList.filter((c) => c.status === 'ongoing' || c.status === 'scheduled')

      // Charger les gestations
      const { data: gestations, error: gestationsError } = await gestationsService.getAll()
      if (gestationsError) throw gestationsError

      const gestationsList = gestations || []
      const activeGestations = gestationsList.filter((g) => g.status === 'pregnant' || g.status === 'farrowed')

      // Charger les transactions (coûts)
      const { data: transactions, error: transactionsError } = await costsService.getAll()
      if (transactionsError) throw transactionsError

      const transactionsList = transactions || []
      const expenses = transactionsList
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      const income = transactionsList
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0)

      const healthyCount = activeAnimals.filter((a) => a.status === 'active').length

      setStats({
        totalAnimals: activeAnimals.length,
        healthyCount,
        careRequired: activeCases.length,
        activeGestations: activeGestations.length,
        totalExpenses: expenses,
        totalIncome: income,
      })
    } catch (err) {
      console.error('Error loading stats:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rapports</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rapports</Text>
        </View>
        <ErrorState message={error.message} onRetry={loadStats} />
      </View>
    )
  }

  const balance = stats.totalIncome - stats.totalExpenses

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Rapports</Text>
        <Text style={styles.subtitle}>Vue d'ensemble de votre élevage</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <PiggyBank size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.totalAnimals}</Text>
          <Text style={styles.statLabel}>Total Animaux</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>
          <Heart size={24} color={colors.success} />
          <Text style={styles.statValue}>{stats.healthyCount}</Text>
          <Text style={styles.statLabel}>En Santé</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.warningLight }]}>
          <AlertTriangle size={24} color={colors.warning} />
          <Text style={styles.statValue}>{stats.careRequired}</Text>
          <Text style={styles.statLabel}>Soins Requis</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.infoLight }]}>
          <Baby size={24} color={colors.info} />
          <Text style={styles.statValue}>{stats.activeGestations}</Text>
          <Text style={styles.statLabel}>Gestations</Text>
        </View>
      </View>

      {/* Finances */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finances</Text>
        <View style={[styles.financeCard, { backgroundColor: colors.card }]}>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Dépenses</Text>
            <Text style={[styles.financeValue, { color: colors.error }]}>
              {stats.totalExpenses.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Recettes</Text>
            <Text style={[styles.financeValue, { color: colors.success }]}>
              {stats.totalIncome.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={[styles.financeRow, styles.financeRowTotal]}>
            <Text style={styles.financeLabelTotal}>Solde</Text>
            <Text
              style={[
                styles.financeValueTotal,
                { color: balance >= 0 ? colors.success : colors.error },
              ]}
            >
              {balance.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        </View>
      </View>

      {stats.totalAnimals === 0 && (
        <EmptyState
          title="Aucune donnée"
          message="Commencez par ajouter des animaux pour voir vos statistiques"
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.base,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  statValue: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  statLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.base,
  },
  financeCard: {
    padding: spacing.base,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  financeRowTotal: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
    paddingTop: spacing.base,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  financeLabel: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  financeValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  financeLabelTotal: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  financeValueTotal: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
  },
})

