/**
 * Detail d'une Formule
 * ====================
 * Affiche la composition et les valeurs nutritionnelles
 */

import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ArrowLeft,
  FlaskConical,
  Trash2,
  Star,
  CheckCircle2,
  AlertTriangle,
  Copy,
} from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../../../../lib/designTokens'
import { LoadingScreen } from '../../../../components/ui/LoadingScreen'
import { premiumGradients, premiumShadows } from '../../../../lib/premiumStyles'
import {
  feedFormulationService,
  FeedFormula,
  FormulaIngredient,
  NUTRITIONAL_TARGETS,
  INGREDIENT_CATEGORIES,
} from '../../../../services/feedFormulation'
import { useRefresh } from '../../../../contexts/RefreshContext'

// ======================
// COMPOSANT PRINCIPAL
// ======================

export default function FormulaDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ id: string }>()
  const { refreshFeedStock } = useRefresh()

  const [loading, setLoading] = useState(true)
  const [formula, setFormula] = useState<FeedFormula | null>(null)
  const [ingredients, setIngredients] = useState<FormulaIngredient[]>([])

  const loadFormula = useCallback(async () => {
    if (!params.id) return

    setLoading(true)
    try {
      const { data, error } = await feedFormulationService.getFormulaWithIngredients(params.id)
      if (error) {
        Alert.alert('Erreur', error.message)
        router.back()
      } else if (data) {
        setFormula(data.formula)
        setIngredients(data.ingredients)
      }
    } catch (err) {
      console.error('[FormulaDetail] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    loadFormula()
  }, [loadFormula])

  const handleDelete = () => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer la formule "${formula?.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!params.id) return
            const { error } = await feedFormulationService.deleteFormula(params.id)
            if (error) {
              Alert.alert('Erreur', error.message)
            } else {
              refreshFeedStock()
              router.back()
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return <LoadingScreen message="Chargement..." />
  }

  if (!formula) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Formule introuvable</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const targets = NUTRITIONAL_TARGETS[formula.target_category]

  // Verification des objectifs
  const proteinOk = formula.calculated_protein_pct !== null &&
    formula.calculated_protein_pct >= targets.protein.min &&
    formula.calculated_protein_pct <= targets.protein.max

  const energyOk = formula.calculated_energy_kcal !== null &&
    formula.calculated_energy_kcal >= targets.energy.min &&
    formula.calculated_energy_kcal <= targets.energy.max

  const fiberOk = formula.calculated_fiber_pct !== null &&
    formula.calculated_fiber_pct >= targets.fiber.min &&
    formula.calculated_fiber_pct <= targets.fiber.max

  const isBalanced = proteinOk && energyOk && fiberOk

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{formula.name}</Text>
          <Text style={styles.headerSubtitle}>{targets.label}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={[styles.statusCard, isBalanced ? styles.statusCardOk : styles.statusCardWarning]}>
          {isBalanced ? (
            <>
              <CheckCircle2 size={24} color={colors.success} />
              <Text style={styles.statusTextOk}>Formule equilibree</Text>
            </>
          ) : (
            <>
              <AlertTriangle size={24} color={colors.warning} />
              <Text style={styles.statusTextWarning}>Formule desequilibree</Text>
            </>
          )}
        </View>

        {/* Description */}
        {formula.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{formula.description}</Text>
          </View>
        )}

        {/* Valeurs nutritionnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valeurs nutritionnelles</Text>
          <View style={styles.nutrientsCard}>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Proteines</Text>
              <View style={styles.nutrientValues}>
                <Text style={[styles.nutrientValue, proteinOk ? styles.valueOk : styles.valueError]}>
                  {formula.calculated_protein_pct?.toFixed(1)}%
                </Text>
                <Text style={styles.nutrientTarget}>
                  (objectif: {targets.protein.min}-{targets.protein.max}%)
                </Text>
              </View>
            </View>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Energie</Text>
              <View style={styles.nutrientValues}>
                <Text style={[styles.nutrientValue, energyOk ? styles.valueOk : styles.valueError]}>
                  {formula.calculated_energy_kcal?.toFixed(0)} kcal/kg
                </Text>
                <Text style={styles.nutrientTarget}>
                  (objectif: {targets.energy.min}-{targets.energy.max})
                </Text>
              </View>
            </View>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Fibres</Text>
              <View style={styles.nutrientValues}>
                <Text style={[styles.nutrientValue, fiberOk ? styles.valueOk : styles.valueError]}>
                  {formula.calculated_fiber_pct?.toFixed(1)}%
                </Text>
                <Text style={styles.nutrientTarget}>
                  (objectif: {targets.fiber.min}-{targets.fiber.max}%)
                </Text>
              </View>
            </View>
            <View style={[styles.nutrientRow, styles.costRow]}>
              <Text style={styles.costLabel}>Cout par kg</Text>
              <Text style={styles.costValue}>
                {formula.total_cost_per_kg?.toLocaleString('fr-FR')} FCFA
              </Text>
            </View>
          </View>
        </View>

        {/* Composition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Composition ({ingredients.length} ingredients)</Text>
          <View style={styles.ingredientsList}>
            {ingredients.map((item) => {
              const categoryInfo = INGREDIENT_CATEGORIES.find(
                (c) => c.value === item.ingredient?.category
              )
              return (
                <View key={item.id} style={styles.ingredientItem}>
                  <Text style={styles.ingredientEmoji}>{categoryInfo?.icon || '?'}</Text>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{item.ingredient?.name}</Text>
                    <Text style={styles.ingredientMeta}>
                      {item.ingredient?.protein_pct}% prot. - {item.ingredient?.price_per_kg} FCFA/kg
                    </Text>
                  </View>
                  <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>{item.percentage}%</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Copy to new formula (future feature)
              Alert.alert('Info', 'Fonctionnalite a venir: dupliquer cette formule')
            }}
          >
            <Copy size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Dupliquer cette formule</Text>
          </TouchableOpacity>
        </View>

        {/* Meta */}
        <View style={styles.metaCard}>
          <Text style={styles.metaText}>
            Creee le {new Date(formula.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          {formula.updated_at !== formula.created_at && (
            <Text style={styles.metaText}>
              Modifiee le {new Date(formula.updated_at).toLocaleDateString('fr-FR')}
            </Text>
          )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.body,
    color: colors.error,
  },
  backLink: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  backLinkText: {
    fontSize: typography.fontSize.body,
    color: colors.primary,
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
  deleteButton: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusCardOk: {
    backgroundColor: `${colors.success}15`,
  },
  statusCardWarning: {
    backgroundColor: `${colors.warning}15`,
  },
  statusTextOk: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.success,
  },
  statusTextWarning: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.warning,
  },
  descriptionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...premiumShadows.card.soft,
  },
  descriptionText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  nutrientsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...premiumShadows.card.soft,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  nutrientLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  nutrientValues: {
    alignItems: 'flex-end',
  },
  nutrientValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
  },
  valueOk: {
    color: colors.success,
  },
  valueError: {
    color: colors.error,
  },
  nutrientTarget: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
  costRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  costLabel: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
  },
  costValue: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.primary,
  },
  ingredientsList: {
    gap: spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...premiumShadows.card.soft,
  },
  ingredientEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.text,
  },
  ingredientMeta: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  percentageText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.bold as '700',
    color: '#FFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    ...premiumShadows.card.soft,
  },
  actionButtonText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.primary,
  },
  metaCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  metaText: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
})
