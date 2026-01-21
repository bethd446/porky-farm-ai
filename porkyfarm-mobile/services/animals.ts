/**
 * Service Animals - ADAPTÉ POUR FARM_ID (V2.0)
 * =============================================
 * Gestion des animaux (pigs) liés à une ferme
 */

import { supabase } from './supabase/client'
import { safeSupabaseQuery } from '../lib/supabase/errorHandler'
import { getNowISO } from '../lib/dateUtils'
import { getCurrentFarmId } from '../lib/farmHelpers'
import { logger } from '../lib/logger'

// Mapper les catégories UI (anglais) vers DB (français)
export function mapUICategoryToDBCategory(uiCategory: 'sow' | 'boar' | 'piglet' | 'fattening'): 'truie' | 'verrat' | 'porcelet' | 'engraissement' {
  const mapping: Record<string, 'truie' | 'verrat' | 'porcelet' | 'engraissement'> = {
    'sow': 'truie',
    'boar': 'verrat',
    'piglet': 'porcelet',
    'fattening': 'engraissement'
  }
  return mapping[uiCategory] || 'engraissement'
}

/** Entrée dans l'historique de poids d'un animal */
export interface WeightEntry {
  date: string
  weight: number
  unit?: 'kg' | 'lb'
}

// Interface alignée avec la table pigs (V2.0)
export interface Animal {
  id: string
  farm_id: string
  identifier: string
  name?: string | null
  category: 'truie' | 'verrat' | 'porcelet' | 'engraissement'
  breed?: string | null
  gender?: 'male' | 'female' | null
  birth_date?: string | null
  acquisition_date?: string | null
  weight_kg?: number | null
  weight_history?: WeightEntry[] | null
  status: 'actif' | 'vendu' | 'mort' | 'reforme'
  mother_id?: string | null
  father_id?: string | null
  photo_url?: string | null
  tags?: string[] | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Compatibilité avec ancien schéma
  tag_number?: string
  sex?: 'male' | 'female' | 'unknown'
}

// Alias pour compatibilité
export type Pig = Animal

// Helper pour mapper category (UI) vers sex (DB) - compatibilité
export function mapCategoryToSex(category: 'sow' | 'boar' | 'piglet' | 'fattening'): 'male' | 'female' | 'unknown' {
  if (category === 'sow') return 'female'
  if (category === 'boar') return 'male'
  return 'unknown'
}

// Helper pour mapper sex (DB) vers category (UI) - compatibilité
export function mapSexToCategory(sex: string): 'sow' | 'boar' | 'piglet' | 'fattening' {
  if (sex === 'female') return 'sow'
  if (sex === 'male') return 'boar'
  return 'fattening'
}

export interface AnimalInsert {
  identifier?: string
  tag_number?: string // Compatibilité
  name?: string | null
  category?: 'truie' | 'verrat' | 'porcelet' | 'engraissement'
  sex?: 'male' | 'female' | 'unknown' // Compatibilité
  gender?: 'male' | 'female' | null
  breed?: string | null
  birth_date?: string | null
  acquisition_date?: string | null
  weight_kg?: number | null
  weight_history?: WeightEntry[] | null
  status?: string
  mother_id?: string | null
  father_id?: string | null
  photo_url?: string | null
  tags?: string[] | null
  notes?: string | null
}

export interface AnimalUpdate {
  identifier?: string
  tag_number?: string
  name?: string | null
  category?: 'truie' | 'verrat' | 'porcelet' | 'engraissement'
  sex?: 'male' | 'female' | 'unknown'
  gender?: 'male' | 'female' | null
  breed?: string | null
  birth_date?: string | null
  acquisition_date?: string | null
  weight_kg?: number | null
  weight_history?: WeightEntry[] | null
  status?: string
  mother_id?: string | null
  father_id?: string | null
  photo_url?: string | null
  tags?: string[] | null
  notes?: string | null
}

