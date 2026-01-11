/**
 * Animations Config - PorkyFarm 2026
 * ===================================
 * Registry centralise des animations Lottie
 *
 * Les animations apportent vie et personnalite a l'app.
 * Palette: Vert #10B981 | Warning #F59E0B | Error #EF4444
 */

// ===========================================
// TYPES
// ===========================================

/** Types d'animations disponibles */
export type AnimationType =
  | 'loading-pig'
  | 'loading-dots'
  | 'empty-farm'
  | 'empty-box'
  | 'empty-search'
  | 'success'
  | 'error'
  | 'confetti'
  | 'pig-happy'
  | 'heart'
  | 'coins'
  | 'calendar'
  | 'bell'
  | 'pregnant'
  | 'food'

/** Configuration par animation */
export interface AnimationConfig {
  source: any
  defaultSize: number
  loop: boolean
  speed: number
}

// ===========================================
// SOURCES (placeholder - a telecharger)
// ===========================================

/**
 * Sources des animations Lottie
 *
 * Pour activer une animation:
 * 1. Telecharger le fichier .json depuis LottieFiles
 * 2. Placer dans le bon dossier assets/animations/
 * 3. Importer et assigner ici
 *
 * Exemple:
 * import loadingPig from '../../assets/animations/loading/pig.json'
 * 'loading-pig': loadingPig,
 */
const animationSources: Record<AnimationType, any> = {
  'loading-pig': null,    // Recherche: "pig walking cute"
  'loading-dots': null,   // Recherche: "dots loading minimal"
  'empty-farm': null,     // Recherche: "farm barn empty"
  'empty-box': null,      // Recherche: "empty box cute"
  'empty-search': null,   // Recherche: "search not found"
  'success': null,        // Recherche: "success checkmark green"
  'error': null,          // Recherche: "error alert red"
  'confetti': null,       // Recherche: "confetti celebration"
  'pig-happy': null,      // Recherche: "pig happy cute"
  'heart': null,          // Recherche: "heartbeat health"
  'coins': null,          // Recherche: "coins money gold"
  'calendar': null,       // Recherche: "calendar check"
  'bell': null,           // Recherche: "bell notification ring"
  'pregnant': null,       // Recherche: "pregnant belly"
  'food': null,           // Recherche: "food bowl pet"
}

// ===========================================
// CONFIGURATIONS
// ===========================================

/** Configurations par defaut pour chaque animation */
const animationConfigs: Record<AnimationType, Omit<AnimationConfig, 'source'>> = {
  // Loading (boucle infinie)
  'loading-pig': { defaultSize: 150, loop: true, speed: 1.0 },
  'loading-dots': { defaultSize: 60, loop: true, speed: 1.2 },

  // Empty states (boucle lente pour attirer l'attention)
  'empty-farm': { defaultSize: 200, loop: true, speed: 0.8 },
  'empty-box': { defaultSize: 150, loop: true, speed: 0.8 },
  'empty-search': { defaultSize: 150, loop: true, speed: 0.8 },

  // Feedback (une seule fois)
  'success': { defaultSize: 120, loop: false, speed: 1.0 },
  'error': { defaultSize: 100, loop: false, speed: 1.0 },
  'confetti': { defaultSize: 200, loop: false, speed: 1.0 },

  // Decoratifs (petites icones animees)
  'pig-happy': { defaultSize: 80, loop: true, speed: 0.8 },
  'heart': { defaultSize: 40, loop: true, speed: 1.0 },
  'coins': { defaultSize: 40, loop: true, speed: 0.8 },
  'calendar': { defaultSize: 40, loop: true, speed: 0.8 },
  'bell': { defaultSize: 32, loop: true, speed: 1.0 },
  'pregnant': { defaultSize: 60, loop: true, speed: 0.6 },
  'food': { defaultSize: 40, loop: true, speed: 0.8 },
}

// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================

/**
 * Recupere la configuration complete d'une animation
 */
export function getAnimation(type: AnimationType): AnimationConfig {
  const config = animationConfigs[type]
  const source = animationSources[type]

  return {
    source,
    ...config,
  }
}

/**
 * Verifie si une animation est disponible (fichier telecharge)
 * Utilise pour fallback vers ActivityIndicator ou icone statique
 */
export function isAnimationAvailable(type: AnimationType): boolean {
  return animationSources[type] !== null
}

/**
 * Recupere toutes les animations disponibles
 */
export function getAvailableAnimations(): AnimationType[] {
  return (Object.keys(animationSources) as AnimationType[]).filter(
    (type) => animationSources[type] !== null
  )
}

// ===========================================
// GUIDE DE TELECHARGEMENT
// ===========================================

/**
 * Guide pour telecharger les animations depuis LottieFiles
 * URL: https://lottiefiles.com/
 *
 * Conseils:
 * - Choisir des animations < 50KB pour performance
 * - Preferer format JSON (pas dotLottie)
 * - Modifier les couleurs dans l'editeur LottieFiles
 */
