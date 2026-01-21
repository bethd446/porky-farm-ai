import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuthContext } from '../../../contexts/AuthContext'
import { animalsService } from '../../../services/animals'
import { healthCasesService } from '../../../services/healthCases'
import { gestationsService } from '../../../services/gestations'
import { costsService } from '../../../services/costs'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { ScreenHeader, ScreenContainer, Card, LoadingScreen } from '../../../components/ui'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { PiggyBank, Heart, AlertTriangle, Baby, TrendingUp } from 'lucide-react-native'
import { Wording } from '../../../lib/constants/wording'
import { logger } from '../../../lib/logger'

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

  const loadReportsData = useCallback(async () => {
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

      // Ne pas bloquer pour les erreurs PGRST205 (tables non disponibles)
      // Les services retournent déjà [] avec error: null pour ces cas
      if (animalsError && !animalsError.message?.includes('PGRST205') && !animalsError.message?.includes('does not exist')) {
        logger.error('[Reports] Animals error:', animalsError)
      }
      if (healthCasesError && !healthCasesError.message?.includes('PGRST205') && !healthCasesError.message?.includes('does not exist')) {
        logger.error('[Reports] Health cases error:', healthCasesError)
      }
      if (gestationsError && !gestationsError.message?.includes('PGRST205') && !gestationsError.message?.includes('does not exist')) {
        logger.error('[Reports] Gestations error:', gestationsError)
      }
      if (costsError && !costsError.message?.includes('PGRST205') && !costsError.message?.includes('does not exist')) {
        logger.error('[Reports] Costs error:', costsError)
      }

      // Ne lancer une erreur que si c'est une erreur critique (non-PGRST205)
      const criticalError = 
        (animalsError && !animalsError.message?.includes('PGRST205') && !animalsError.message?.includes('does not exist')) ||
        (healthCasesError && !healthCasesError.message?.includes('PGRST205') && !healthCasesError.message?.includes('does not exist')) ||
        (gestationsError && !gestationsError.message?.includes('PGRST205') && !gestationsError.message?.includes('does not exist')) ||
        (costsError && !costsError.message?.includes('PGRST205') && !costsError.message?.includes('does not exist'))

      if (criticalError) {
        throw new Error('Erreur lors du chargement des rapports')
      }

      // Schéma V2.0: animaux ('actif', 'vendu', 'mort', 'reforme'), gestations ('en_cours', 'terminee', 'avortee')
      const totalAnimals = animalsData?.length || 0
      const healthyCount = animalsData?.filter((a) => a.status === 'actif').length || 0
      const careRequired = animalsData?.filter((a) => a.status === 'reforme').length || 0
      const activeGestations = gestationsData?.filter((g) => g.status === 'en_cours').length || 0

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
    } catch (e: unknown) {
      logger.error('[Reports] Error loading reports:', e)
      setError(e instanceof Error ? e : new Error('Erreur de chargement des rapports'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadReportsData()
    }
  }, [user, loadReportsData])

  if (loading) {
    return <LoadingScreen message="Chargement des rapports..." />
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
          icon="bar-chart"
        />
      </View>
    )
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={Wording.tabs.reports} subtitle="Vue d'ensemble de votre élevage" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques du Cheptel</Text>
        <View style={styles.statsGrid}>
          <StatCard icon={PiggyBank} label="Total animaux" value={stats.totalAnimals} color={colors.primary} />
          <StatCard icon={Heart} label="En santé" value={stats.healthyCount} color={colors.success} />
          <StatCard icon={AlertTriangle} label="Soins requis" value={stats.careRequired} color={colors.warning} />
          <StatCard icon={Baby} label="Gestations actives" value={stats.activeGestations} color={colors.info} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé Financier (Mois)</Text>
        <View style={styles.financialCard}>
          <View style={styles.financialRow}>
            <TrendingUp size={20} color={colors.error} />
            <Text style={styles.financialLabel}>{Wording.costs.expenses} :</Text>
            <Text style={[styles.financialValue, { color: colors.error }]}>
              {stats.totalExpenses.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={styles.financialRow}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={styles.financialLabel}>{Wording.costs.revenue} :</Text>
            <Text style={[styles.financialValue, { color: colors.success }]}>
              {stats.totalIncome.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <View style={styles.financialRow}>
            <PiggyBank size={20} color={colors.primary} />
            <Text style={styles.financialLabel}>{Wording.costs.balance} :</Text>
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
    </ScreenContainer>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ size: number; color: string }>
  label: string
  value: string | number
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <Card style={[styles.statCard, { borderColor: color }]}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </Card>
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
    borderRadius: radius.md,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 4,
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
    ...elevation.sm,
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
    ...elevation.sm,
  },
  reportLinkText: {
    fontSize: typography.fontSize.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
})