export interface AnimalsService {
  getAll: (farmId?: string) => Promise<{ data: Animal[] | null; error: Error | null }>
  getActive: (farmId?: string) => Promise<{ data: Animal[] | null; error: Error | null }>
  getByCategory: (category: string, farmId?: string) => Promise<{ data: Animal[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Animal | null; error: Error | null }>
  create: (animal: AnimalInsert, farmId?: string) => Promise<{ data: Animal | null; error: Error | null }>
  update: (id: string, updates: AnimalUpdate) => Promise<{ data: Animal | null; error: Error | null }>
  delete: (id: string, reason?: 'vendu' | 'mort' | 'reforme') => Promise<{ data: Animal | null; error: Error | null }>
  hardDelete: (id: string) => Promise<{ error: Error | null }>
  getStats: (farmId?: string) => Promise<{ data: { total: number; truies: number; verrats: number; porcelets: number; engraissement: number }; error: Error | null }>
  search: (query: string, farmId?: string) => Promise<{ data: Animal[] | null; error: Error | null }>
  uploadPhoto: (animalId: string, imageUri: string) => Promise<{ url: string | null; error: Error | null }>
  searchByTags: (tags: string[], farmId?: string) => Promise<{ data: Animal[] | null; error: Error | null }>
  addTag: (animalId: string, tag: string) => Promise<{ error: Error | null }>
  removeTag: (animalId: string, tag: string) => Promise<{ error: Error | null }>
}

export const animalsService: AnimalsService = {
  /**
   * Récupérer tous les animaux de la ferme
   */
  getAll: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Animal[]>(
        async () =>
          await supabase
            .from('pigs')
            .select('*')
            .eq('farm_id', targetFarmId)
            .order('created_at', { ascending: false }),
        'pigs',
        true
      )
    } catch (err) {
      logger.error('[animals.getAll] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les animaux actifs uniquement
   */
  getActive: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Animal[]>(
        async () =>
          await supabase
            .from('pigs')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('status', 'actif')
            .order('name', { ascending: true }),
        'pigs',
        true
      )
    } catch (err) {
      logger.error('[animals.getActive] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer les animaux par catégorie
   */
  getByCategory: async (category: string, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Animal[]>(
        async () =>
          await supabase
            .from('pigs')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('category', category)
            .eq('status', 'actif')
            .order('name', { ascending: true }),
        'pigs',
        true
      )
    } catch (err) {
      logger.error('[animals.getByCategory] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Récupérer un animal par ID
   */
  getById: async (id: string) => {
    try {
      return safeSupabaseQuery<Animal>(
        async () =>
          await supabase
            .from('pigs')
            .select('*')
            .eq('id', id)
            .single(),
        'pigs',
        false
      )
    } catch (err) {
      logger.error('[animals.getById] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Créer un nouvel animal
   */
  create: async (animalData: AnimalInsert, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: null, error: new Error('Aucune ferme trouvée') }
      }

      // Calculer la catégorie DB à partir du sex UI ou de la category fournie
      let dbCategory: 'truie' | 'verrat' | 'porcelet' | 'engraissement' = 'engraissement'
      if (animalData.category) {
        dbCategory = animalData.category
      } else if (animalData.sex === 'female') {
        dbCategory = 'truie'
      } else if (animalData.sex === 'male') {
        dbCategory = 'verrat'
      }

      // Générer l'identifiant (s'assurer qu'il n'est jamais vide)
      const animalIdentifier = (animalData.identifier || animalData.tag_number || `PIG-${Date.now()}`).trim()
      
      if (!animalIdentifier || animalIdentifier.length === 0) {
        return { data: null, error: new Error('Le numéro d\'identification est obligatoire') }
      }

      // Déduire le sex depuis la catégorie ou les données fournies
      // IMPORTANT: La DB n'accepte que 'male' ou 'female' pour sex
      let sex: 'male' | 'female' = 'male' // Défaut: male pour engraissement/porcelet

      // Priorité 1: sex explicite fourni (male ou female uniquement)
      if (animalData.sex === 'male' || animalData.sex === 'female') {
        sex = animalData.sex
      }
      // Priorité 2: gender fourni
      else if (animalData.gender === 'male' || animalData.gender === 'female') {
        sex = animalData.gender
      }
      // Priorité 3: déduire depuis la catégorie
      else if (dbCategory === 'truie') {
        sex = 'female'
      } else if (dbCategory === 'verrat') {
        sex = 'male'
      }
      // Pour porcelet/engraissement sans sex spécifié, on garde 'male' par défaut

      // Gender: null si non spécifié, sinon male/female
      const gender: 'male' | 'female' | null =
        animalData.gender === 'male' || animalData.gender === 'female'
          ? animalData.gender
          : (sex === 'male' || sex === 'female' ? sex : null)

      // Normaliser les données (V2.0: on utilise uniquement farm_id, pas user_id)
      const normalizedData: Record<string, unknown> = {
        farm_id: targetFarmId,
        tag_number: animalIdentifier,
        identifier: animalIdentifier,
        name: animalData.name?.trim() || null,
        category: dbCategory,
        sex: sex, // NOT NULL - 'male' ou 'female' uniquement
        gender: gender, // 'male', 'female', ou null
        breed: animalData.breed?.trim() || null,
        birth_date: animalData.birth_date || null,
        acquisition_date: animalData.acquisition_date || null,
        weight_kg: animalData.weight_kg || null,
        weight_history: animalData.weight_history || null,
        status: animalData.status || 'actif',
        mother_id: animalData.mother_id || null,
        father_id: animalData.father_id || null,
        photo_url: animalData.photo_url || null,
        tags: animalData.tags || null,
        notes: animalData.notes?.trim() || null,
      }

      const result = await safeSupabaseQuery<Animal>(
        async () =>
          await supabase
            .from('pigs')
            .insert(normalizedData)
            .select()
            .single(),
        'pigs',
        false
      )

      // Logger l'erreur complète pour debugging
      if (result.error) {
        logger.error('[animals.create] Supabase error:', {
          message: result.error.message,
          code: (result.error as any).code,
          details: (result.error as any).details,
          hint: (result.error as any).hint,
          normalizedDataKeys: Object.keys(normalizedData), // Ne pas logger les valeurs sensibles
          sex: sex, // Logger le sex pour debug
          category: dbCategory,
        })
      }

      return result
    } catch (err) {
      logger.error('[animals.create] Unexpected error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue lors de la création') }
    }
  },

  /**
   * Mettre à jour un animal
   */
  update: async (id: string, updates: AnimalUpdate) => {
    try {
      // Normaliser les données
      const normalizedUpdates: Record<string, unknown> = {
        ...updates,
        updated_at: getNowISO(),
      }

      // Si tag_number fourni, mapper vers identifier
      if (updates.tag_number && !updates.identifier) {
        normalizedUpdates.identifier = updates.tag_number
        delete normalizedUpdates.tag_number
      }

      // Si sex fourni, mapper vers gender
      if (updates.sex && !updates.gender) {
        normalizedUpdates.gender = updates.sex
        delete normalizedUpdates.sex
      }

      return safeSupabaseQuery<Animal>(
        async () =>
          await supabase
            .from('pigs')
            .update(normalizedUpdates)
            .eq('id', id)
            .select()
            .single(),
        'pigs',
        false
      )
    } catch (err) {
      logger.error('[animals.update] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer un animal (soft delete - change le statut)
   */
  delete: async (id: string, reason: 'vendu' | 'mort' | 'reforme' = 'reforme') => {
    try {
      return safeSupabaseQuery<Animal>(
        async () =>
          await supabase
            .from('pigs')
            .update({
              status: reason,
              updated_at: getNowISO(),
            })
            .eq('id', id)
            .select()
            .single(),
        'pigs',
        false
      )
    } catch (err) {
      logger.error('[animals.delete] Error:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Supprimer définitivement un animal
   */
  hardDelete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('pigs')
        .delete()
        .eq('id', id)

      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      logger.error('[animals.hardDelete] Error:', err)
      return { error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Obtenir les statistiques du cheptel
   */
  getStats: async (farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return {
          data: { total: 0, truies: 0, verrats: 0, porcelets: 0, engraissement: 0 },
          error: new Error('Aucune ferme trouvée'),
        }
      }

      const { data, error } = await supabase
        .from('pigs')
        .select('category')
        .eq('farm_id', targetFarmId)
        .eq('status', 'actif')

      if (error) {
        return {
          data: { total: 0, truies: 0, verrats: 0, porcelets: 0, engraissement: 0 },
          error: new Error(error.message),
        }
      }

      const stats = {
        total: data?.length || 0,
        truies: data?.filter((p) => p.category === 'truie').length || 0,
        verrats: data?.filter((p) => p.category === 'verrat').length || 0,
        porcelets: data?.filter((p) => p.category === 'porcelet').length || 0,
        engraissement: data?.filter((p) => p.category === 'engraissement').length || 0,
      }

      return { data: stats, error: null }
    } catch (err) {
      logger.error('[animals.getStats] Error:', err)
      return {
        data: { total: 0, truies: 0, verrats: 0, porcelets: 0, engraissement: 0 },
        error: err instanceof Error ? err : new Error('Erreur inconnue'),
      }
    }
  },

  /**
   * Rechercher des animaux
   */
  search: async (query: string, farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Animal[]>(
        async () =>
          await supabase
            .from('pigs')
            .select('*')
            .eq('farm_id', targetFarmId)
            .eq('status', 'actif')
            .or(`name.ilike.%${query}%,identifier.ilike.%${query}%`)
            .order('name', { ascending: true })
            .limit(20),
        'pigs',
        true
      )
    } catch (err) {
      logger.error('[animals.search] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Upload une photo d'animal
   */
  uploadPhoto: async (animalId: string, imageUri: string) => {
    try {
      const { data: animal } = await animalsService.getById(animalId)
      if (!animal) {
        return { url: null, error: new Error('Animal non trouvé') }
      }

      // Lire le fichier en base64
      const FileSystem = await import('expo-file-system')
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      })

      // Nom de fichier unique
      const fileName = `animal_${animalId}_${Date.now()}.jpg`
      const filePath = `${animalId}/${fileName}`

      // Convertir base64 en ArrayBuffer (simple conversion)
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const arrayBuffer = bytes.buffer

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('animals')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        return { url: null, error: new Error(uploadError.message) }
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('animals')
        .getPublicUrl(filePath)

      // Mettre à jour l'animal avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('pigs')
        .update({ photo_url: publicUrl })
        .eq('id', animalId)

      if (updateError) {
        return { url: null, error: new Error(updateError.message) }
      }

      return { url: publicUrl, error: null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.error('[animals.uploadPhoto] Error:', error)
      return { url: null, error }
    }
  },

  /**
   * Rechercher par tags
   */
  searchByTags: async (tags: string[], farmId?: string) => {
    try {
      const targetFarmId = farmId || await getCurrentFarmId()
      if (!targetFarmId) {
        return { data: [], error: new Error('Aucune ferme trouvée') }
      }

      return safeSupabaseQuery<Animal[]>(
        async () =>
          await supabase
            .from('pigs')
            .select('*')
            .eq('farm_id', targetFarmId)
            .overlaps('tags', tags)
            .order('name', { ascending: true }),
        'pigs',
        true
      )
    } catch (err) {
      logger.error('[animals.searchByTags] Error:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
    }
  },

  /**
   * Ajouter un tag à un animal
   */
  addTag: async (animalId: string, tag: string) => {
    try {
      const { data: animal, error: fetchError } = await animalsService.getById(animalId)
      if (fetchError || !animal) {
        return { error: new Error('Animal non trouvé') }
      }

      const currentTags = animal.tags || []
      if (currentTags.includes(tag)) {
        return { error: null } // Déjà présent
      }

      const { error } = await supabase
        .from('pigs')
        .update({ tags: [...currentTags, tag] })
        .eq('id', animalId)

      return { error: error ? new Error(error.message) : null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.error('[animals.addTag] Error:', error)
      return { error }
    }
  },

  /**
   * Retirer un tag d'un animal
   */
  removeTag: async (animalId: string, tag: string) => {
    try {
      const { data: animal, error: fetchError } = await animalsService.getById(animalId)
      if (fetchError || !animal) {
        return { error: new Error('Animal non trouvé') }
      }

      const currentTags = animal.tags || []
      const newTags = currentTags.filter(t => t !== tag)

      const { error } = await supabase
        .from('pigs')
        .update({ tags: newTags.length > 0 ? newTags : null })
        .eq('id', animalId)

      return { error: error ? new Error(error.message) : null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.error('[animals.removeTag] Error:', error)
      return { error }
    }
  },
}

export default animalsService
