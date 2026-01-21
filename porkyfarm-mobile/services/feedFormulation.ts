/**
 * Service Fabrication d'Aliment Maison - ADAPTÉ POUR FARM_ID (V2.0)
 * ==================================================================
 * Gestion des ingredients et formules personnalisées
 * Adapté aux pratiques Afrique de l'Ouest
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { getNowISO } from '../lib/dateUtils'
import { getCurrentFarmId } from '../lib/farmHelpers'
import { logger } from '../lib/logger'

// ========================
// TYPES
// ========================

export type IngredientCategory = 'cereal' | 'protein' | 'mineral' | 'vitamin' | 'additive'
export type FormulaCategory = 'starter' | 'grower' | 'finisher' | 'sow_gestation' | 'sow_lactation' | 'boar'

// Interface alignée avec la table feed_ingredients (V2.0)
export interface FeedIngredient {
  id: string
  farm_id: string
  name: string
  category: IngredientCategory
  protein_pct: number
  energy_kcal: number
  fiber_pct: number
  calcium_pct: number | null
  phosphorus_pct: number | null
  stock_kg: number
  price_per_kg: number
  min_inclusion_pct: number
  max_inclusion_pct: number
  notes: string | null
  created_at: string
  updated_at: string
  // Compatibilité
  user_id?: string
}

export interface FeedIngredientInsert {
  name: string
  category: IngredientCategory
  protein_pct?: number
  energy_kcal?: number
  fiber_pct?: number
  calcium_pct?: number | null
  phosphorus_pct?: number | null
  stock_kg?: number
  price_per_kg: number
  min_inclusion_pct?: number
  max_inclusion_pct?: number
  notes?: string | null
}

export interface FeedIngredientUpdate {
  name?: string
  category?: IngredientCategory
  protein_pct?: number
  energy_kcal?: number
  fiber_pct?: number
  calcium_pct?: number | null
  phosphorus_pct?: number | null
  stock_kg?: number
  price_per_kg?: number
  min_inclusion_pct?: number
  max_inclusion_pct?: number
  notes?: string | null
}

// Interface alignée avec la table feed_formulas (V2.0)
export interface FeedFormula {
  id: string
  farm_id: string
  name: string
  description: string | null
  target_category: FormulaCategory
  target_protein_pct: number | null
  target_energy_kcal: number | null
  target_fiber_pct: number | null
  calculated_protein_pct: number | null
  calculated_energy_kcal: number | null
  calculated_fiber_pct: number | null
  total_cost_per_kg: number | null
  is_favorite: boolean
  created_at: string
  updated_at: string
  // Compatibilité
  user_id?: string
}

export interface FormulaIngredient {
  id: string
  formula_id: string
  ingredient_id: string
  percentage: number
  ingredient?: FeedIngredient
}

export interface FormulationResult {
  ingredients: Array<{
    ingredient: FeedIngredient
    percentage: number
  }>
  totalProtein: number
  totalEnergy: number
  totalFiber: number
  totalCostPerKg: number
  isBalanced: boolean
  warnings: string[]
}

// Objectifs nutritionnels par categorie (standard Afrique de l'Ouest)
export const NUTRITIONAL_TARGETS: Record<FormulaCategory, {
  protein: { min: number; max: number; target: number }
  energy: { min: number; max: number; target: number }
  fiber: { min: number; max: number; target: number }
  label: string
}> = {
  starter: {
    protein: { min: 20, max: 24, target: 22 },
    energy: { min: 3200, max: 3400, target: 3300 },
    fiber: { min: 3, max: 5, target: 4 },
    label: 'Demarrage (0-25 kg)',
  },
  grower: {
    protein: { min: 16, max: 20, target: 18 },
    energy: { min: 3100, max: 3300, target: 3200 },
    fiber: { min: 4, max: 6, target: 5 },
    label: 'Croissance (25-60 kg)',
  },
  finisher: {
    protein: { min: 14, max: 16, target: 15 },
    energy: { min: 3000, max: 3200, target: 3100 },
    fiber: { min: 5, max: 7, target: 6 },
    label: 'Finition (60+ kg)',
  },
  sow_gestation: {
    protein: { min: 12, max: 14, target: 13 },
    energy: { min: 2800, max: 3000, target: 2900 },
    fiber: { min: 7, max: 10, target: 8 },
    label: 'Truie gestation',
  },
  sow_lactation: {
    protein: { min: 16, max: 20, target: 18 },
    energy: { min: 3200, max: 3400, target: 3300 },
    fiber: { min: 5, max: 7, target: 6 },
    label: 'Truie lactation',
  },
  boar: {
    protein: { min: 14, max: 16, target: 15 },
    energy: { min: 2900, max: 3100, target: 3000 },
    fiber: { min: 6, max: 8, target: 7 },
    label: 'Verrat reproducteur',
  },
}

export const INGREDIENT_CATEGORIES: Array<{ value: IngredientCategory; label: string; icon: string }> = [
  { value: 'cereal', label: 'Cereales', icon: '🌾' },
  { value: 'protein', label: 'Proteines', icon: '🫘' },
  { value: 'mineral', label: 'Mineraux', icon: '🧂' },
  { value: 'vitamin', label: 'Vitamines', icon: '💊' },
  { value: 'additive', label: 'Additifs', icon: '🧪' },
]

// ========================
// SERVICE
// ========================

export const feedFormulationService = {
  // ========================
  // INGREDIENTS
  // ========================

  /**
   * Recuperer tous les ingredients de la ferme
   */
  async getIngredients(farmId?: string): Promise<{ data: FeedIngredient[] | null; error: Error | null }> {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<FeedIngredient[]>(
        async () =>
          await supabase
            .from('feed_ingredients')
            .select('*')
            .eq('farm_id', targetFarmId)
            .order('category')
            .order('name'),
        'feed_ingredients',
        true
      )
    } catch (err) {
      logger.error('[feedFormulation.getIngredients] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Recuperer les ingredients par categorie
   */
  async getIngredientsByCategory(category: IngredientCategory, farmId?: string): Promise<{ data: FeedIngredient[] | null; error: Error | null }> {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<FeedIngredient[]>(
        async () =>
          await supabase
            .from('feed_ingredients')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('category', category)
            .order('name'),
        'feed_ingredients',
        true
      )
    } catch (err) {
      logger.error('[feedFormulation.getIngredientsByCategory] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer un ingrédient par ID
   */
  async getIngredientById(id: string): Promise<{ data: FeedIngredient | null; error: Error | null }> {
    try {
      return safeSupabaseQuery<FeedIngredient>(
        async () =>
          await supabase
            .from('feed_ingredients')
            .select('*')
            .eq('id', id)
            .single(),
        'feed_ingredients',
        false
      )
    } catch (err) {
      logger.error('[feedFormulation.getIngredientById] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Ajouter un ingredient
   */
  async addIngredient(ingredient: FeedIngredientInsert, farmId?: string): Promise<{ data: FeedIngredient | null; error: Error | null }> {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<FeedIngredient>(
        async () =>
          await supabase
            .from('feed_ingredients')
            .insert({
              ...ingredient,
              farm_id: targetFarmId,
              protein_pct: ingredient.protein_pct ?? 0,
              energy_kcal: ingredient.energy_kcal ?? 0,
              fiber_pct: ingredient.fiber_pct ?? 0,
              stock_kg: ingredient.stock_kg ?? 0,
              min_inclusion_pct: ingredient.min_inclusion_pct ?? 0,
              max_inclusion_pct: ingredient.max_inclusion_pct ?? 100,
            })
            .select()
            .single(),
        'feed_ingredients',
        false
      )
    } catch (err) {
      logger.error('[feedFormulation.addIngredient] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Mettre a jour un ingredient
   */
  async updateIngredient(id: string, updates: FeedIngredientUpdate): Promise<{ data: FeedIngredient | null; error: Error | null }> {
    try {
      return safeSupabaseQuery<FeedIngredient>(
        async () =>
          await supabase
            .from('feed_ingredients')
            .update({ ...updates, updated_at: getNowISO() })
            .eq('id', id)
            .select()
            .single(),
        'feed_ingredients',
        false
      )
    } catch (err) {
      logger.error('[feedFormulation.updateIngredient] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer un ingredient
   */
  async deleteIngredient(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('feed_ingredients')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[feedFormulation.deleteIngredient] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  // ========================
  // FORMULATION / CALCUL
  // ========================

  /**
   * Calculer les valeurs nutritionnelles d'un melange
   */
  calculateFormula(
    ingredients: Array<{ ingredient: FeedIngredient; percentage: number }>,
    targetCategory: FormulaCategory
  ): FormulationResult {
    const warnings: string[] = []
    const target = NUTRITIONAL_TARGETS[targetCategory]

    // Verifier que le total fait 100%
    const totalPercentage = ingredients.reduce((sum, i) => sum + i.percentage, 0)
    if (Math.abs(totalPercentage - 100) > 0.1) {
      warnings.push(`Le total des ingredients fait ${totalPercentage.toFixed(1)}% au lieu de 100%`)
    }

    // Calculer les valeurs nutritionnelles ponderees
    let totalProtein = 0
    let totalEnergy = 0
    let totalFiber = 0
    let totalCost = 0

    for (const { ingredient, percentage } of ingredients) {
      const factor = percentage / 100

      totalProtein += ingredient.protein_pct * factor
      totalEnergy += ingredient.energy_kcal * factor * 10 // Convertir en kcal/kg
      totalFiber += ingredient.fiber_pct * factor
      totalCost += ingredient.price_per_kg * factor

      // Verifier les limites d'inclusion
      if (percentage < ingredient.min_inclusion_pct) {
        warnings.push(`${ingredient.name}: taux trop faible (min ${ingredient.min_inclusion_pct}%)`)
      }
      if (percentage > ingredient.max_inclusion_pct) {
        warnings.push(`${ingredient.name}: taux trop eleve (max ${ingredient.max_inclusion_pct}%)`)
      }
    }

    // Verifier les objectifs nutritionnels
    const isProteinOk = totalProtein >= target.protein.min && totalProtein <= target.protein.max
    const isEnergyOk = totalEnergy >= target.energy.min && totalEnergy <= target.energy.max
    const isFiberOk = totalFiber >= target.fiber.min && totalFiber <= target.fiber.max

    if (!isProteinOk) {
      warnings.push(`Proteines: ${totalProtein.toFixed(1)}% (objectif: ${target.protein.min}-${target.protein.max}%)`)
    }
    if (!isEnergyOk) {
      warnings.push(`Energie: ${totalEnergy.toFixed(0)} kcal/kg (objectif: ${target.energy.min}-${target.energy.max})`)
    }
    if (!isFiberOk) {
      warnings.push(`Fibres: ${totalFiber.toFixed(1)}% (objectif: ${target.fiber.min}-${target.fiber.max}%)`)
    }

    return {
      ingredients,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalEnergy: Math.round(totalEnergy),
      totalFiber: Math.round(totalFiber * 10) / 10,
      totalCostPerKg: Math.round(totalCost),
      isBalanced: isProteinOk && isEnergyOk && isFiberOk && warnings.length === 0,
      warnings,
    }
  },

  // ========================
  // FORMULES SAUVEGARDEES
  // ========================

  /**
   * Recuperer toutes les formules
   */
  async getFormulas(farmId?: string): Promise<{ data: FeedFormula[] | null; error: Error | null }> {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<FeedFormula[]>(
        async () =>
          await supabase
            .from('feed_formulas')
            .select('*')
            .eq('farm_id', targetFarmId)
            .order('is_favorite', { ascending: false })
            .order('created_at', { ascending: false }),
        'feed_formulas',
        true
      )
    } catch (err) {
      logger.error('[feedFormulation.getFormulas] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Recuperer une formule avec ses ingredients
   */
  async getFormulaWithIngredients(formulaId: string): Promise<{
    data: { formula: FeedFormula; ingredients: FormulaIngredient[] } | null
    error: Error | null
  }> {
    try {
      const { data: formula, error: formulaError } = await supabase
        .from('feed_formulas')
        .select('*')
        .eq('id', formulaId)
        .single()

      if (formulaError) {
        return { data: null, error: new Error(formulaError.message) }
      }

      const { data: ingredientLinks, error: linksError } = await supabase
        .from('feed_formula_ingredients')
        .select('*, ingredient:feed_ingredients(*)')
        .eq('formula_id', formulaId)

      if (linksError) {
        return { data: null, error: new Error(linksError.message) }
      }

      return {
        data: {
          formula: formula as FeedFormula,
          ingredients: ingredientLinks as FormulaIngredient[],
        },
        error: null,
      }
    } catch (err) {
      logger.error('[feedFormulation.getFormulaWithIngredients] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Sauvegarder une nouvelle formule
   */
  async saveFormula(
    name: string,
    description: string | null,
    targetCategory: FormulaCategory,
    result: FormulationResult,
    farmId?: string
  ): Promise<{ data: FeedFormula | null; error: Error | null }> {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      const target = NUTRITIONAL_TARGETS[targetCategory]

      // Creer la formule
      const { data: formula, error: formulaError } = await supabase
        .from('feed_formulas')
        .insert({
          farm_id: targetFarmId,
          name,
          description,
          target_category: targetCategory,
          target_protein_pct: target.protein.target,
          target_energy_kcal: target.energy.target,
          target_fiber_pct: target.fiber.target,
          calculated_protein_pct: result.totalProtein,
          calculated_energy_kcal: result.totalEnergy,
          calculated_fiber_pct: result.totalFiber,
          total_cost_per_kg: result.totalCostPerKg,
          is_favorite: false,
        })
        .select()
        .single()

      if (formulaError) {
        return { data: null, error: new Error(formulaError.message) }
      }

      // Ajouter les ingredients
      const ingredientLinks = result.ingredients.map((i) => ({
        formula_id: formula.id,
        ingredient_id: i.ingredient.id,
        percentage: i.percentage,
      }))

      const { error: linksError } = await supabase
        .from('feed_formula_ingredients')
        .insert(ingredientLinks)

      if (linksError) {
        // Rollback: supprimer la formule créée
        await supabase.from('feed_formulas').delete().eq('id', formula.id)
        return { data: null, error: new Error(linksError.message) }
      }

      return { data: formula as FeedFormula, error: null }
    } catch (err) {
      logger.error('[feedFormulation.saveFormula] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Mettre à jour une formule en favori
   */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('feed_formulas')
        .update({
          is_favorite: isFavorite,
          updated_at: getNowISO(),
        })
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[feedFormulation.toggleFavorite] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer une formule
   */
  async deleteFormula(id: string): Promise<{ error: Error | null }> {
    try {
      // Les ingredients liés seront supprimés par CASCADE
      const { error } = await supabase
        .from('feed_formulas')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[feedFormulation.deleteFormula] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Obtenir les statistiques des formulations
   */
  async getStats(farmId?: string): Promise<{
    data: { totalFormulas: number; totalIngredients: number; favoriteCount: number }
    error: Error | null
  }> {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return {
          data: { totalFormulas: 0, totalIngredients: 0, favoriteCount: 0 },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      const [formulasResult, ingredientsResult] = await Promise.all([
        supabase
          .from('feed_formulas')
          .select('is_favorite')
          .eq('farm_id', targetFarmId),
        supabase
          .from('feed_ingredients')
          .select('id')
          .eq('farm_id', targetFarmId),
      ])

      const formulas = formulasResult.data || []
      const ingredients = ingredientsResult.data || []

      return {
        data: {
          totalFormulas: formulas.length,
          totalIngredients: ingredients.length,
          favoriteCount: formulas.filter((f) => f.is_favorite).length,
        },
        error: null,
      }
    } catch (err) {
      logger.error('[feedFormulation.getStats] Error:', err)
      return {
        data: { totalFormulas: 0, totalIngredients: 0, favoriteCount: 0 },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },
}

export default feedFormulationService
