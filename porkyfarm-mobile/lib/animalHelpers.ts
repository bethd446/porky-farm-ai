/**
 * Helpers pour mapper entre les colonnes DB (pigs) et les propriétés UI
 * 
 * DB : tag_number, sex, photo_url, weight_history
 * UI : identifier, category, image_url, weight
 */

import type { Animal } from '../services/animals'
import { mapSexToCategory as mapSexToCategoryFromService } from '../services/animals'

// Réexporter mapSexToCategory pour usage dans les composants
export { mapSexToCategoryFromService as mapSexToCategory }

// Interface UI pour affichage (sans conflit avec Animal)
export interface AnimalUI {
  // Toutes les propriétés de Animal
  id: string
  farm_id: string
  identifier: string
  name?: string | null
  category: 'sow' | 'boar' | 'piglet' | 'fattening' // Version UI des catégories
  breed?: string | null
  gender?: 'male' | 'female' | null
  birth_date?: string | null
  acquisition_date?: string | null
  weight_kg?: number | null
  status: string
  photo_url?: string | null
  tags?: string[] | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Propriétés UI calculées
  image_url: string | null
  weight: number | null
}

/**
 * Convertit un Animal (DB) en AnimalUI (pour l'UI)
 */
export function animalToUI(animal: Animal): AnimalUI {
  // Extraire le poids le plus récent de weight_history
  let weight: number | null = null
  if (animal.weight_history && Array.isArray(animal.weight_history) && animal.weight_history.length > 0) {
    // weight_history est un tableau de { date, weight }
    const sorted = [...animal.weight_history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    weight = sorted[0]?.weight || null
  }

  return {
    id: animal.id,
    farm_id: animal.farm_id,
    identifier: animal.tag_number || animal.identifier || 'N/A',
    name: animal.name,
    category: mapSexToCategoryFromService(animal.sex || 'unknown'),
    breed: animal.breed,
    gender: animal.gender,
    birth_date: animal.birth_date,
    acquisition_date: animal.acquisition_date,
    weight_kg: animal.weight_kg,
    status: animal.status,
    photo_url: animal.photo_url,
    tags: animal.tags,
    notes: animal.notes,
    created_at: animal.created_at,
    updated_at: animal.updated_at,
    image_url: animal.photo_url ?? null,
    weight,
  }
}

/**
 * Convertit un tableau d'Animal en AnimalUI[]
 */
export function animalsToUI(animals: Animal[]): AnimalUI[] {
  return animals.map(animalToUI)
}
