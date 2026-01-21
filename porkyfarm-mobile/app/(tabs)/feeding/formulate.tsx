/**
 * Ecran Fabrication Aliment Maison
 * =================================
 * Formulation de rations personnalisees
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
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  feedFormulationService,
  type FeedIngredient,
  type FormulaCategory,
  type FormulationResult,
  NUTRITIONAL_TARGETS,
  INGREDIENT_CATEGORIES,
} from '../../../services/feedFormulation'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { useToast } from '../../../hooks/useToast'
import { Toast } from '../../../components/Toast'
import { ScreenHeader, LoadingScreen, LoadingInline } from '../../../components/ui'
import {
  FlaskConical,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Trash2,
  Save,
  RefreshCw,
} from 'lucide-react-native'

// Types
interface SelectedIngredient {
  ingredient: FeedIngredient
  percentage: number
}

// Composant principal
export default function FormulateScreen() {
  const router = useRouter()
  const { colors: themeColors } = useTheme()
  const { toast, showSuccess, showError, hideToast } = useToast()

  // Etats
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ingredients, setIngredients] = useState<FeedIngredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [targetCategory, setTargetCategory] = useState<FormulaCategory>('grower')
  const [formulaName, setFormulaName] = useState('')

  // Charger les ingredients
  const loadIngredients = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await feedFormulationService.getIngredients()
      if (error) {
        // Si table n'existe pas, afficher message informatif
        if (error.message?.includes('does not exist') || error.message?.includes('PGRST')) {
          console.log('[Formulate] Table feed_ingredients not available')
          setIngredients([])
        } else {
          showError('Impossible de charger les ingredients')
        }
      } else {
        setIngredients(data || [])
      }
    } catch (err) {
      console.error('[Formulate] Error loading ingredients:', err)
    } finally {
      setLoading(false)
    }
  }, [showError])

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

  // Ajouter/retirer un ingredient
  const toggleIngredient = (ingredient: FeedIngredient) => {
    const existing = selectedIngredients.find((i) => i.ingredient.id === ingredient.id)
    if (existing) {
      setSelectedIngredients(selectedIngredients.filter((i) => i.ingredient.id !== ingredient.id))
    } else {
      setSelectedIngredients([...selectedIngredients, { ingredient, percentage: 10 }])
    }
  }

  // Modifier le pourcentage d'un ingredient
  const updatePercentage = (ingredientId: string, newPercentage: number) => {
    if (newPercentage < 0 || newPercentage > 100) return
    setSelectedIngredients(
      selectedIngredients.map((i) =>
        i.ingredient.id === ingredientId ? { ...i, percentage: newPercentage } : i
      )
    )
  }

  // Calculer le total des pourcentages
  const totalPercentage = useMemo(() => {
    return selectedIngredients.reduce((sum, i) => sum + i.percentage, 0)
  }, [selectedIngredients])

  // Sauvegarder la formule
  const handleSave = async () => {
    if (!formulaName.trim()) {
      showError('Veuillez donner un nom a votre formule')
      return
    }
    if (!result) {
      showError('Veuillez ajouter des ingredients')
      return
    }

    setSaving(true)
    try {
      const { error } = await feedFormulationService.saveFormula(
        formulaName.trim(),
        null,
        targetCategory,
        result
      )

      if (error) {
        showError(error.message || 'Erreur lors de la sauvegarde')
      } else {
        showSuccess('Formule sauvegardee avec succes')
        setTimeout(() => router.back(), 1500)
      }
    } catch (err) {
      showError('Une erreur est survenue')
    } finally {
      setSaving(false)
    }
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
          },
        },
      ]
    )
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
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ScreenHeader title="Fabrication Aliment" showBack onBack={() => router.back()} />
        <LoadingScreen message="Chargement des ingredients..." />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.headerRow}>
        <ScreenHeader
          title="Fabrication Aliment"
          showBack
          onBack={() => router.back()}
        />
        {selectedIngredients.length > 0 && (
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <RefreshCw size={20} color={themeColors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selection categorie cible */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Type d'aliment
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {Object.entries(NUTRITIONAL_TARGETS).map(([key, value]) => {
                const isActive = targetCategory === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isActive ? colors.primary : themeColors.surface,
                        borderColor: isActive ? colors.primary : themeColors.border,
                      },
                    ]}
                    onPress={() => setTargetCategory(key as FormulaCategory)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: isActive ? '#FFF' : themeColors.text },
                      ]}
                    >
                      {value.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          {/* Objectifs nutritionnels */}
          <View style={[styles.targetsCard, { backgroundColor: themeColors.surface }, elevation.xs]}>
            <Text style={[styles.targetsTitle, { color: themeColors.textSecondary }]}>
              Objectifs nutritionnels
            </Text>
            <View style={styles.targetsRow}>
              <View style={styles.targetItem}>
                <Text style={[styles.targetValue, { color: colors.primary }]}>
                  {targets.protein.target}%
                </Text>
                <Text style={[styles.targetLabel, { color: themeColors.textMuted }]}>
                  Proteines
                </Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetValue, { color: colors.warning }]}>
                  {targets.energy.target}
                </Text>
                <Text style={[styles.targetLabel, { color: themeColors.textMuted }]}>
                  kcal/kg
                </Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetValue, { color: colors.info }]}>
                  {targets.fiber.target}%
                </Text>
                <Text style={[styles.targetLabel, { color: themeColors.textMuted }]}>
                  Fibres
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Liste des ingredients */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Ingredients disponibles
          </Text>

          {ingredients.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: themeColors.surface }]}>
              <FlaskConical size={40} color={themeColors.textMuted} />
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
                Aucun ingredient disponible
              </Text>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                La table des ingredients n'est pas encore configuree.
                Executez la migration SQL pour ajouter les ingredients par defaut.
              </Text>
            </View>
          ) : (
            INGREDIENT_CATEGORIES.map((cat) => {
              const catIngredients = groupedIngredients[cat.value] || []
              if (catIngredients.length === 0) return null

              return (
                <View key={cat.value} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryLabel, { color: themeColors.text }]}>
                      {cat.label}
                    </Text>
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
                        themeColors={themeColors}
                      />
                    )
                  })}
                </View>
              )
            })
          )}
        </View>

        {/* Resultat du calcul */}
        {result && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Resultat de la formulation
            </Text>

            {/* Total pourcentage */}
            <View
              style={[
                styles.totalBar,
                {
                  backgroundColor:
                    Math.abs(totalPercentage - 100) < 0.1
                      ? colors.successLight
                      : colors.warningLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.totalText,
                  {
                    color:
                      Math.abs(totalPercentage - 100) < 0.1
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                Total: {totalPercentage.toFixed(1)}%
                {Math.abs(totalPercentage - 100) < 0.1 ? ' ✓' : ' (doit faire 100%)'}
              </Text>
            </View>

            {/* Valeurs calculees */}
            <View style={[styles.resultCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>
                  Proteines
                </Text>
                <Text
                  style={[
                    styles.resultValue,
                    {
                      color:
                        result.totalProtein >= targets.protein.min &&
                        result.totalProtein <= targets.protein.max
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {result.totalProtein}%
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>
                  Energie
                </Text>
                <Text
                  style={[
                    styles.resultValue,
                    {
                      color:
                        result.totalEnergy >= targets.energy.min &&
                        result.totalEnergy <= targets.energy.max
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {result.totalEnergy} kcal/kg
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>
                  Fibres
                </Text>
                <Text
                  style={[
                    styles.resultValue,
                    {
                      color:
                        result.totalFiber >= targets.fiber.min &&
                        result.totalFiber <= targets.fiber.max
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {result.totalFiber}%
                </Text>
              </View>
              <View style={[styles.resultRow, styles.costRow]}>
                <Text style={[styles.resultLabel, { color: themeColors.text, fontWeight: '600' }]}>
                  Cout par kg
                </Text>
                <Text style={[styles.costValue, { color: colors.primary }]}>
                  {result.totalCostPerKg.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>

            {/* Avertissements */}
            {result.warnings.length > 0 && (
              <View style={[styles.warningsCard, { backgroundColor: colors.warningLight }]}>
                <AlertTriangle size={18} color={colors.warning} />
                <View style={styles.warningsContent}>
                  {result.warnings.map((warning, index) => (
                    <Text key={index} style={[styles.warningText, { color: colors.warning }]}>
                      • {warning}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Formulaire sauvegarde */}
            <View style={styles.saveSection}>
              <TextInput
                style={[
                  commonStyles.input,
                  { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border },
                ]}
                value={formulaName}
                onChangeText={setFormulaName}
                placeholder="Nom de la formule (ex: Aliment croissance maison)"
                placeholderTextColor={themeColors.textMuted}
              />

              <TouchableOpacity
                style={[
                  commonStyles.button,
                  commonStyles.buttonPrimary,
                  styles.saveButton,
                  saving && styles.saveButtonDisabled,
                  elevation.md,
                ]}
                onPress={handleSave}
                disabled={saving || !formulaName.trim()}
              >
                {saving ? (
                  <LoadingInline size="small" color="#FFF" />
                ) : (
                  <>
                    <Save size={18} color="#FFF" />
                    <Text style={commonStyles.buttonText}>Sauvegarder la formule</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
    </View>
  )
}

// Sous-composant: Ligne d'ingredient
function IngredientRow({
  ingredient,
  selected,
  onToggle,
  onUpdatePercentage,
  themeColors,
}: {
  ingredient: FeedIngredient
  selected: SelectedIngredient | undefined
  onToggle: () => void
  onUpdatePercentage: (pct: number) => void
  themeColors: any
}) {
  return (
    <View
      style={[
        styles.ingredientRow,
        { backgroundColor: themeColors.surface },
        selected && { borderColor: colors.primary, borderWidth: 1 },
        elevation.xs,
      ]}
    >
      <TouchableOpacity style={styles.ingredientMain} onPress={onToggle} activeOpacity={0.7}>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: selected ? colors.primary : 'transparent',
              borderColor: selected ? colors.primary : themeColors.border,
            },
          ]}
        >
          {selected && <Check size={14} color="#FFF" />}
        </View>
        <View style={styles.ingredientInfo}>
          <Text style={[styles.ingredientName, { color: themeColors.text }]}>{ingredient.name}</Text>
          <Text style={[styles.ingredientMeta, { color: themeColors.textMuted }]}>
            {ingredient.protein_pct}% prot · {ingredient.price_per_kg} FCFA/kg
          </Text>
        </View>
      </TouchableOpacity>

      {selected && (
        <View style={styles.percentageControl}>
          <TouchableOpacity
            style={[styles.percentageButton, { backgroundColor: themeColors.background }]}
            onPress={() => onUpdatePercentage(Math.max(0, selected.percentage - 5))}
          >
            <Minus size={16} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.percentageValue, { color: themeColors.text }]}>
            {selected.percentage}%
          </Text>
          <TouchableOpacity
            style={[styles.percentageButton, { backgroundColor: themeColors.background }]}
            onPress={() => onUpdatePercentage(Math.min(100, selected.percentage + 5))}
          >
            <Plus size={16} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.body,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetButton: {
    padding: spacing.md,
    marginRight: spacing.md,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
  },
  targetsCard: {
    padding: spacing.base,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  targetsTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
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
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
  },
  targetLabel: {
    fontSize: typography.fontSize.caption,
    marginTop: 2,
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  ingredientMeta: {
    fontSize: typography.fontSize.caption,
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
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    minWidth: 45,
    textAlign: 'center',
  },
  totalBar: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  totalText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  resultCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resultLabel: {
    fontSize: typography.fontSize.body,
  },
  resultValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  costRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  costValue: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
  },
  warningsCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningsContent: {
    flex: 1,
  },
  warningText: {
    fontSize: typography.fontSize.bodySmall,
    marginBottom: 2,
  },
  saveSection: {
    marginTop: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
})
