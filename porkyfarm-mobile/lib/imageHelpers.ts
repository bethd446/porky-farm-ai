// lib/imageHelpers.ts
import { ImageSourcePropType } from 'react-native'
import { Assets, CategoryIcons, AnimalImages } from '@/constants/assets'

/**
 * Retourne l'image appropriée pour une catégorie d'animal
 */
export function getAnimalCategoryImage(category: string): ImageSourcePropType {
  const images: Record<string, ImageSourcePropType> = {
    truie: CategoryIcons.truie,
    verrat: CategoryIcons.verrat,
    porcelet: CategoryIcons.porcelet,
    engraissement: CategoryIcons.engraissement,
  }
  return images[category] || AnimalImages.genericPig
}

/**
 * Retourne l'icône de statut appropriée
 */
export function getStatusIcon(status: 'success' | 'warning' | 'error' | 'info'): ImageSourcePropType {
  return Assets.StatusIcons[status]
}

/**
 * Retourne l'illustration pour un état vide
 */
export function getEmptyStateImage(type: 'cheptel' | 'feed' | 'tasks' | 'health' | 'reproduction'): ImageSourcePropType {
  const images: Record<string, ImageSourcePropType> = {
    cheptel: Assets.Illustrations.emptyCheptel,
    feed: Assets.Illustrations.emptyFeed,
    tasks: Assets.Illustrations.emptyTasks,
    health: Assets.Illustrations.emptyHealth,
    reproduction: Assets.Illustrations.emptyReproduction,
  }
  return images[type] || Assets.Illustrations.emptyCheptel
}

/**
 * Retourne l'image d'un ingrédient
 */
export function getIngredientImage(ingredientName: string): ImageSourcePropType {
  const normalized = ingredientName.toLowerCase()
  const images: Record<string, ImageSourcePropType> = {
    'maïs': Assets.FeedImages.maize,
    'mais': Assets.FeedImages.maize,
    'maize': Assets.FeedImages.maize,
    'soja': Assets.FeedImages.soy,
    'soy': Assets.FeedImages.soy,
    'son': Assets.FeedImages.bran,
    'bran': Assets.FeedImages.bran,
    'concentré': Assets.FeedImages.concentrate,
    'concentrate': Assets.FeedImages.concentrate,
    'blé': Assets.FeedImages.wheat,
    'wheat': Assets.FeedImages.wheat,
  }
  return images[normalized] || Assets.FeedImages.formulaPlaceholder
}
