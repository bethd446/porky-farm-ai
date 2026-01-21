/**
 * Dashboard Alimentation
 * ======================
 * Vue centrale du module alimentation:
 * - Apercu du stock d'ingredients
 * - Formules sauvegardees
 * - Actions rapides
 * - Statistiques
 */

import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Package,
  FlaskConical,
  Scale,
  History,
  Plus,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Wheat,
} from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { premiumGradients, premiumShadows } from '../../../lib/premiumStyles'
import { feedFormulationService, FeedIngredient, FeedFormula, INGREDIENT_CATEGORIES } from '../../../services/feedFormulation'
import { useListData } from '../../../hooks/useFocusRefresh'
import { useRefresh } from '../../../contexts/RefreshContext'

// ======================
// COMPOSANTS LOCAUX
// ======================

interface QuickStatProps {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  gradient: readonly [string, string]
  onPress?: () => void
}

function QuickStat({ icon, label, value, subValue, gradient, onPress }: QuickStatProps) {
  return (
    <TouchableOpacity
      style={[styles.statCard, premiumShadows.card.soft]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          (gradient && Array.isArray(gradient) && gradient.length >= 2)
            ? gradient
            : ['#10B981', '#059669'] // Valeur par défaut sécurisée
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statIconContainer}
      >
        {icon}
      </LinearGradient>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
    </TouchableOpacity>
  )
}

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onPress: () => void
  gradient: readonly [string, string]
}

function ActionCard({ icon, title, description, onPress, gradient }: ActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, premiumShadows.card.soft]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={
          (gradient && Array.isArray(gradient) && gradient.length >= 2)
            ? gradient
            : ['#10B981', '#059669'] // Valeur par défaut sécurisée
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionIconContainer}
      >
        {icon}
      </LinearGradient>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

interface IngredientChipProps {
  ingredient: FeedIngredient
  onPress: () => void
}

