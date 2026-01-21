/**
 * Ajouter/Modifier un Ingredient
 * ===============================
 * Formulaire complet avec suggestions d'ingredients
 * adaptes a l'Afrique de l'Ouest
 */

import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, Check, ChevronDown, Lightbulb } from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../../../../lib/designTokens'
import { premiumGradients, premiumShadows } from '../../../../lib/premiumStyles'
import {
  feedFormulationService,
  FeedIngredient,
  FeedIngredientInsert,
  IngredientCategory,
  INGREDIENT_CATEGORIES,
} from '../../../../services/feedFormulation'
import { useRefresh } from '../../../../contexts/RefreshContext'

// ======================
// SUGGESTIONS INGREDIENTS
// ======================

interface IngredientSuggestion {
  name: string
  category: IngredientCategory
  protein_pct: number
  energy_kcal: number
  fiber_pct: number
  price_per_kg: number
  max_inclusion_pct: number
}

const INGREDIENT_SUGGESTIONS: IngredientSuggestion[] = [
  // Cereales
  { name: 'Mais grain', category: 'cereal', protein_pct: 9.0, energy_kcal: 365, fiber_pct: 2.3, price_per_kg: 200, max_inclusion_pct: 70 },
  { name: 'Son de ble', category: 'cereal', protein_pct: 15.5, energy_kcal: 275, fiber_pct: 10.0, price_per_kg: 100, max_inclusion_pct: 25 },
  { name: 'Sorgho', category: 'cereal', protein_pct: 11.0, energy_kcal: 339, fiber_pct: 2.0, price_per_kg: 180, max_inclusion_pct: 50 },
  { name: 'Riz (brisures)', category: 'cereal', protein_pct: 7.5, energy_kcal: 360, fiber_pct: 0.5, price_per_kg: 250, max_inclusion_pct: 40 },
  { name: 'Manioc (cossettes)', category: 'cereal', protein_pct: 2.0, energy_kcal: 350, fiber_pct: 3.5, price_per_kg: 80, max_inclusion_pct: 30 },
  { name: 'Mil', category: 'cereal', protein_pct: 10.5, energy_kcal: 340, fiber_pct: 2.5, price_per_kg: 190, max_inclusion_pct: 45 },
  // Proteines
  { name: 'Tourteau de soja', category: 'protein', protein_pct: 44.0, energy_kcal: 330, fiber_pct: 7.0, price_per_kg: 450, max_inclusion_pct: 25 },
  { name: 'Tourteau d\'arachide', category: 'protein', protein_pct: 45.0, energy_kcal: 350, fiber_pct: 6.5, price_per_kg: 350, max_inclusion_pct: 20 },
  { name: 'Tourteau de coton', category: 'protein', protein_pct: 40.0, energy_kcal: 320, fiber_pct: 12.0, price_per_kg: 200, max_inclusion_pct: 15 },
  { name: 'Tourteau de palmiste', category: 'protein', protein_pct: 18.0, energy_kcal: 280, fiber_pct: 15.0, price_per_kg: 150, max_inclusion_pct: 20 },
  { name: 'Farine de poisson', category: 'protein', protein_pct: 60.0, energy_kcal: 295, fiber_pct: 1.0, price_per_kg: 800, max_inclusion_pct: 10 },
  { name: 'Farine de sang', category: 'protein', protein_pct: 80.0, energy_kcal: 320, fiber_pct: 1.0, price_per_kg: 300, max_inclusion_pct: 5 },
  { name: 'Drech de brasserie', category: 'protein', protein_pct: 25.0, energy_kcal: 240, fiber_pct: 16.0, price_per_kg: 120, max_inclusion_pct: 15 },
  // Mineraux
  { name: 'Coquilles d\'huitres', category: 'mineral', protein_pct: 0, energy_kcal: 0, fiber_pct: 0, price_per_kg: 100, max_inclusion_pct: 2 },
  { name: 'Phosphate bicalcique', category: 'mineral', protein_pct: 0, energy_kcal: 0, fiber_pct: 0, price_per_kg: 500, max_inclusion_pct: 2 },
  { name: 'Sel (NaCl)', category: 'mineral', protein_pct: 0, energy_kcal: 0, fiber_pct: 0, price_per_kg: 150, max_inclusion_pct: 0.5 },
  // Vitamines et additifs
  { name: 'Premix vitamines-mineraux', category: 'vitamin', protein_pct: 0, energy_kcal: 0, fiber_pct: 0, price_per_kg: 3000, max_inclusion_pct: 0.5 },
  { name: 'Lysine', category: 'additive', protein_pct: 0, energy_kcal: 0, fiber_pct: 0, price_per_kg: 2500, max_inclusion_pct: 0.3 },
  { name: 'Methionine', category: 'additive', protein_pct: 0, energy_kcal: 0, fiber_pct: 0, price_per_kg: 4000, max_inclusion_pct: 0.2 },
]

