/**
 * Mon Cheptel - Liste des animaux avec recherche et filtres
 * ==========================================================
 */

import { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { animalsService, mapSexToCategory } from '../../../services/animals'
import { healthCasesService } from '../../../services/healthCases'
import {
  buildSeverityMap,
  mergeAnimalsWithHealth,
  computeHealthStats,
  type AnimalWithHealth,
} from '../../../lib/animalHealthHelpers'
import { useTheme } from '../../../contexts/ThemeContext'
import { useRefresh } from '../../../contexts/RefreshContext'
import {
  ScreenHeader,
  SearchBar,
  ChipGroup,
  AnimalCard,
  Badge,
} from '../../../components/ui'
import { EmptyState } from '../../../components/EmptyState'
import { SkeletonCard } from '../../../components/animations'
import { ScalePress } from '../../../components/animations'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { Plus, Filter, SlidersHorizontal } from 'lucide-react-native'
import { Wording } from '../../../lib/constants/wording'

type FilterCategory = 'all' | 'sow' | 'boar' | 'piglet' | 'fattening'
type FilterHealth = 'all' | 'healthy' | 'sick'

const categoryFilters: { label: string; value: FilterCategory }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Truies', value: 'sow' },
  { label: 'Verrats', value: 'boar' },
  { label: 'Porcelets', value: 'piglet' },
  { label: 'Engraissement', value: 'fattening' },
]

const healthFilters: { label: string; value: FilterHealth }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Sains', value: 'healthy' },
  { label: 'Cas ouverts', value: 'sick' },
]

