/**
 * Dashboard mobile - Style UX Pilot
 * Sections : Stats, Actions rapides, Assistant IA, Alertes, Animaux récents
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import { animalsService, type Animal } from '../../services/animals'
import { healthCasesService } from '../../services/healthCases'
import { gestationsService } from '../../services/gestations'
import { feedingService } from '../../services/feeding'
import { AiAssistantBanner } from '../../components/AiAssistantBanner'
import { AlertCard } from '../../components/AlertCard'
import { AnimalListItem } from '../../components/AnimalListItem'
import { LoadingSkeleton, AnimalCardSkeleton } from '../../components/LoadingSkeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
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
      const activeCases = casesList.filter((c) => c.status === 'active' || c.status === 'monitoring')

      // Charger les gestations
      const { data: gestations, error: gestationsError } = await gestationsService.getAll()
      if (gestationsError) throw gestationsError

      const gestationsList = gestations || []

      // Calculer les stats
      const healthyCount = activeAnimals.filter((a) => a.status === 'active' && a.health_status === 'healthy').length
      const careRequired = activeCases.length
      const piglets = activeAnimals.filter((a) => a.category === 'piglet').length

      setStats({
        totalAnimals: activeAnimals.length,
        healthyCount,
        careRequired,
        piglets,
      })

      // Construire les alertes récentes
      const alerts: typeof recentAlerts = []
      
      // Alertes température (cas de santé récents avec sévérité haute)
      const recentHealthCases = casesList
        .filter((c) => c.severity === 'high' || c.severity === 'critical')
        .sort((a, b) => new Date(b.start_date || b.created_at).getTime() - new Date(a.start_date || a.created_at).getTime())
        .slice(0, 2)

      recentHealthCases.forEach((c) => {
        alerts.push({
          type: 'temperature',
          title: 'Alerte Température',
          description: `${c.pig_name || c.pig_identifier || 'Animal'} montre des symptômes de fièvre`,
          timeAgo: formatTimeAgo(c.start_date || c.created_at),
          link: '/(tabs)/health',
        })
      })

      // Alerte vaccination (si des animaux nécessitent des soins)
      if (careRequired > 0) {
        alerts.push({
          type: 'vaccination',
          title: 'Vaccination Due',
          description: `${careRequired} porc${careRequired > 1 ? 's' : ''} nécessitent une vaccination cette semaine`,
          timeAgo: "Aujourd'hui",
          link: '/(tabs)/health',
        })
      }

      setRecentAlerts(alerts)

      // Animaux récents (3 derniers)
      const sortedAnimals = animalsList
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
      setRecentAnimals(sortedAnimals)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const firstName = user?.email?.split('@')[0] || 'Éleveur'

  if (loading) {
    return (
      <View style={dashboardStyles.container}>
        <View style={dashboardStyles.header}>
          <Text style={dashboardStyles.greeting}>{getGreeting()}, {firstName} !</Text>
        </View>
        <ScrollView style={dashboardStyles.container} contentContainerStyle={dashboardStyles.scrollContent}>
          <View style={dashboardStyles.section}>
            {[1, 2, 3].map((i) => (
              <AnimalCardSkeleton key={i} />
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }

  if (error) {
    return (
      <View style={dashboardStyles.container}>
        <View style={dashboardStyles.header}>
          <Text style={dashboardStyles.greeting}>{getGreeting()}, {firstName} !</Text>
        </View>
        <ErrorState message={error.message} onRetry={loadDashboardData} />
      </View>
    )
  }

  const healthyPercentage = stats.totalAnimals > 0 ? Math.round((stats.healthyCount / stats.totalAnimals) * 100) : 0

  return (
    <ScrollView style={dashboardStyles.container} contentContainerStyle={dashboardStyles.scrollContent}>
      {/* Header */}
      <View style={dashboardStyles.header}>
        <Text style={dashboardStyles.greeting}>{getGreeting()}, {firstName} !</Text>
        <Text style={dashboardStyles.subtitle}>
          {stats.totalAnimals > 0
            ? `Votre élevage compte ${stats.totalAnimals} animal${stats.totalAnimals > 1 ? 'aux' : ''}`
            : 'Commencez par ajouter vos animaux pour suivre votre élevage'}
        </Text>
      </View>

      {/* Stats Row - 4 cartes */}
      <View style={dashboardStyles.statsRow}>
        <TouchableOpacity
          style={[dashboardStyles.statCard, dashboardStyles.statCardPrimary]}
          onPress={() => router.push('/(tabs)/livestock')}
        >
          <View style={styles.statHeader}>
            <PiggyBank size={20} color={colors.primary} />
            <Text style={styles.statPlus}>+12</Text>
          </View>
          <Text style={dashboardStyles.statValue}>{stats.totalAnimals}</Text>
          <Text style={dashboardStyles.statLabel}>Total Porcs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dashboardStyles.statCard, dashboardStyles.statCardSuccess]}
          onPress={() => router.push('/(tabs)/livestock')}
        >
          <View style={styles.statHeader}>
            <Heart size={20} color={colors.success} />
            <Text style={styles.statPercentage}>{healthyPercentage}%</Text>
          </View>
          <Text style={dashboardStyles.statValue}>{stats.healthyCount}</Text>
          <Text style={dashboardStyles.statLabel}>En Santé</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dashboardStyles.statCard, dashboardStyles.statCardWarning]}
          onPress={() => router.push('/(tabs)/health')}
        >
          <View style={styles.statHeader}>
            <AlertTriangle size={20} color={colors.warning} />
            <Text style={styles.statAlert}>Alerte</Text>
          </View>
          <Text style={dashboardStyles.statValue}>{stats.careRequired}</Text>
          <Text style={dashboardStyles.statLabel}>Soins Requis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dashboardStyles.statCard, dashboardStyles.statCardInfo]}
          onPress={() => router.push('/(tabs)/livestock')}
        >
          <View style={styles.statHeader}>
            <Baby size={20} color={colors.info} />
            <Text style={styles.statNew}>Nouveau</Text>
          </View>
          <Text style={dashboardStyles.statValue}>{stats.piglets}</Text>
          <Text style={dashboardStyles.statLabel}>Porcelets</Text>
        </TouchableOpacity>
      </View>

      {/* Actions Rapides */}
      <View style={dashboardStyles.section}>
        <Text style={dashboardStyles.sectionTitle}>Actions Rapides</Text>
        <View style={dashboardStyles.quickActionsRow}>
          <TouchableOpacity
            style={[dashboardStyles.quickActionButton, dashboardStyles.quickActionButtonPrimary]}
            onPress={() => router.push('/(tabs)/livestock/add')}
          >
            <Plus size={24} color="#ffffff" style={dashboardStyles.quickActionIcon} />
            <Text style={[dashboardStyles.quickActionText, dashboardStyles.quickActionTextPrimary]}>
              Ajouter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dashboardStyles.quickActionButton}
            onPress={() => router.push('/(tabs)/health')}
          >
            <Syringe size={24} color={colors.foreground} style={dashboardStyles.quickActionIcon} />
            <Text style={dashboardStyles.quickActionText}>Vaccin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dashboardStyles.quickActionButton}
            onPress={() => router.push('/(tabs)/feeding')}
          >
            <Package size={24} color={colors.foreground} style={dashboardStyles.quickActionIcon} />
            <Text style={dashboardStyles.quickActionText}>Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dashboardStyles.quickActionButton}
            onPress={() => router.push('/(tabs)/costs')}
          >
            <FileText size={24} color={colors.foreground} style={dashboardStyles.quickActionIcon} />
            <Text style={dashboardStyles.quickActionText}>Registres</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Assistant IA Banner */}
      <View style={dashboardStyles.section}>
        <AiAssistantBanner onPress={() => router.push('/(tabs)/ai-assistant')} />
      </View>

      {/* Alertes Récentes */}
      <View style={dashboardStyles.section}>
        <View style={dashboardStyles.sectionHeader}>
          <Text style={dashboardStyles.sectionTitle}>Alertes Récentes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/health')}>
            <Text style={dashboardStyles.sectionLink}>Tout Voir</Text>
          </TouchableOpacity>
        </View>
        {recentAlerts.length === 0 ? (
          <View style={styles.emptyAlerts}>
            <Text style={styles.emptyAlertsText}>Aucune alerte récente</Text>
          </View>
        ) : (
          recentAlerts.map((alert, index) => (
            <AlertCard
              key={index}
              type={alert.type}
              title={alert.title}
              description={alert.description}
              timeAgo={alert.timeAgo}
              onPress={() => router.push(alert.link as any)}
            />
          ))
        )}
      </View>

      {/* Animaux Récents */}
      <View style={dashboardStyles.section}>
        <View style={dashboardStyles.sectionHeader}>
          <Text style={dashboardStyles.sectionTitle}>Animaux Récents</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/livestock')}>
            <Text style={dashboardStyles.sectionLink}>Voir Tout</Text>
          </TouchableOpacity>
        </View>
        {recentAnimals.length === 0 ? (
          <EmptyState
            emoji="🐷"
            title="Aucun animal enregistré"
            description="Commencez par ajouter vos premiers animaux pour suivre votre élevage."
            actionLabel="Ajouter un animal"
            onAction={() => router.push('/(tabs)/livestock/add')}
          />
        ) : (
          recentAnimals.map((animal) => (
            <AnimalListItem
              key={animal.id}
              animal={animal}
              onPress={() => router.push(`/(tabs)/livestock/${animal.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statPlus: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  statPercentage: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  statAlert: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  statNew: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.info,
  },
  emptyAlerts: {
    padding: spacing.base,
    alignItems: 'center',
  },
  emptyAlertsText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
})
