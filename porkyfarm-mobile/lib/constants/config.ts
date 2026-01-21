/**
 * Constantes de configuration de l'application
 * Centralise toutes les valeurs "magiques" pour faciliter la maintenance
 */

// ============================================
// ÉLEVAGE - Constantes métier
// ============================================

/** Durée de gestation d'une truie en jours */
export const GESTATION_PERIOD_DAYS = 114

/** Seuil de stock bas en kg (alerte) */
export const LOW_STOCK_THRESHOLD_KG = 50

/** Ratios d'alimentation par catégorie (% du poids corporel par jour) */
export const FEED_RATIOS = {
  /** Truies : 3% du poids corporel */
  sow: 0.03,
  /** Verrats : 2.5% du poids corporel */
  boar: 0.025,
  /** Porcelets : 5% du poids corporel */
  piglet: 0.05,
  /** Porcs en engraissement : 4% du poids corporel */
  fattening: 0.04,
} as const

/** Préfixes pour les identifiants d'animaux */
export const ANIMAL_ID_PREFIXES = {
  sow: 'TRUIE',
  boar: 'VERRAT',
  piglet: 'PORCELET',
  fattening: 'ENGRAISSEMENT',
} as const

// ============================================
// TÂCHES - Horaires par défaut
// ============================================

/** Horaires par défaut pour les tâches récurrentes */
export const DEFAULT_TASK_TIMES = {
  morning: '08:00',
  midday: '13:00',
  evening: '18:00',
  inspection: '09:00',
  cleaning: '10:00',
} as const

// ============================================
// RÉSEAU & SYNCHRONISATION
// ============================================

/** Intervalle de vérification du réseau en ms */
export const NETWORK_CHECK_INTERVAL_MS = 5000

/** Intervalle de mise à jour du compteur de synchro en ms */
export const SYNC_COUNT_UPDATE_INTERVAL_MS = 2000

/** Timeout par défaut pour les requêtes API en ms */
export const API_REQUEST_TIMEOUT_MS = 30000

// ============================================
// UI - Limites et seuils
// ============================================

/** Nombre maximum d'éléments à afficher dans une liste sans pagination */
export const MAX_LIST_ITEMS_WITHOUT_PAGINATION = 50

/** Durée d'affichage des toasts en ms */
export const TOAST_DURATION_MS = 3000

/** Délai avant redirection après action réussie en ms */
export const REDIRECT_DELAY_MS = 1500

// ============================================
// VALIDATION
// ============================================

/** Poids minimum d'un animal en kg */
export const MIN_ANIMAL_WEIGHT_KG = 0.1

/** Poids maximum d'un animal en kg */
export const MAX_ANIMAL_WEIGHT_KG = 500

/** Âge maximum d'un animal en années */
export const MAX_ANIMAL_AGE_YEARS = 15

// ============================================
// CATÉGORIES ET STATUTS
// ============================================

export const ANIMAL_CATEGORIES = ['sow', 'boar', 'piglet', 'fattening'] as const
export type AnimalCategory = (typeof ANIMAL_CATEGORIES)[number]

export const ANIMAL_STATUSES = ['active', 'sick', 'pregnant', 'nursing', 'sold', 'deceased'] as const
export type AnimalStatus = (typeof ANIMAL_STATUSES)[number]

export const HEALTH_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
export type HealthSeverity = (typeof HEALTH_SEVERITIES)[number]

export const HEALTH_STATUSES = ['ongoing', 'resolved', 'chronic', 'scheduled'] as const
export type HealthStatus = (typeof HEALTH_STATUSES)[number]

export const GESTATION_STATUSES = ['pregnant', 'farrowed', 'weaning', 'completed', 'aborted'] as const
export type GestationStatus = (typeof GESTATION_STATUSES)[number]

export const TRANSACTION_TYPES = ['income', 'expense'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const COST_CATEGORIES = ['sale', 'feed', 'veterinary', 'equipment', 'labor', 'other'] as const
export type CostCategory = (typeof COST_CATEGORIES)[number]