export default function LivestockScreen() {
  const { colors: themeColors } = useTheme()
  const router = useRouter()
  const { animalsVersion } = useRefresh()

  // State pour les données combinées
  const [animals, setAnimals] = useState<AnimalWithHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch combiné animals + health cases
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Fetch parallèle pour performance
      const [animalsResult, healthResult] = await Promise.all([
        animalsService.getAll(),
        healthCasesService.getOpenCases(),
      ])

      if (animalsResult.error) {
        throw animalsResult.error
      }

      // Construire la map de sévérité (sécurisé)
      const severityMap = buildSeverityMap(healthResult.data || [])

      // Merger les données
      const enrichedAnimals = mergeAnimalsWithHealth(
        animalsResult.data || [],
        severityMap
      )

      setAnimals(enrichedAnimals)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Effect initial + refresh sur version change
  useEffect(() => {
    fetchData()
  }, [animalsVersion])

  const onRefresh = () => fetchData(true)
  const isEmpty = animals.length === 0 && !loading && !error

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all')
  const [healthFilter, setHealthFilter] = useState<FilterHealth>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filtrer les animaux
  const filteredAnimals = useMemo(() => {
    let result = animals

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (animal) =>
          (animal.identifier || animal.tag_number || '').toLowerCase().includes(query) ||
          (animal.name || '').toLowerCase().includes(query) ||
          (animal.breed && animal.breed.toLowerCase().includes(query))
      )
    }

    // Filtre par categorie
    if (categoryFilter !== 'all') {
      result = result.filter((animal) => {
        const category = mapSexToCategory(animal.sex || 'unknown')
        return category === categoryFilter
      })
    }

    // Filtre par santé
    if (healthFilter !== 'all') {
      result = result.filter((animal) => {
        if (healthFilter === 'healthy') {
          return !animal.hasOpenCase
        } else {
          return animal.hasOpenCase
        }
      })
    }

    return result
  }, [animals, searchQuery, categoryFilter, healthFilter])

  // Stats avec données de santé
  const healthStats = useMemo(() => computeHealthStats(animals), [animals])

  const stats = useMemo(() => {
    const activeAnimals = animals.filter((a) => a.status !== 'vendu' && a.status !== 'mort')
    return {
      total: activeAnimals.length,
      sows: activeAnimals.filter((a) => mapSexToCategory(a.sex || a.gender || '') === 'sow').length,
      boars: activeAnimals.filter((a) => mapSexToCategory(a.sex || a.gender || '') === 'boar').length,
      piglets: activeAnimals.filter((a) => mapSexToCategory(a.sex || a.gender || '') === 'piglet').length,
    }
  }, [animals])

  const getAnimalCategory = (sex: string) => {
    return mapSexToCategory(sex) as 'sow' | 'boar' | 'piglet' | 'fattening'
  }

  const renderAnimal = ({ item, index }: { item: AnimalWithHealth; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimalCard
        id={item.id}
        tagNumber={item.identifier || item.tag_number || item.id.slice(0, 8)}
        name={item.name || item.breed || undefined}
        category={getAnimalCategory(item.sex || item.gender || 'unknown')}
        status={item.status as any}
        healthSeverity={item.healthSeverity}
        photoUrl={item.photo_url}
        onPress={() => router.push(`/(tabs)/livestock/${item.id}`)}
      />
    </Animated.View>
  )

  const ListHeader = () => (
    <Animated.View entering={FadeIn} style={styles.listHeader}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: themeColors.primarySurface }]}>
          <Text style={[styles.statValue, { color: themeColors.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: themeColors.surfaceElevated }]}>
          <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.sows}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Truies</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: themeColors.surfaceElevated }]}>
          <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.boars}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Verrats</Text>
        </View>
        {healthStats.withCases > 0 && (
          <View style={[styles.statChip, { backgroundColor: healthStats.critical > 0 ? themeColors.errorLight : themeColors.warningLight }]}>
            <Text style={[styles.statValue, { color: healthStats.critical > 0 ? themeColors.error : themeColors.warning }]}>
              {healthStats.critical > 0 ? healthStats.critical : healthStats.withCases}
            </Text>
            <Text style={[styles.statLabel, { color: healthStats.critical > 0 ? themeColors.error : themeColors.warning }]}>
              {healthStats.critical > 0 ? 'Critiques' : 'Malades'}
            </Text>
          </View>
        )}
      </View>

      {/* Filters Toggle */}
      <ScalePress onPress={() => setShowFilters(!showFilters)}>
        <View style={[styles.filterToggle, { backgroundColor: themeColors.surface }]}>
          <SlidersHorizontal size={18} color={themeColors.textSecondary} />
          <Text style={[styles.filterToggleText, { color: themeColors.textSecondary }]}>
            Filtres
          </Text>
          {(categoryFilter !== 'all' || healthFilter !== 'all') && (
            <Badge label="!" variant="warning" size="sm" />
          )}
        </View>
      </ScalePress>

      {/* Filters Section */}
      {showFilters && (
        <Animated.View entering={FadeIn} style={styles.filtersSection}>
          <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>
            Categorie
          </Text>
          <ChipGroup
            options={categoryFilters}
            selected={categoryFilter}
            onSelect={(value) => setCategoryFilter(value as FilterCategory)}
            style={styles.chipGroup}
          />

          <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>
            Sante
          </Text>
          <ChipGroup
            options={healthFilters}
            selected={healthFilter}
            onSelect={(value) => setHealthFilter(value as FilterHealth)}
            style={styles.chipGroup}
          />
        </Animated.View>
      )}

      {/* Results count */}
      <Text style={[styles.resultsCount, { color: themeColors.textMuted }]}>
        {filteredAnimals.length} animal{filteredAnimals.length !== 1 ? 'x' : ''}
      </Text>
    </Animated.View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <ScreenHeader title={Wording.tabs.livestock} />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un animal..."
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="alert-circle"
            title="Erreur de chargement"
            description={error}
          />
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyContainer}>
            <EmptyState
              type="cheptel"
            title="Aucun animal"
            description="Commencez par ajouter votre premier animal a votre cheptel."
            actionLabel="Ajouter un animal"
            onAction={() => router.push('/(tabs)/livestock/add')}
          />
        </View>
      ) : (
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          renderItem={renderAnimal}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: themeColors.textMuted }]}>
                Aucun resultat pour "{searchQuery}"
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <ScalePress
        onPress={() => router.push('/(tabs)/livestock/add')}
        style={styles.fabContainer}
      >
        <View style={[styles.fab, { backgroundColor: themeColors.primary }]}>
          <Plus size={24} color="#FFFFFF" />
        </View>
      </ScalePress>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  listHeader: {
    paddingVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.small,
    marginTop: 2,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterToggleText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
  },
  filtersSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chipGroup: {
    marginBottom: spacing.sm,
  },
  resultsCount: {
    fontSize: typography.fontSize.small,
    marginBottom: spacing.sm,
  },
  noResults: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: typography.fontSize.body,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
