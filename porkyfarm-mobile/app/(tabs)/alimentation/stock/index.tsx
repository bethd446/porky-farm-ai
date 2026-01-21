/**
 * Liste du Stock d'Ingredients
 * ============================
 * Affichage par categorie avec filtres et recherche
 * Gestion des alertes de stock bas
 */

import { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertTriangle,
  Trash2,
  Edit3,
  ArrowLeft,
  X,
} from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../../../../lib/designTokens'
import { premiumGradients, premiumShadows } from '../../../../lib/premiumStyles'
import {
  feedFormulationService,
  FeedIngredient,
  IngredientCategory,
  INGREDIENT_CATEGORIES,
} from '../../../../services/feedFormulation'
import { useListData } from '../../../../hooks/useFocusRefresh'
import { useRefresh } from '../../../../contexts/RefreshContext'

// ======================
// COMPOSANTS LOCAUX
// ======================

interface CategoryFilterProps {
  selected: IngredientCategory | 'all'
  onSelect: (category: IngredientCategory | 'all') => void
}

function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={[styles.filterChip, selected === 'all' && styles.filterChipActive]}
        onPress={() => onSelect('all')}
      >
        <Text style={[styles.filterText, selected === 'all' && styles.filterTextActive]}>
          Tous
        </Text>
      </TouchableOpacity>
      {INGREDIENT_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.value}
          style={[styles.filterChip, selected === cat.value && styles.filterChipActive]}
          onPress={() => onSelect(cat.value)}
        >
          <Text style={styles.filterEmoji}>{cat.icon}</Text>
          <Text style={[styles.filterText, selected === cat.value && styles.filterTextActive]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

interface IngredientCardProps {
  ingredient: FeedIngredient
  isHighlighted: boolean
  onEdit: () => void
  onDelete: () => void
}

function IngredientCard({ ingredient, isHighlighted, onEdit, onDelete }: IngredientCardProps) {
  const categoryInfo = INGREDIENT_CATEGORIES.find((c) => c.value === ingredient.category)
  const isLowStock = ingredient.stock_kg < 10

  const handleDelete = () => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer "${ingredient.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onDelete },
      ]
    )
  }

  return (
    <View
      style={[
        styles.ingredientCard,
        premiumShadows.card.soft,
        isHighlighted && styles.ingredientCardHighlighted,
        isLowStock && styles.ingredientCardWarning,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardEmoji}>{categoryInfo?.icon || '?'}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{ingredient.name}</Text>
            <Text style={styles.cardCategory}>{categoryInfo?.label}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.cardActionBtn} onPress={onEdit}>
            <Edit3 size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardActionBtn} onPress={handleDelete}>
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContent}>
        {/* Stock */}
        <View style={styles.cardRow}>
          <View style={[styles.stockIndicator, isLowStock && styles.stockIndicatorWarning]}>
            {isLowStock && <AlertTriangle size={14} color={colors.warning} />}
            <Text style={[styles.stockValue, isLowStock && styles.stockValueWarning]}>
              {ingredient.stock_kg} kg
            </Text>
          </View>
          <Text style={styles.priceValue}>{ingredient.price_per_kg} FCFA/kg</Text>
        </View>

        {/* Valeurs nutritionnelles */}
        <View style={styles.nutrientsRow}>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientLabel}>Prot.</Text>
            <Text style={styles.nutrientValue}>{ingredient.protein_pct}%</Text>
          </View>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientLabel}>Energie</Text>
            <Text style={styles.nutrientValue}>{ingredient.energy_kcal} kcal</Text>
          </View>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientLabel}>Fibres</Text>
            <Text style={styles.nutrientValue}>{ingredient.fiber_pct}%</Text>
          </View>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientLabel}>Inclusion</Text>
            <Text style={styles.nutrientValue}>
              {ingredient.min_inclusion_pct}-{ingredient.max_inclusion_pct}%
            </Text>
          </View>
        </View>

        {ingredient.notes && (
          <Text style={styles.notes} numberOfLines={2}>{ingredient.notes}</Text>
        )}
      </View>
    </View>
  )
}

