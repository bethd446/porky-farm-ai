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

// Extension de l'interface Animal pour compatibilité UI
export interface AnimalUI extends Animal {
  // Propriétés calculées pour compatibilité avec l'UI existante
  identifier: string // alias de tag_number
  category: 'sow' | 'boar' | 'piglet' | 'fattening' // calculé depuis sex
  image_url: string | null // alias de photo_url
  weight: number | null // extrait de weight_history
  name?: string | null // optionnel, peut être dans notes ou autre
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
    ...animal,
    identifier: animal.tag_number,
    category: mapSexToCategoryFromService(animal.sex),
    image_url: animal.photo_url,
    weight,
  }
}

/**
 * Convertit un tableau d'Animal en AnimalUI[]
 */
export function animalsToUI(animals: Animal[]): AnimalUI[] {
  return animals.map(animalToUI)
}