function IngredientChip({ ingredient, onPress }: IngredientChipProps) {
  const isLowStock = ingredient.stock_kg < 10
  const categoryInfo = INGREDIENT_CATEGORIES.find((c) => c.value === ingredient.category)

  return (
    <TouchableOpacity
      style={[
        styles.ingredientChip,
        premiumShadows.card.soft,
        isLowStock && styles.ingredientChipWarning,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.ingredientEmoji}>{categoryInfo?.icon || '?'}</Text>
      <Text style={styles.ingredientName} numberOfLines={1}>
        {ingredient.name}
      </Text>
      <View style={[styles.stockBadge, isLowStock && styles.stockBadgeWarning]}>
        <Text style={[styles.stockText, isLowStock && styles.stockTextWarning]}>
          {ingredient.stock_kg} kg
        </Text>
      </View>
      {isLowStock && (
        <AlertTriangle size={14} color={colors.warning} style={styles.warningIcon} />
      )}
    </TouchableOpacity>
  )
}

interface FormulaRowProps {
  formula: FeedFormula
  onPress: () => void
}

function FormulaRow({ formula, onPress }: FormulaRowProps) {
  return (
    <TouchableOpacity
      style={[styles.formulaRow, premiumShadows.card.soft]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={
          (premiumGradients.info?.icon && Array.isArray(premiumGradients.info.icon) && premiumGradients.info.icon.length >= 2)
            ? premiumGradients.info.icon
            : ['#457B9D', '#6B9AC4'] // Valeur par défaut sécurisée
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.formulaIcon}
      >
        <FlaskConical size={18} color="#FFF" />
      </LinearGradient>
      <View style={styles.formulaInfo}>
        <Text style={styles.formulaName}>{formula.name}</Text>
        <Text style={styles.formulaTarget}>
          {formula.target_category.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
      <View style={styles.formulaStats}>
        <Text style={styles.formulaCost}>{formula.total_cost_per_kg} FCFA/kg</Text>
        <Text style={styles.formulaProtein}>
          {formula.calculated_protein_pct?.toFixed(1)}% prot.
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

// ======================
// COMPOSANT PRINCIPAL
// ======================

export default function AlimentationDashboard() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { feedStockVersion } = useRefresh()

  // Charger les donnees
  const {
    data: ingredients,
    loading: loadingIngredients,
    refresh: refreshIngredients,
  } = useListData(() => feedFormulationService.getIngredients(), [feedStockVersion])

  const {
    data: formulas,
    loading: loadingFormulas,
    refresh: refreshFormulas,
  } = useListData(() => feedFormulationService.getFormulas(), [feedStockVersion])

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refreshIngredients(), refreshFormulas()])
    setRefreshing(false)
  }, [refreshIngredients, refreshFormulas])

  // Calculs statistiques
  const totalStockKg = ingredients.reduce((sum, i) => sum + i.stock_kg, 0)
  const totalStockValue = ingredients.reduce((sum, i) => sum + i.stock_kg * i.price_per_kg, 0)
  const lowStockCount = ingredients.filter((i) => i.stock_kg < 10).length

  const loading = loadingIngredients || loadingFormulas

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alimentation</Text>
          <Text style={styles.headerSubtitle}>Gerez vos stocks et formules</Text>
        </View>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/alimentation/history')}
        >
          <History size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <QuickStat
            icon={<Package size={20} color="#FFF" />}
            label="Stock total"
            value={`${Math.round(totalStockKg)} kg`}
            subValue={`${(totalStockValue / 1000).toFixed(0)}k FCFA`}
            gradient={premiumGradients.primary.icon}
            onPress={() => router.push('/alimentation/stock')}
          />
          <QuickStat
            icon={<FlaskConical size={20} color="#FFF" />}
            label="Formules"
            value={`${formulas.length}`}
            subValue="sauvegardees"
            gradient={premiumGradients.info.icon}
            onPress={() => router.push('/alimentation/formulas')}
          />
          <QuickStat
            icon={<Scale size={20} color="#FFF" />}
            label="Plans"
            value="0"
            subValue="actifs"
            gradient={premiumGradients.accent.icon}
            onPress={() => router.push('/alimentation/plans')}
          />
        </View>

        {/* Alerte stock bas */}
        {lowStockCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push('/alimentation/stock')}
          >
            <AlertTriangle size={18} color={colors.warning} />
            <Text style={styles.alertText}>
              {lowStockCount} ingredient{lowStockCount > 1 ? 's' : ''} en stock bas
            </Text>
            <ChevronRight size={16} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Section Stock */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stock ingredients</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push('/alimentation/stock')}
            >
              <Text style={styles.sectionActionText}>Voir tout</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {ingredients.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ingredientsScroll}
            >
              {ingredients.slice(0, 8).map((ingredient) => (
                <IngredientChip
                  key={ingredient.id}
                  ingredient={ingredient}
                  onPress={() => router.push(`/alimentation/stock?highlight=${ingredient.id}`)}
                />
              ))}
              <TouchableOpacity
                style={styles.addIngredientChip}
                onPress={() => router.push('/alimentation/stock/add')}
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addIngredientText}>Ajouter</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Wheat size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aucun ingredient en stock</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/alimentation/stock/add')}
              >
                <Text style={styles.emptyButtonText}>Ajouter un ingredient</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section Formules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes formules</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push('/alimentation/formulas')}
            >
              <Text style={styles.sectionActionText}>Voir tout</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {formulas.length > 0 ? (
            <View style={styles.formulasList}>
              {formulas.slice(0, 3).map((formula) => (
                <FormulaRow
                  key={formula.id}
                  formula={formula}
                  onPress={() => router.push(`/alimentation/formulas/${formula.id}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FlaskConical size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aucune formule sauvegardee</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/alimentation/formulas/create')}
              >
                <Text style={styles.emptyButtonText}>Creer une formule</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon={<Plus size={20} color="#FFF" />}
              title="Ajouter au stock"
              description="Enregistrer un achat d'ingredients"
              gradient={premiumGradients.success.icon}
              onPress={() => router.push('/alimentation/stock/add')}
            />
            <ActionCard
              icon={<FlaskConical size={20} color="#FFF" />}
              title="Creer une formule"
              description="Calculer un melange equilibre"
              gradient={premiumGradients.info.icon}
              onPress={() => router.push('/alimentation/formulas/create')}
            />
            <ActionCard
              icon={<Scale size={20} color="#FFF" />}
              title="Plan de rationnement"
              description="Definir les rations par categorie"
              gradient={premiumGradients.accent.icon}
              onPress={() => router.push('/alimentation/plans')}
            />
            <ActionCard
              icon={<TrendingUp size={20} color="#FFF" />}
              title="Statistiques"
              description="Analyser la consommation"
              gradient={premiumGradients.primary.icon}
              onPress={() => router.push('/alimentation/history')}
            />
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  historyButton: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  statSubValue: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
  },
  alertText: {
    flex: 1,
    fontSize: typography.fontSize.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.medium as '500',
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.primary,
    marginRight: 2,
  },
  ingredientsScroll: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  ingredientChip: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    minWidth: 120,
    alignItems: 'center',
  },
  ingredientChipWarning: {
    borderWidth: 1,
    borderColor: `${colors.warning}50`,
  },
  ingredientEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  ingredientName: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stockBadge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  stockBadgeWarning: {
    backgroundColor: `${colors.warning}20`,
  },
  stockText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.success,
  },
  stockTextWarning: {
    color: colors.warning,
  },
  warningIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  addIngredientChip: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addIngredientText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  formulasList: {
    gap: spacing.sm,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  formulaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulaInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  formulaName: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
  },
  formulaTarget: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  formulaStats: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  formulaCost: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.primary,
  },
  formulaProtein: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
  actionsGrid: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
  },
  actionDescription: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: '#FFF',
  },
})
