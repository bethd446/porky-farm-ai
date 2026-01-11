/**
 * Dashboard PorkyFarm - Tableau de bord intelligent
 * ==================================================
 * - 4 KPIs avec navigation intelligente
 * - Alertes gestations automatiques (J-14)
 * - Tâches en retard
 * - Actions rapides
 * - Cheptel récent
 */

import { useMemo, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { MotiView } from 'moti'
import { useFocusEffect } from '@react-navigation/native'

import { useAuthContext } from '../../contexts/AuthContext'
import { useRefresh } from '../../contexts/RefreshContext'
import { animalsService, type Animal, mapSexToCategory } from '../../services/animals'
import { healthCasesService, type HealthStats } from '../../services/healthCases'
import { gestationsService, type GestationAlertData } from '../../services/gestations'
import { tasksService } from '../../services/tasks'
import { StatCard } from '../../components/ui/StatCard'
import { QuickActionButton } from '../../components/ui/QuickActionButton'
import { ScreenWrapper } from '../../components/ui/ScreenWrapper'
import { GestationAlerts } from '../../components/reproduction/GestationAlerts'
import { AlertCard, AlertBanner } from '../../components/ui/AlertCard'
import { GlassCard } from '../../components/ui/GlassCard'
import { useData } from '../../hooks/useData'
import { colors } from '../../constants/theme'
import { colors as tokenColors } from '../../lib/theme/tokens'
import { useTheme } from '../../contexts/ThemeContext'
import { logger } from '../../lib/logger'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48 - 12) / 2

// Helpers
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon aprés-midi'
  return 'Bonsoir'
}

interface DashboardData {
  stats: {
    totalAnimals: number
    healthyCount: number
    careRequired: number
    gestations: number
    pendingTasks: number
    overdueTasks: number
  }
  recentAnimals: Animal[]
  gestationAlerts: GestationAlertData[]
}

const defaultDashboardData: DashboardData = {
  stats: {
    totalAnimals: 0,
    healthyCount: 0,
    careRequired: 0,
    gestations: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  },
  recentAnimals: [],
  gestationAlerts: [],
}

