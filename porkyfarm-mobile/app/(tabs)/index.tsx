/**
 * Dashboard mobile - Style UX Pilot
 * Sections : Stats, Actions rapides, Assistant IA, Alertes, Animaux récents
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import { animalsService, type Animal, mapSexToCategory } from '../../services/animals'
import { healthCasesService } from '../../services/healthCases'
import { gestationsService } from '../../services/gestations'
import { feedingService } from '../../services/feeding'
import { AiAssistantBanner } from '../../components/AiAssistantBanner'
import { AlertCard } from '../../components/AlertCard'
import { AnimalListItem } from '../../components/AnimalListItem'
import { LoadingSkeleton, AnimalCardSkeleton } from '../../components/LoadingSkeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { TodoList } from '../../components/TodoList'
import { dashboardStyles } from '../../lib/dashboardStyles'
import { colors, spacing, typography } from '../../lib/designTokens'
import { PiggyBank, Heart, AlertTriangle, Baby, Plus, Syringe, Package, FileText } from 'lucide-react-native'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return "À l'instant"
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
  }
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function DashboardScreen() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState({
    totalAnimals: 0,
    healthyCount: 0,
    careRequired: 0,
    piglets: 0,
  })
  const [recentAlerts, setRecentAlerts] = useState<Array<{
    type: 'temperature' | 'vaccination' | 'health' | 'gestation'
    title: string
    description: string
    timeAgo: string
    link: string
  }>>([])
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
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
      // Filtrer les cas actifs : status = 'ongoing' (pas 'active' ou 'monitoring')
      const activeCases = casesList.filter((c) => c.status === 'ongoing')

      // Charger les gestations
      const { data: gestations, error: gestationsError } = await gestationsService.getAll()
      if (gestationsError) throw gestationsError

      const gestationsList = gestations || []

      // Calculer les stats
      const healthyCount = activeAnimals.filter((a) => a.status === 'active').length
      const careRequired = activeCases.length
      // Filtrer les porcelets : sex = 'unknown' (mappé vers 'piglet')
      const piglets = activeAnimals.filter((a) => {
        const category = mapSexToCategory(a.sex)
        return category === 'piglet'
      }).length

      setStats({
        totalAnimals: activeAnimals.length,
        healthyCount,
        careRequired,
        piglets,
      })

      // Construire les alertes récentes
      const alerts: Array<{
        type: 'temperature' | 'vaccination' | 'health' | 'gestation'
        title: string
        description: string
        timeAgo: string
        link: string
      }> = []

      // Alertes santé (cas critiques)
      const criticalCases = casesList
        .filter((c) => (c.severity === 'high' || c.severity === 'critical') && c.status === 'ongoing')
        .slice(0, 3)
      criticalCases.forEach((c) => {
        alerts.push({
          type: 'health',
          title: c.title,
          description: `${c.pig_name || c.pig_identifier || 'Animal'} montre des symptômes de fièvre`,
          timeAgo: formatTimeAgo(c.start_date || c.created_at),
          link: `/(tabs)/health/${c.id}`,
        })
      })

      // Alertes gestations (mise-bas proche)
      const upcomingGestations = gestationsList
        .filter((g) => g.status === 'pregnant')
        .slice(0, 2)
      upcomingGestations.forEach((g) => {
        alerts.push({
          type: 'gestation',
          title: 'Mise-bas prévue',
          description: `${g.sow_name || g.sow_identifier || 'Truie'} - ${formatTimeAgo(g.expected_farrowing_date || g.mating_date)}`,
          timeAgo: formatTimeAgo(g.expected_farrowing_date || g.mating_date),
          link: `/(tabs)/reproduction/${g.id}`,
        })
      })

      setRecentAlerts(alerts.slice(0, 5))
      setRecentAnimals(activeAnimals.slice(0, 5))
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="Erreur de chargement"
          message={error.message || 'Impossible de charger les données du dashboard.'}
          onRetry={loadDashboardData}
          retryLabel="Réessayer"
        />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.email?.split('@')[0] || 'Éleveur'}</Text>
        <Text style={styles.subtitle}>Vue d'ensemble de votre élevage</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <PiggyBank size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.totalAnimals}</Text>
          <Text style={styles.statLabel}>Total porcs</Text>
        </View>
        <View style={styles.statCard}>
          <Heart size={24} color={colors.success} />
          <Text style={styles.statValue}>{stats.healthyCount}</Text>
          <Text style={styles.statLabel}>En santé</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={24} color={colors.warning} />
          <Text style={styles.statValue}>{stats.careRequired}</Text>
          <Text style={styles.statLabel}>Soins requis</Text>
        </View>
        <View style={styles.statCard}>
          <Baby size={24} color={colors.info} />
          <Text style={styles.statValue}>{stats.piglets}</Text>
          <Text style={styles.statLabel}>Porcelets</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/livestock/add')}
        >
          <Plus size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Ajouter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/health/add')}
        >
          <Syringe size={20} color={colors.success} />
          <Text style={styles.actionButtonText}>Vaccin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/feeding/add-stock')}
        >
          <Package size={20} color={colors.warning} />
          <Text style={styles.actionButtonText}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/reports')}
        >
          <FileText size={20} color={colors.info} />
          <Text style={styles.actionButtonText}>Rapports</Text>
        </TouchableOpacity>
      </View>

      {/* AI Assistant Banner */}
      <AiAssistantBanner />

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertes Récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/health')}>
              <Text style={styles.sectionLink}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          {recentAlerts.map((alert, index) => (
            <AlertCard
              key={index}
              type={alert.type}
              title={alert.title}
              description={alert.description}
              timeAgo={alert.timeAgo}
              onPress={() => router.push(alert.link as any)}
            />
          ))}
        </View>
      )}

      {/* Recent Animals */}
      {recentAnimals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animaux Récents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/livestock')}>
              <Text style={styles.sectionLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {recentAnimals.map((animal) => (
            <AnimalListItem
              key={animal.id}
              animal={animal}
              onPress={() => router.push(`/(tabs)/livestock/${animal.id}`)}
            />
          ))}
        </View>
      )}

      {/* Todo List */}
      <View style={styles.section}>
        <TodoList />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
    marginTop: spacing.xs / 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.fontSize.caption,
    color: colors.foreground,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  sectionLink: {
    fontSize: typography.fontSize.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
})