// ======================
// COMPOSANTS LOCAUX
// ======================

interface InputFieldProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'
  unit?: string
  multiline?: boolean
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  unit,
  multiline,
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
        {unit && <Text style={styles.inputUnit}>{unit}</Text>}
      </View>
    </View>
  )
}

interface CategorySelectorProps {
  selected: IngredientCategory
  onSelect: (category: IngredientCategory) => void
}

function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const selectedInfo = INGREDIENT_CATEGORIES.find((c) => c.value === selected)

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Categorie</Text>
      <TouchableOpacity
        style={styles.categorySelector}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.categorySelectorEmoji}>{selectedInfo?.icon}</Text>
        <Text style={styles.categorySelectorText}>{selectedInfo?.label}</Text>
        <ChevronDown
          size={20}
          color={colors.textMuted}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.categoryOptions}>
          {INGREDIENT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryOption,
                selected === cat.value && styles.categoryOptionActive,
              ]}
              onPress={() => {
                onSelect(cat.value)
                setExpanded(false)
              }}
            >
              <Text style={styles.categoryOptionEmoji}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryOptionText,
                  selected === cat.value && styles.categoryOptionTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

interface SuggestionListProps {
  category: IngredientCategory
  onSelect: (suggestion: IngredientSuggestion) => void
  currentName: string
}

