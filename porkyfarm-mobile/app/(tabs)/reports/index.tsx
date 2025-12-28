import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
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
    if (user) {
      loadReportsData()
    }
  }, [user])

  const loadReportsData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        { data: animalsData, error: animalsError },
        { data: healthCasesData, error: healthCasesError },
        { data: gestationsData, error: gestationsError },
        { data: costsData, error: costsError },
      ] = await Promise.all([
        animalsService.getAll(),
        healthCasesService.getAll(),
        gestationsService.getAll(),
        costsService.getAll(),
      ])

      if (animalsError || healthCasesError || gestationsError || costsError) {
        throw new Error(
          animalsError?.message ||
            healthCasesError?.message ||
            gestationsError?.message ||
            costsError?.message ||
            'Erreur lors du chargement des rapports',
        )
      }

      const totalAnimals = animalsData?.length || 0
      const healthyCount = animalsData?.filter((a) => a.status === 'active').length || 0
      const careRequired = animalsData?.filter((a) => a.status === 'sick').length || 0
      const activeGestations = gestationsData?.filter((g) => g.status === 'pregnant').length || 0

      const totalExpenses =
        costsData
          ?.filter((c) => c.type === 'expense')
          .reduce((sum, c) => sum + c.amount, 0) || 0
      const totalIncome =
        costsData
          ?.filter((c) => c.type === 'income')
          .reduce((sum, c) => sum + c.amount, 0) || 0

      setStats({
        totalAnimals,
        healthyCount,
        careRequired,
        activeGestations,
        totalExpenses,
        totalIncome,
      })
    } catch (e: any) {
      console.error('Error loading reports:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des rapports...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorState
          title="Erreur de chargement"
          message={error.message || 'Impossible de charger les données des rapports.'}
          onRetry={loadReportsData}
          retryLabel="Réessayer"
        />
      </View>
    )
  }

  if (stats.totalAnimals === 0 && stats.totalExpenses === 0 && stats.totalIncome === 0) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Aucune donnée de rapport"
          description="Ajoutez des animaux, des cas de santé ou des transactions pour voir vos rapports ici."
          emoji="📊"
        />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rapports & Statistiques</Text>
        <Text style={styles.subtitle}>Vue d'ensemble de votre élevage</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques du Cheptel</Text>
        <View style={styles.statsGrid}>
          <StatCard icon={PiggyBank} label="Total Animaux" value={stats.totalAnimals} color={colors.primary} />
          <StatCard icon={Heart} label="Animaux en Santé" value={stats.healthyCount} color={colors.success} />
          <StatCard icon={AlertTriangle} label="Soins Requis" value={stats.careRequired} color={colors.warning} />
          <StatCard icon={Baby} label="Gestations Actives" value={stats.activeGestations} color={colors.info} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé Financier (Mois)</Text>
        <View style={styles.financialCard}>
          <View style={styles.financialRow}>
            <TrendingUp size={20} color={colors.error} />
            <Text style={styles.financialLabel}>Dépenses :</Text>
            <Text style={[styles.financialValue, { color: colors.error }]}>
              {stats.totalExpenses.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={styles.financialRow}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={styles.financialLabel}>Revenus :</Text>
            <Text style={[styles.financialValue, { color: colors.success }]}>
              {stats.totalIncome.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={styles.financialRow}>
            <PiggyBank size={20} color={colors.primary} />
            <Text style={styles.financialLabel}>Solde :</Text>
            <Text style={[styles.financialValue, { color: colors.primary }]}>
              {(stats.totalIncome - stats.totalExpenses).toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rapports Détaillés</Text>
        <TouchableOpacity style={styles.reportLink}>
          <Text style={styles.reportLinkText}>Voir les rapports de santé</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportLink}>
          <Text style={styles.reportLinkText}>Voir les rapports de reproduction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportLink}>
          <Text style={styles.reportLinkText}>Voir les rapports d'alimentation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ size: number; color: string }>
  label: string
  value: string | number
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <View style={[styles.statCard, { borderColor: color }]}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
    backgroundColor: colors.card,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statIconContainer: {
    borderRadius: radius.full,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginTop: spacing.xs / 2,
  },
  financialCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  financialLabel: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
    marginLeft: spacing.sm,
    flex: 1,
  },
  financialValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
  reportLink: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  reportLinkText: {
    fontSize: typography.fontSize.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
})
