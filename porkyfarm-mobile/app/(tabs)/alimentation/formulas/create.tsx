/**
 * Creer une Formule d'Aliment
 * ============================
 * Selection d'ingredients et calcul en temps reel
 * Adapte aux pratiques Afrique de l'Ouest
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ArrowLeft,
  FlaskConical,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Save,
  RefreshCw,
  Wheat,
} from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../../../../lib/designTokens'
import { premiumGradients, premiumShadows } from '../../../../lib/premiumStyles'
import { LoadingScreen, LoadingInline } from '../../../../components/ui'
import {
  feedFormulationService,
  FeedIngredient,
  FormulaCategory,
  FormulationResult,
  NUTRITIONAL_TARGETS,
  INGREDIENT_CATEGORIES,
} from '../../../../services/feedFormulation'
import { useRefresh } from '../../../../contexts/RefreshContext'

// Types
interface SelectedIngredient {
  ingredient: FeedIngredient
  percentage: number
}

// ======================
// COMPOSANTS LOCAUX
// ======================

interface CategoryChipProps {
  category: FormulaCategory
  label: string
  isActive: boolean
  onPress: () => void
}

function CategoryChip({ category, label, isActive, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

interface IngredientRowProps {
  ingredient: FeedIngredient
  selected?: SelectedIngredient
  onToggle: () => void
  onUpdatePercentage: (pct: number) => void
}

function IngredientRow({ ingredient, selected, onToggle, onUpdatePercentage }: IngredientRowProps) {
  return (
    <View style={[styles.ingredientRow, selected && styles.ingredientRowSelected]}>
      <TouchableOpacity style={styles.ingredientMain} onPress={onToggle} activeOpacity={0.7}>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Check size={14} color="#FFF" />}
        </View>
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{ingredient.name}</Text>
          <Text style={styles.ingredientMeta}>
            {ingredient.protein_pct}% prot. - {ingredient.price_per_kg} FCFA/kg
          </Text>
        </View>
      </TouchableOpacity>

      {selected && (
        <View style={styles.percentageControl}>
          <TouchableOpacity
            style={styles.percentageButton}
            onPress={() => onUpdatePercentage(Math.max(0, selected.percentage - 5))}
          >
            <Minus size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.percentageValue}>{selected.percentage}%</Text>
          <TouchableOpacity
            style={styles.percentageButton}
            onPress={() => onUpdatePercentage(Math.min(100, selected.percentage + 5))}
          >
            <Plus size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// ======================
// COMPOSANT PRINCIPAL
// ======================

export default function CreateFormulaScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { refreshFeedStock } = useRefresh()

  // Etats
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ingredients, setIngredients] = useState<FeedIngredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [targetCategory, setTargetCategory] = useState<FormulaCategory>('grower')
  const [formulaName, setFormulaName] = useState('')
  const [description, setDescription] = useState('')

  // Charger les ingredients
  const loadIngredients = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await feedFormulationService.getIngredients()
      if (error) {
        console.error('[CreateFormula] Error:', error)
        setIngredients([])
      } else {
        setIngredients(data || [])
      }
    } catch (err) {
      console.error('[CreateFormula] Error loading ingredients:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIngredients()
  }, [loadIngredients])

  // Calcul du resultat en temps reel
  const result = useMemo((): FormulationResult | null => {
    if (selectedIngredients.length === 0) return null
    return feedFormulationService.calculateFormula(selectedIngredients, targetCategory)
  }, [selectedIngredients, targetCategory])

  // Objectifs pour la categorie selectionnee
  const targets = NUTRITIONAL_TARGETS[targetCategory]

  // Total des pourcentages
  const totalPercentage = useMemo(() => {
    return selectedIngredients.reduce((sum, i) => sum + i.percentage, 0)
  }, [selectedIngredients])

  // Ajouter/retirer un ingredient
  const toggleIngredient = (ingredient: FeedIngredient) => {
    const existing = selectedIngredients.find((i) => i.ingredient.id === ingredient.id)
    if (existing) {
      setSelectedIngredients(selectedIngredients.filter((i) => i.ingredient.id !== ingredient.id))
    } else {
      setSelectedIngredients([...selectedIngredients, { ingredient, percentage: 10 }])
    }
  }

  // Modifier le pourcentage
  const updatePercentage = (ingredientId: string, newPercentage: number) => {
    if (newPercentage < 0 || newPercentage > 100) return
    setSelectedIngredients(
      selectedIngredients.map((i) =>
        i.ingredient.id === ingredientId ? { ...i, percentage: newPercentage } : i
      )
    )
  }

  // Reinitialiser
  const handleReset = () => {
    Alert.alert(
      'Reinitialiser',
      'Voulez-vous effacer tous les ingredients selectionnes ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Reinitialiser',
          style: 'destructive',
          onPress: () => {
            setSelectedIngredients([])
            setFormulaName('')
            setDescription('')
          },
        },
      ]
    )
  }

  // Sauvegarder
  const handleSave = async () => {
    if (!formulaName.trim()) {
      Alert.alert('Erreur', 'Veuillez donner un nom a votre formule')
      return
    }
    if (!result) {
      Alert.alert('Erreur', 'Veuillez ajouter des ingredients')
      return
    }

    setSaving(true)
    try {
      const { error } = await feedFormulationService.saveFormula(
        formulaName.trim(),
        description.trim() || null,
        targetCategory,
        result
      )

      if (error) {
        Alert.alert('Erreur', error.message)
      } else {
        refreshFeedStock()
        Alert.alert('Succes', 'Formule sauvegardee avec succes', [
          { text: 'OK', onPress: () => router.back() },
        ])
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  // Grouper les ingredients par categorie
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, FeedIngredient[]> = {}
    for (const ing of ingredients) {
      if (!groups[ing.category]) {
        groups[ing.category] = []
      }
      groups[ing.category].push(ing)
    }
    return groups
  }, [ingredients])

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingScreen message="Chargement des ingredients..." />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Creer une formule</Text>
        </View>
        {selectedIngredients.length > 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RefreshCw size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type d'aliment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'aliment</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {Object.entries(NUTRITIONAL_TARGETS).map(([key, value]) => (
                <CategoryChip
                  key={key}
                  category={key as FormulaCategory}
                  label={value.label}
                  isActive={targetCategory === key}
                  onPress={() => setTargetCategory(key as FormulaCategory)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Objectifs */}
          <View style={styles.targetsCard}>
            <Text style={styles.targetsTitle}>Objectifs nutritionnels</Text>
            <View style={styles.targetsRow}>
              <View style={styles.targetItem}>
                <Text style={[styles.targetValue, { color: colors.primary }]}>
                  {targets.protein.target}%
                </Text>
                <Text style={styles.targetLabel}>Proteines</Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetValue, { color: colors.warning }]}>
                  {targets.energy.target}
                </Text>
                <Text style={styles.targetLabel}>kcal/kg</Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetValue, { color: colors.info }]}>
                  {targets.fiber.target}%
                </Text>
                <Text style={styles.targetLabel}>Fibres</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients disponibles</Text>

          {ingredients.length === 0 ? (
            <View style={styles.emptyCard}>
              <Wheat size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aucun ingredient</Text>
              <Text style={styles.emptyText}>
                Ajoutez d'abord des ingredients dans votre stock
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/alimentation/stock/add')}
              >
                <Text style={styles.emptyButtonText}>Ajouter des ingredients</Text>
              </TouchableOpacity>
            </View>
          ) : (
            INGREDIENT_CATEGORIES.map((cat) => {
              const catIngredients = groupedIngredients[cat.value] || []
              if (catIngredients.length === 0) return null

              return (
                <View key={cat.value} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                  </View>

                  {catIngredients.map((ingredient) => {
                    const selected = selectedIngredients.find(
                      (i) => i.ingredient.id === ingredient.id
                    )
                    return (
                      <IngredientRow
                        key={ingredient.id}
                        ingredient={ingredient}
                        selected={selected}
                        onToggle={() => toggleIngredient(ingredient)}
                        onUpdatePercentage={(pct) => updatePercentage(ingredient.id, pct)}
                      />
                    )
                  })}
                </View>
              )
            })
          )}
        </View>

        {/* Resultat */}
        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultat de la formulation</Text>

            {/* Total */}
            <View
              style={[
                styles.totalBar,
                Math.abs(totalPercentage - 100) < 0.1 ? styles.totalBarOk : styles.totalBarWarning,
              ]}
            >
              <Text
                style={[
                  styles.totalText,
                  Math.abs(totalPercentage - 100) < 0.1 ? styles.totalTextOk : styles.totalTextWarning,
                ]}
              >
                Total: {totalPercentage.toFixed(1)}%
                {Math.abs(totalPercentage - 100) < 0.1 ? ' ' : ' (doit faire 100%)'}
              </Text>
            </View>

            {/* Valeurs calculees */}
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Proteines</Text>
                <Text
                  style={[
                    styles.resultValue,
                    result.totalProtein >= targets.protein.min &&
                    result.totalProtein <= targets.protein.max
                      ? styles.resultValueOk
                      : styles.resultValueError,
                  ]}
                >
                  {result.totalProtein}%
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Energie</Text>
                <Text
                  style={[
                    styles.resultValue,
                    result.totalEnergy >= targets.energy.min &&
                    result.totalEnergy <= targets.energy.max
                      ? styles.resultValueOk
                      : styles.resultValueError,
                  ]}
                >
                  {result.totalEnergy} kcal/kg
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Fibres</Text>
                <Text
                  style={[
                    styles.resultValue,
                    result.totalFiber >= targets.fiber.min &&
                    result.totalFiber <= targets.fiber.max
                      ? styles.resultValueOk
                      : styles.resultValueError,
                  ]}
                >
                  {result.totalFiber}%
                </Text>
              </View>
              <View style={[styles.resultRow, styles.costRow]}>
                <Text style={styles.costLabel}>Cout par kg</Text>
                <Text style={styles.costValue}>
                  {result.totalCostPerKg.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>

            {/* Avertissements */}
            {result.warnings.length > 0 && (
              <View style={styles.warningsCard}>
                <AlertTriangle size={18} color={colors.warning} />
                <View style={styles.warningsContent}>
                  {result.warnings.map((warning, index) => (
                    <Text key={index} style={styles.warningText}>
                      {warning}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Sauvegarde */}
            <View style={styles.saveSection}>
              <TextInput
                style={styles.nameInput}
                value={formulaName}
                onChangeText={setFormulaName}
                placeholder="Nom de la formule *"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.nameInput, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optionnel)"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving || !formulaName.trim()}
              >
                <LinearGradient
                  colors={
                    (premiumGradients.success?.button && Array.isArray(premiumGradients.success.button) && premiumGradients.success.button.length >= 2)
                      ? premiumGradients.success.button
                      : ['#40916C', '#52B788'] // Valeur par défaut sécurisée
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  {saving ? (
                    <LoadingInline size="small" color="#FFF" />
                  ) : (
                    <>
                      <Save size={20} color="#FFF" />
                      <Text style={styles.saveButtonText}>Sauvegarder la formule</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  resetButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  targetsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...premiumShadows.card.soft,
  },
  targetsTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  targetItem: {
    alignItems: 'center',
  },
  targetValue: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold as '700',
  },
  targetLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.text,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...premiumShadows.card.soft,
  },
  ingredientRowSelected: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ingredientMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  percentageControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  percentageButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text,
    minWidth: 45,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...premiumShadows.card.soft,
  },
  emptyTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: '#FFF',
  },
  totalBar: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalBarOk: {
    backgroundColor: `${colors.success}20`,
  },
  totalBarWarning: {
    backgroundColor: `${colors.warning}20`,
  },
  totalText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
  },
  totalTextOk: {
    color: colors.success,
  },
  totalTextWarning: {
    color: colors.warning,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...premiumShadows.card.soft,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resultLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
  },
  resultValueOk: {
    color: colors.success,
  },
  resultValueError: {
    color: colors.error,
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
  warningsCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.warning}15`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningsContent: {
    flex: 1,
  },
  warningText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.warning,
    marginBottom: 2,
  },
  saveSection: {
    marginTop: spacing.md,
  },
  nameInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: premiumShadows.button.default,
      android: premiumShadows.button.default,
    }),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: '#FFF',
  },
})