export const ANIMATION_DOWNLOAD_GUIDE = {
  'loading-pig': {
    search: 'pig walking cute',
    maxSize: '50KB',
    path: 'assets/animations/loading/pig.json',
    colors: { primary: '#10B981' },
  },
  'loading-dots': {
    search: 'dots loading minimal',
    maxSize: '20KB',
    path: 'assets/animations/loading/dots.json',
    colors: { primary: '#10B981' },
  },
  'empty-farm': {
    search: 'farm barn empty',
    maxSize: '50KB',
    path: 'assets/animations/empty/farm.json',
    colors: { primary: '#10B981', accent: '#F59E0B' },
  },
  'empty-box': {
    search: 'empty box cute',
    maxSize: '30KB',
    path: 'assets/animations/empty/box.json',
    colors: { primary: '#9CA3AF' },
  },
  'empty-search': {
    search: 'search not found',
    maxSize: '30KB',
    path: 'assets/animations/empty/search.json',
    colors: { primary: '#9CA3AF' },
  },
  'success': {
    search: 'success checkmark green',
    maxSize: '30KB',
    path: 'assets/animations/feedback/success.json',
    colors: { primary: '#10B981' },
  },
  'error': {
    search: 'error alert red',
    maxSize: '30KB',
    path: 'assets/animations/feedback/error.json',
    colors: { primary: '#EF4444' },
  },
  'confetti': {
    search: 'confetti celebration',
    maxSize: '50KB',
    path: 'assets/animations/feedback/confetti.json',
    colors: { multi: true },
  },
  'pig-happy': {
    search: 'pig happy cute',
    maxSize: '50KB',
    path: 'assets/animations/decorative/pig-happy.json',
    colors: { primary: '#EC4899' },
  },
  'heart': {
    search: 'heartbeat health',
    maxSize: '30KB',
    path: 'assets/animations/decorative/heart.json',
    colors: { primary: '#EF4444' },
  },
  'coins': {
    search: 'coins money gold',
    maxSize: '30KB',
    path: 'assets/animations/decorative/coins.json',
    colors: { primary: '#F59E0B' },
  },
  'calendar': {
    search: 'calendar check',
    maxSize: '30KB',
    path: 'assets/animations/decorative/calendar.json',
    colors: { primary: '#3B82F6' },
  },
  'bell': {
    search: 'bell notification ring',
    maxSize: '20KB',
    path: 'assets/animations/decorative/bell.json',
    colors: { primary: '#F59E0B' },
  },
  'pregnant': {
    search: 'pregnant belly',
    maxSize: '40KB',
    path: 'assets/animations/decorative/pregnant.json',
    colors: { primary: '#EC4899' },
  },
  'food': {
    search: 'food bowl pet',
    maxSize: '30KB',
    path: 'assets/animations/decorative/food.json',
    colors: { primary: '#F59E0B' },
  },
} as const

// ===========================================
// EMPTY STATE MAPPING
// ===========================================

/** Mapping type d'ecran -> animation empty state */
export const EMPTY_STATE_ANIMATIONS: Record<string, AnimationType> = {
  // Cheptel
  cheptel: 'empty-farm',
  livestock: 'empty-farm',
  animals: 'empty-farm',
  animaux: 'empty-farm',

  // Sante
  health: 'empty-box',
  sante: 'empty-box',

  // Taches
  tasks: 'empty-box',
  taches: 'empty-box',

  // Couts
  costs: 'empty-box',
  couts: 'empty-box',
  depenses: 'empty-box',

  // Reproduction
  reproduction: 'empty-box',
  gestations: 'empty-box',

  // Recherche
  search: 'empty-search',
  recherche: 'empty-search',

  // Default
  default: 'empty-box',
}

/**
 * Obtient l'animation empty state appropriee pour un type d'ecran
 */
export function getEmptyStateAnimation(type: string): AnimationType {
  const normalized = type.toLowerCase().trim()
  return EMPTY_STATE_ANIMATIONS[normalized] || EMPTY_STATE_ANIMATIONS.default
}

// ===========================================
// FEEDBACK ANIMATIONS
// ===========================================

/** Mapping type de feedback -> animation */
export const FEEDBACK_ANIMATIONS: Record<string, AnimationType> = {
  success: 'success',
  error: 'error',
  celebration: 'confetti',
}

/**
 * Obtient l'animation de feedback appropriee
 */
export function getFeedbackAnimation(type: 'success' | 'error' | 'celebration'): AnimationType {
  return FEEDBACK_ANIMATIONS[type]
}

// ===========================================
// DECORATIVE ANIMATIONS PAR MODULE
// ===========================================

/** Animations decoratives par module metier */
export const MODULE_DECORATIONS: Record<string, AnimationType> = {
  livestock: 'pig-happy',
  health: 'heart',
  costs: 'coins',
  tasks: 'calendar',
  reproduction: 'pregnant',
  feeding: 'food',
  notifications: 'bell',
}

/**
 * Obtient l'animation decorative pour un module
 */
export function getModuleDecoration(module: string): AnimationType | null {
  const normalized = module.toLowerCase().trim()
  return MODULE_DECORATIONS[normalized] || null
}