function SuggestionList({ category, onSelect, currentName }: SuggestionListProps) {
  const suggestions = useMemo(() => {
    return INGREDIENT_SUGGESTIONS.filter(
      (s) => s.category === category && s.name.toLowerCase() !== currentName.toLowerCase()
    )
  }, [category, currentName])

  if (suggestions.length === 0) return null

  return (
    <View style={styles.suggestionsContainer}>
      <View style={styles.suggestionsHeader}>
        <Lightbulb size={16} color={colors.warning} />
        <Text style={styles.suggestionsTitle}>Suggestions</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsList}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.name}
            style={styles.suggestionChip}
            onPress={() => onSelect(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

// ======================
// COMPOSANT PRINCIPAL
// ======================

export default function AddStockScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ edit?: string }>()
  const { refreshFeedStock } = useRefresh()

  const isEditMode = !!params.edit
  const [loading, setLoading] = useState(false)
  const [loadingIngredient, setLoadingIngredient] = useState(isEditMode)

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState<IngredientCategory>('cereal')
  const [proteinPct, setProteinPct] = useState('')
  const [energyKcal, setEnergyKcal] = useState('')
  const [fiberPct, setFiberPct] = useState('')
  const [calciumPct, setCalciumPct] = useState('')
  const [phosphorusPct, setPhosphorusPct] = useState('')
  const [stockKg, setStockKg] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [minInclusion, setMinInclusion] = useState('0')
  const [maxInclusion, setMaxInclusion] = useState('100')
  const [notes, setNotes] = useState('')

  // Charger l'ingredient en mode edition
  useEffect(() => {
    if (isEditMode && params.edit) {
      loadIngredient(params.edit)
    }
  }, [isEditMode, params.edit])

  const loadIngredient = async (id: string) => {
    setLoadingIngredient(true)
    const { data } = await feedFormulationService.getIngredients()
    const ingredient = data?.find((i) => i.id === id)
    if (ingredient) {
      setName(ingredient.name)
      setCategory(ingredient.category)
      setProteinPct(ingredient.protein_pct.toString())
      setEnergyKcal(ingredient.energy_kcal.toString())
      setFiberPct(ingredient.fiber_pct.toString())
      setCalciumPct(ingredient.calcium_pct?.toString() || '')
      setPhosphorusPct(ingredient.phosphorus_pct?.toString() || '')
      setStockKg(ingredient.stock_kg.toString())
      setPricePerKg(ingredient.price_per_kg.toString())
      setMinInclusion(ingredient.min_inclusion_pct.toString())
      setMaxInclusion(ingredient.max_inclusion_pct.toString())
      setNotes(ingredient.notes || '')
    }
    setLoadingIngredient(false)
  }

  const handleSuggestionSelect = (suggestion: IngredientSuggestion) => {
    setName(suggestion.name)
    setCategory(suggestion.category)
    setProteinPct(suggestion.protein_pct.toString())
    setEnergyKcal(suggestion.energy_kcal.toString())
    setFiberPct(suggestion.fiber_pct.toString())
    setPricePerKg(suggestion.price_per_kg.toString())
    setMaxInclusion(suggestion.max_inclusion_pct.toString())
  }

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire')
      return
    }
    if (!pricePerKg || parseFloat(pricePerKg) <= 0) {
      Alert.alert('Erreur', 'Le prix est obligatoire')
      return
    }

    setLoading(true)

    const ingredientData: FeedIngredientInsert = {
      name: name.trim(),
      category,
      protein_pct: parseFloat(proteinPct) || 0,
      energy_kcal: parseFloat(energyKcal) || 0,
      fiber_pct: parseFloat(fiberPct) || 0,
      calcium_pct: calciumPct ? parseFloat(calciumPct) : null,
      phosphorus_pct: phosphorusPct ? parseFloat(phosphorusPct) : null,
      stock_kg: parseFloat(stockKg) || 0,
      price_per_kg: parseFloat(pricePerKg),
      min_inclusion_pct: parseFloat(minInclusion) || 0,
      max_inclusion_pct: parseFloat(maxInclusion) || 100,
      notes: notes.trim() || null,
    }

    try {
      if (isEditMode && params.edit) {
        const { error } = await feedFormulationService.updateIngredient(params.edit, ingredientData)
        if (error) throw error
      } else {
        const { error } = await feedFormulationService.addIngredient(ingredientData)
        if (error) throw error
      }

      refreshFeedStock()
      router.back()
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (loadingIngredient) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Modifier ingredient' : 'Ajouter ingredient'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
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
            <Check size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Categorie */}
        <CategorySelector selected={category} onSelect={setCategory} />

        {/* Suggestions */}
        <SuggestionList
          category={category}
          onSelect={handleSuggestionSelect}
          currentName={name}
        />

        {/* Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          <InputField
            label="Nom de l'ingredient"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Mais grain"
          />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <InputField
                label="Stock actuel"
                value={stockKg}
                onChangeText={setStockKg}
                placeholder="0"
                keyboardType="decimal-pad"
                unit="kg"
              />
            </View>
            <View style={styles.halfField}>
              <InputField
                label="Prix"
                value={pricePerKg}
                onChangeText={setPricePerKg}
                placeholder="0"
                keyboardType="numeric"
                unit="FCFA/kg"
              />
            </View>
          </View>
        </View>

        {/* Valeurs nutritionnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valeurs nutritionnelles (pour 100g)</Text>
          <View style={styles.row}>
            <View style={styles.thirdField}>
              <InputField
                label="Proteines"
                value={proteinPct}
                onChangeText={setProteinPct}
                placeholder="0"
                keyboardType="decimal-pad"
                unit="%"
              />
            </View>
            <View style={styles.thirdField}>
              <InputField
                label="Energie"
                value={energyKcal}
                onChangeText={setEnergyKcal}
                placeholder="0"
                keyboardType="numeric"
                unit="kcal"
              />
            </View>
            <View style={styles.thirdField}>
              <InputField
                label="Fibres"
                value={fiberPct}
                onChangeText={setFiberPct}
                placeholder="0"
                keyboardType="decimal-pad"
                unit="%"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <InputField
                label="Calcium"
                value={calciumPct}
                onChangeText={setCalciumPct}
                placeholder="0"
                keyboardType="decimal-pad"
                unit="%"
              />
            </View>
            <View style={styles.halfField}>
              <InputField
                label="Phosphore"
                value={phosphorusPct}
                onChangeText={setPhosphorusPct}
                placeholder="0"
                keyboardType="decimal-pad"
                unit="%"
              />
            </View>
          </View>
        </View>

        {/* Limites d'inclusion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limites d'inclusion dans la ration</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <InputField
                label="Minimum"
                value={minInclusion}
                onChangeText={setMinInclusion}
                placeholder="0"
                keyboardType="decimal-pad"
                unit="%"
              />
            </View>
            <View style={styles.halfField}>
              <InputField
                label="Maximum"
                value={maxInclusion}
                onChangeText={setMaxInclusion}
                placeholder="100"
                keyboardType="decimal-pad"
                unit="%"
              />
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <InputField
            label="Notes (optionnel)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Informations supplementaires..."
            multiline
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  saveButton: {
    ...Platform.select({
      ios: premiumShadows.button.default,
      android: premiumShadows.button.default,
    }),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputUnit: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
    paddingRight: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  thirdField: {
    flex: 1,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categorySelectorEmoji: {
    fontSize: 20,
  },
  categorySelectorText: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.text,
  },
  categoryOptions: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryOptionActive: {
    backgroundColor: `${colors.primary}15`,
  },
  categoryOptionEmoji: {
    fontSize: 18,
  },
  categoryOptionText: {
    fontSize: typography.fontSize.body,
    color: colors.text,
  },
  categoryOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold as '600',
  },
  suggestionsContainer: {
    backgroundColor: `${colors.warning}10`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.warning,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.text,
  },
})
