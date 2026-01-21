// constants/assets.ts
// Centralisation de tous les assets de l'application PorkyFarm

// ==========================================
// 🏷️ BRANDING
// ==========================================

export const Branding = {
  // Logos
  logo: require('../assets/branding/logo/logo.png'),
  logoHorizontal: require('../assets/branding/logo/logo-horizontal.png'),
  logoIcon: require('../assets/branding/logo/logo-icon.png'),
  
  // Splash
  splash: require('../assets/branding/splash/splash.png'),
}

// ==========================================
// 🖼️ BACKGROUNDS
// ==========================================

export const Backgrounds = {
  onboarding: require('../assets/backgrounds/onboarding/onboarding-bg.png'),
  auth: require('../assets/backgrounds/auth/auth-bg.png'),
  dashboardHeader: require('../assets/backgrounds/dashboard/dashboard-header.png'),
}

// ==========================================
// 🔲 ICONS - Navigation
// ==========================================

export const NavIcons = {
  home: require('../assets/icons/navigation/home.png'),
  cheptel: require('../assets/icons/navigation/cheptel.png'),
  feed: require('../assets/icons/navigation/feed.png'),
  plus: require('../assets/icons/navigation/plus.png'),
  profile: require('../assets/icons/navigation/profile.png'),
}

// ==========================================
// 🔲 ICONS - Actions
// ==========================================

export const ActionIcons = {
  add: require('../assets/icons/actions/add.png'),
  edit: require('../assets/icons/actions/edit.png'),
  delete: require('../assets/icons/actions/delete.png'),
  save: require('../assets/icons/actions/save.png'),
  search: require('../assets/icons/actions/search.png'),
  filter: require('../assets/icons/actions/filter.png'),
  share: require('../assets/icons/actions/share.png'),
  download: require('../assets/icons/actions/download.png'),
}

// ==========================================
// 🔲 ICONS - Status
// ==========================================

export const StatusIcons = {
  success: require('../assets/icons/status/success.png'),
  warning: require('../assets/icons/status/warning.png'),
  error: require('../assets/icons/status/error.png'),
  info: require('../assets/icons/status/info.png'),
}

// ==========================================
// 🔲 ICONS - Categories
// ==========================================

export const CategoryIcons = {
  truie: require('../assets/icons/categories/truie.png'),
  verrat: require('../assets/icons/categories/verrat.png'),
  porcelet: require('../assets/icons/categories/porcelet.png'),
  engraissement: require('../assets/icons/categories/engraissement.png'),
}

// ==========================================
// 🎨 ILLUSTRATIONS
// ==========================================

export const Illustrations = {
  // Empty States
  emptyCheptel: require('../assets/illustrations/empty-states/empty-cheptel.png'),
  emptyFeed: require('../assets/illustrations/empty-states/empty-feed.png'),
  emptyTasks: require('../assets/illustrations/empty-states/empty-tasks.png'),
  emptyHealth: require('../assets/illustrations/empty-states/empty-health.png'),
  emptyReproduction: require('../assets/illustrations/empty-states/empty-reproduction.png'),
  
  // Onboarding
  onboardingStep1: require('../assets/illustrations/onboarding/step-1.png'),
  onboardingStep2: require('../assets/illustrations/onboarding/step-2.png'),
  onboardingStep3: require('../assets/illustrations/onboarding/step-3.png'),
  
  // Success/Error
  successPig: require('../assets/illustrations/success-pig.png'),
  errorPig: require('../assets/illustrations/error-pig.png'),
}

// ==========================================
// 🐷 ANIMALS
// ==========================================

export const AnimalImages = {
  piglet: require('../assets/animals/piglet.png'),
  sow: require('../assets/animals/sow.png'),
  boar: require('../assets/animals/boar.png'),
  genericPig: require('../assets/animals/generic-pig.png'),
  pigProfile: require('../assets/animals/pig-profile.png'),
}

// ==========================================
// 🌾 FEED
// ==========================================

export const FeedImages = {
  // Ingredients
  maize: require('../assets/feed/ingredients/maize.png'),
  soy: require('../assets/feed/ingredients/soy.png'),
  bran: require('../assets/feed/ingredients/bran.png'),
  concentrate: require('../assets/feed/ingredients/concentrate.png'),
  wheat: require('../assets/feed/ingredients/wheat.png'),
  
  // Formulas
  formulaPlaceholder: require('../assets/feed/formulas/formula-placeholder.png'),
}

// ==========================================
// 🏥 HEALTH
// ==========================================

export const HealthImages = {
  healthy: require('../assets/health/healthy.png'),
  sick: require('../assets/health/sick.png'),
  treatment: require('../assets/health/treatment.png'),
  vaccination: require('../assets/health/vaccination.png'),
}

// ==========================================
// ❤️ REPRODUCTION
// ==========================================

export const ReproductionImages = {
  gestation: require('../assets/reproduction/gestation.png'),
  mating: require('../assets/reproduction/mating.png'),
  farrowing: require('../assets/reproduction/farrowing.png'),
  calendar: require('../assets/reproduction/calendar.png'),
}

// ==========================================
// 📦 EXPORT GLOBAL
// ==========================================

export const Assets = {
  Branding,
  Backgrounds,
  NavIcons,
  ActionIcons,
  StatusIcons,
  CategoryIcons,
  Illustrations,
  AnimalImages,
  FeedImages,
  HealthImages,
  ReproductionImages,
}

export default Assets