export default function DashboardScreen() {
  const { user, email } = useAuthContext()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { animalsVersion, gestationsVersion, healthCasesVersion, tasksVersion } = useRefresh()
  const { colors: themeColors, isDark } = useTheme()

  // Charger les données avec le hook unifié
  const { data: dashboardData, loading, refreshing, error, refresh } = useData(
    async () => {
      logger.debug('[Dashboard] Début du chargement des données...')

      try {
        // Charger chaque service avec timeout individuel
        const timeoutPromise = <T,>(promise: Promise<T>, ms: number, name: string): Promise<T> =>
          Promise.race([
            promise,
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error(`${name} timeout après ${ms}ms`)), ms)
            ),
          ])

        // Charger en parallèle avec gestion des erreurs individuelles
        const [animalsResult, healthStatsResult, gestationsResult, gestationAlertsResult, tasksResult] = await Promise.all([
          timeoutPromise(animalsService.getAll(), 8000, 'animalsService').catch(e => {
            logger.warn('[Dashboard] Animals error:', e)
            return { data: [], error: e }
          }),
          timeoutPromise(healthCasesService.getHealthStats(), 5000, 'healthCasesService').catch(e => {
            logger.warn('[Dashboard] Health stats error:', e)
            return { data: { healthy: 0, sick: 0, total: 0, openCases: 0 }, error: e }
          }),
          timeoutPromise(gestationsService.getActive(), 5000, 'gestationsService').catch(e => {
            logger.warn('[Dashboard] Gestations error:', e)
            return { data: [], error: e }
          }),
          timeoutPromise(gestationsService.getAlerts(undefined, 14), 5000, 'gestationAlerts').catch(e => {
            logger.warn('[Dashboard] Gestation alerts error:', e)
            return { data: [], error: e }
          }),
          timeoutPromise(tasksService.getAll({ completed: false }), 5000, 'tasksService').catch(e => {
            logger.warn('[Dashboard] Tasks error:', e)
            return { data: [], error: e }
          }),
        ])

        const animalsList = animalsResult.data || []
        // Filtrer les animaux actifs (schéma V2.0: 'actif')
        const activeAnimals = animalsList.filter(
          (a) => a.status === 'actif' || a.status === 'reforme'
        )

        // Utiliser les stats de santé calculées
        const healthStats = healthStatsResult.data as HealthStats
        const activeGestations = (gestationsResult.data || []).filter((g: any) => g.status === 'en_cours')
        const gestationAlerts = (gestationAlertsResult.data || []) as GestationAlertData[]
        const pendingTasksList = tasksResult.data || []

        // Calculer les tâches en retard
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const overdueTasks = pendingTasksList.filter((t: any) => {
          if (!t.due_date) return false
          const dueDate = new Date(t.due_date)
          dueDate.setHours(0, 0, 0, 0)
          return dueDate < today
        }).length

        const stats = {
          totalAnimals: healthStats.total || activeAnimals.length,
          healthyCount: healthStats.healthy,
          careRequired: healthStats.openCases,
          gestations: activeGestations.length,
          pendingTasks: pendingTasksList.length,
          overdueTasks,
        }

        console.log('[Dashboard] Stats calculées:', stats)
        console.log('[Dashboard] Alertes gestations:', gestationAlerts.length)

        return {
          data: {
            stats,
            recentAnimals: activeAnimals.slice(0, 4),
            gestationAlerts,
          },
          error: null,
        } as { data: DashboardData; error: null }
      } catch (err: any) {
        logger.error('[Dashboard] Erreur globale:', err)
        return {
          data: defaultDashboardData,
          error: err,
        }
      }
    },
    defaultDashboardData,
    [user?.id, animalsVersion, gestationsVersion, healthCasesVersion, tasksVersion]
  )

  const stats = dashboardData.stats
  const recentAnimals = dashboardData.recentAnimals
  const gestationAlerts = dashboardData.gestationAlerts
  const userName = email?.split('@')[0] || user?.email?.split('@')[0] || 'Éleveur'

  // Stats config avec routes de navigation
  const statsConfig = [
    {
      id: 'total',
      value: stats.totalAnimals,
      label: 'Animaux',
      icon: 'paw' as const,
      color: colors.primary[500],
      route: '/(tabs)/livestock',
    },
    {
      id: 'healthy',
      value: stats.healthyCount,
      label: 'En santé',
      icon: 'heart' as const,
      color: '#22C55E',
      route: '/(tabs)/health',
    },
    {
      id: 'toTreat',
      value: stats.careRequired,
      label: 'À traiter',
      icon: 'medkit' as const,
      color: colors.feature.feeding,
      route: '/(tabs)/health',
      highlight: stats.careRequired > 0,
    },
    {
      id: 'gestations',
      value: stats.gestations,
      label: 'Gestations',
      icon: 'female' as const,
      color: colors.feature.reproduction,
      route: '/(tabs)/reproduction',
    },
  ]

  // Quick actions config
  const quickActions = [
    { id: 'animal', label: 'Animal', icon: 'add-circle' as const, color: colors.primary[500], route: '/(tabs)/livestock/add' },
    { id: 'health', label: 'Santé', icon: 'medkit' as const, color: colors.feature.health, route: '/(tabs)/health/add' },
    { id: 'feed', label: 'Aliment', icon: 'leaf' as const, color: colors.feature.feeding, route: '/(tabs)/alimentation' },
    { id: 'tasks', label: 'Tâches', icon: 'checkbox' as const, color: colors.feature.tasks, route: '/(tabs)/plus/taches' },
  ]

  const handleGestationAlertPress = useCallback((id: string) => {
    router.push(`/(tabs)/reproduction/${id}` as any)
  }, [router])

  return (
    <ScreenWrapper
      loading={loading}
      error={error}
      refreshing={refreshing}
      onRefresh={refresh}
      isEmpty={false}
      contentStyle={styles.scrollContent}
    >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.profileButtonPressed
          ]}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person" size={22} color={colors.primary[500]} />
        </Pressable>
      </MotiView>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statsConfig.map((stat, index) => (
          <StatCard
            key={stat.id}
            value={stat.value}
            label={stat.label}
            icon={stat.icon}
            iconColor={stat.color}
            style={stat.highlight
              ? { width: CARD_WIDTH, borderWidth: 2, borderColor: '#F59E0B' }
              : { width: CARD_WIDTH }
            }
            delay={index * 50}
            onPress={() => router.push(stat.route as any)}
          />
        ))}
      </View>

      {/* Critical Gestation Banner - Mise bas imminente */}
      {gestationAlerts.some(g => g.days_remaining <= 3) && (
        <AlertBanner
          level="critical"
          message={`${gestationAlerts.filter(g => g.days_remaining <= 3).length} mise(s) bas imminente(s) !`}
          action={{
            label: 'Voir',
            onPress: () => router.push('/(tabs)/reproduction'),
          }}
        />
      )}

      {/* Gestation Alerts */}
      {gestationAlerts.length > 0 && (
        <GestationAlerts
          alerts={gestationAlerts}
          onPress={handleGestationAlertPress}
        />
      )}

      {/* Overdue Tasks - AlertCard warning */}
      {stats.overdueTasks > 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 350 }}
        >
          <AlertCard
            level="warning"
            title="Taches en retard"
            message={`${stats.overdueTasks} tache(s) non terminee(s)`}
            count={stats.overdueTasks}
            icon="time-outline"
            onPress={() => router.push('/(tabs)/plus/taches' as any)}
          />
        </MotiView>
      )}

      {/* Pending Tasks - AlertCard info */}
      {stats.pendingTasks > 0 && stats.overdueTasks === 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
        >
          <AlertCard
            level="info"
            title="Taches en attente"
            message={`${stats.pendingTasks} tache(s) a completer`}
            count={stats.pendingTasks}
            icon="checkbox-outline"
            onPress={() => router.push('/(tabs)/plus/taches' as any)}
          />
        </MotiView>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActionsCard}>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={action.id}
              label={action.label}
              icon={action.icon}
              iconColor={action.color}
              onPress={() => router.push(action.route as any)}
              delay={200 + index * 50}
            />
          ))}
        </View>
      </View>

      {/* Recent Animals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cheptel récent</Text>
          <Pressable onPress={() => router.push('/(tabs)/livestock')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </Pressable>
        </View>

        {recentAnimals.length === 0 && !loading ? (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.emptyState}
          >
            <View style={styles.emptyIconContainer}>
              <Ionicons name="paw" size={48} color={colors.gray[300]} />
            </View>
            <Text style={styles.emptyTitle}>Aucun animal</Text>
            <Text style={styles.emptyMessage}>Ajoutez votre premier animal</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/livestock/add')}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </Pressable>
          </MotiView>
        ) : (
          recentAnimals.map((animal, index) => (
            <AnimalCard key={animal.id} animal={animal} index={index} />
          ))
        )}
      </View>

      {/* Spacer for TabBar */}
      <View style={{ height: 100 }} />
    </ScreenWrapper>
  )
}

