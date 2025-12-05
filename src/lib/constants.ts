/**
 * Liste des races de porcs disponibles
 */
export const PIG_BREEDS = [
  'Large White',
  'Landrace',
  'Duroc',
  'Piétrain',
  'Hampshire',
  'Berkshire',
  'Local',
  'Croisé',
  'Autre',
] as const;

/**
 * Catégories de porcs avec leurs plages de poids
 */
export const PIG_CATEGORIES = [
  { value: 'piglet', label: 'Porcelet (0-25kg)', minWeight: 0, maxWeight: 25 },
  { value: 'grower', label: 'Croissance (25-60kg)', minWeight: 25, maxWeight: 60 },
  { value: 'finisher', label: 'Finition (60-120kg)', minWeight: 60, maxWeight: 120 },
  { value: 'sow', label: 'Truie', minWeight: 120, maxWeight: 300 },
  { value: 'boar', label: 'Verrat', minWeight: 120, maxWeight: 350 },
] as const;

/**
 * Types d'événements disponibles avec leurs icônes
 */
export const EVENT_TYPES = [
  { value: 'vaccination', label: 'Vaccination', icon: '💉' },
  { value: 'weighing', label: 'Pesée', icon: '⚖️' },
  { value: 'birth', label: 'Mise-bas', icon: '🐷' },
  { value: 'sale', label: 'Vente', icon: '💰' },
  { value: 'treatment', label: 'Traitement', icon: '💊' },
  { value: 'other', label: 'Autre', icon: '📝' },
] as const;

/**
 * Catégories de transactions financières
 */
export const TRANSACTION_CATEGORIES = [
  { value: 'sale', label: 'Vente', type: 'income' },
  { value: 'feed', label: 'Alimentation', type: 'expense' },
  { value: 'veterinary', label: 'Vétérinaire', type: 'expense' },
  { value: 'equipment', label: 'Équipement', type: 'expense' },
  { value: 'labor', label: 'Main d\'œuvre', type: 'expense' },
  { value: 'other', label: 'Autre', type: 'both' },
] as const;

/**
 * Ingrédients courants pour formulations avec valeurs nutritionnelles
 * Les coûts sont en FCFA/kg
 */
export const COMMON_INGREDIENTS = [
  { name: 'Maïs', protein: 9, energy: 3350, cost: 200 },
  { name: 'Soja (tourteau)', protein: 44, energy: 2230, cost: 450 },
  { name: 'Son de blé', protein: 15, energy: 1800, cost: 150 },
  { name: 'Farine de poisson', protein: 65, energy: 2800, cost: 800 },
  { name: 'Manioc', protein: 2, energy: 3200, cost: 120 },
  { name: 'Arachide (tourteau)', protein: 45, energy: 2500, cost: 400 },
  { name: 'Palmiste (tourteau)', protein: 18, energy: 2100, cost: 180 },
  { name: 'Prémix vitamines', protein: 0, energy: 0, cost: 2500 },
  { name: 'Sel', protein: 0, energy: 0, cost: 100 },
  { name: 'Calcaire', protein: 0, energy: 0, cost: 80 },
] as const;

/**
 * Limite de formulations gratuites pour les utilisateurs free tier
 */
export const FREEMIUM_FORMULATION_LIMIT = 3;