// ======================
// COMPOSANT PRINCIPAL
// ======================

export default function StockListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ highlight?: string }>()
  const { feedStockVersion, refreshFeedStock } = useRefresh()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all')
  const [refreshing, setRefreshing] = useState(false)

  const {
    data: ingredients,
    loading,
    refresh,
  } = useListData(() => feedFormulationService.getIngredients(), [feedStockVersion])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const handleDelete = async (id: string) => {
    const { error } = await feedFormulationService.deleteIngredient(id)
    if (error) {
      Alert.alert('Erreur', error.message)
    } else {
      refreshFeedStock()
    }
  }

  // Filtrage
  const filteredIngredients = useMemo(() => {
    let result = ingredients

    // Filtre par categorie
    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.category === selectedCategory)
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((i) => i.name.toLowerCase().includes(query))
    }

    return result
  }, [ingredients, selectedCategory, searchQuery])

  // Stats
  const totalStock = filteredIngredients.reduce((sum, i) => sum + i.stock_kg, 0)
  const lowStockCount = filteredIngredients.filter((i) => i.stock_kg < 10).length

  const renderItem = ({ item }: { item: FeedIngredient }) => (
    <IngredientCard
      ingredient={item}
      isHighlighted={params.highlight === item.id}
      onEdit={() => router.push(`/alimentation/stock/add?edit=${item.id}`)}
      onDelete={() => handleDelete(item.id)}
    />
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Stock ingredients</Text>
          <Text style={styles.headerSubtitle}>
            {filteredIngredients.length} ingredients - {Math.round(totalStock)} kg total
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/alimentation/stock/add')}
        >
          <LinearGradient
            colors={
              (premiumGradients.success?.button && Array.isArray(premiumGradients.success.button) && premiumGradients.success.button.length >= 2)
                ? premiumGradients.success.button
                : ['#40916C', '#52B788'] // Valeur par défaut sécurisée
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Plus size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un ingredient..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres categorie */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={[{ value: 'all' as const, label: 'Tous', icon: '' }, ...INGREDIENT_CATEGORIES]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(item.value as IngredientCategory | 'all')}
            >
              {item.icon && <Text style={styles.filterEmoji}>{item.icon}</Text>}
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Alerte stock bas */}
      {lowStockCount > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={16} color={colors.warning} />
          <Text style={styles.alertText}>
            {lowStockCount} ingredient{lowStockCount > 1 ? 's' : ''} en stock bas ({'<'}10 kg)
          </Text>
        </View>
      )}

      {/* Liste */}
      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun ingredient</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedCategory !== 'all'
                ? 'Essayez avec d\'autres filtres'
                : 'Ajoutez vos premiers ingredients'}
            </Text>
            {!searchQuery && selectedCategory === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/alimentation/stock/add')}
              >
                <Text style={styles.emptyButtonText}>Ajouter un ingredient</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  )
}

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    ...Platform.select({
      ios: premiumShadows.button.default,
      android: premiumShadows.button.default,
    }),
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.bodySmall,
    color: colors.text,
    padding: 0,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
  },
  filtersList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.text,
    fontWeight: typography.fontWeight.medium as '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  alertText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium as '500',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  ingredientCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  ingredientCardHighlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ingredientCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
  },
  cardCategory: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cardActionBtn: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 4,
  },
  stockIndicatorWarning: {
    backgroundColor: `${colors.warning}15`,
  },
  stockValue: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.success,
  },
  stockValueWarning: {
    color: colors.warning,
  },
  priceValue: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.primary,
  },
  nutrientsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
  nutrientValue: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.text,
    marginTop: 2,
  },
  notes: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: '#FFF',
  },
})