// Animal Card Component
function AnimalCard({ animal, index }: { animal: Animal; index: number }) {
  const router = useRouter()
  const category = animal.sex ? mapSexToCategory(animal.sex) : animal.category
  const tagNumber = animal.tag_number || animal.identifier || 'N/A'

  const categoryLabels: Record<string, string> = {
    sow: 'Truie', boar: 'Verrat', piglet: 'Porcelet', fattening: 'Engraissement',
    truie: 'Truie', verrat: 'Verrat', porcelet: 'Porcelet', engraissement: 'Engraissement',
  }

  const statusColors: Record<string, string> = {
    actif: '#22C55E', vendu: '#6B7280', mort: '#EF4444', reforme: '#F59E0B',
  }

  const statusLabels: Record<string, string> = {
    actif: 'Actif', vendu: 'Vendu', mort: 'Décédé', reforme: 'Réformé',
  }

  const statusColor = statusColors[animal.status] || '#6B7280'
  const statusLabel = statusLabels[animal.status] || animal.status

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300, delay: 450 + index * 50 }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.animalCard,
          pressed && styles.animalCardPressed
        ]}
        onPress={() => router.push(`/(tabs)/livestock/${animal.id}`)}
      >
        <View style={styles.animalAvatar}>
          <Text style={styles.animalAvatarText}>
            {tagNumber.slice(0, 2)}
          </Text>
        </View>
        <View style={styles.animalInfo}>
          <Text style={styles.animalTag} numberOfLines={1}>
            {tagNumber}
          </Text>
          <Text style={styles.animalCategory}>
            {categoryLabels[category] || categoryLabels[animal.category] || category}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </Pressable>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  quickActionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  overdueTasksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  bannerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  overdueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueContent: {
    flex: 1,
    marginLeft: 14,
  },
  overdueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  overdueSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  tasksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.feature.tasks,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  tasksBannerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  tasksBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksBannerContent: {
    flex: 1,
    marginLeft: 14,
  },
  tasksBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  tasksBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  animalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  animalCardPressed: {
    backgroundColor: colors.gray[100],
  },
  animalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  animalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  animalTag: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  animalCategory: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
