/**
 * PORKYFARM DESIGN SYSTEM
 * =======================
 * Ce fichier centralise toutes les constantes de design pour une coherence totale.
 *
 * PALETTE DE COULEURS
 * -------------------
 * Utilisez les tokens CSS definis dans globals.css via les classes Tailwind:
 *
 * | Nom                | Classe Tailwind      | Usage                           |
 * |--------------------|---------------------|----------------------------------|
 * | Primary            | bg-primary          | Boutons CTA, liens actifs        |
 * | Primary Light      | bg-primary-light    | Hover states, gradients          |
 * | Primary Dark       | bg-primary-dark     | Pressed states                   |
 * | Secondary          | bg-secondary        | Boutons secondaires              |
 * | Accent             | bg-accent           | Highlights, badges               |
 * | Destructive        | bg-destructive      | Erreurs, boutons danger          |
 * | Success            | bg-success          | Messages de succes               |
 * | Warning            | bg-warning          | Alertes, avertissements          |
 * | Info               | bg-info             | Informations                     |
 * | Muted              | bg-muted            | Fonds discrets                   |
 * | Card               | bg-card             | Fond des cartes                  |
 * | Background         | bg-background       | Fond de page                     |
 *
 * TYPOGRAPHIE
 * -----------
 * Echelle de tailles (mobile -> desktop):
 */

// Echelle typographique
export const typography = {
  // Titres
  h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
  h2: "text-2xl sm:text-3xl md:text-4xl font-bold",
  h3: "text-xl sm:text-2xl font-semibold",
  h4: "text-lg sm:text-xl font-semibold",
  h5: "text-base sm:text-lg font-medium",

  // Corps de texte
  body: "text-base leading-relaxed",
  bodySmall: "text-sm leading-relaxed",

  // Utilitaires
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium",
  overline: "text-xs font-medium uppercase tracking-wider",
} as const

// Espacements standardises (basés sur rem, multiple de 4px)
export const spacing = {
  section: "py-16 md:py-24 lg:py-32", // Sections de page
  container: "px-4 sm:px-6 lg:px-8", // Conteneur horizontal
  card: "p-4 sm:p-6", // Interieur des cartes
  stack: "space-y-4", // Espacement vertical elements
  inline: "space-x-3", // Espacement horizontal elements
  grid: "gap-4 sm:gap-6", // Grilles
} as const

// Radius uniformes
export const radius = {
  sm: "rounded-md", // Boutons, inputs
  md: "rounded-lg", // Cards internes
  lg: "rounded-xl", // Cards principales
  xl: "rounded-2xl", // Modals, sections
  full: "rounded-full", // Pills, avatars
} as const

// Shadows hierarchisees
export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm", // Elements discrets
  md: "shadow-soft", // Cards standards
  lg: "shadow-lg", // Elements eleves (modals)
  glow: "shadow-glow", // Elements mis en avant
} as const

// Couleurs semantiques pour icones et badges
// Utilisez ces classes au lieu des couleurs hardcodees
export const iconColors = {
  // Modules applicatifs
  health: "bg-destructive text-destructive-foreground", // Rouge - Sante
  reproduction: "bg-pink-500 text-white", // Rose - Gestation
  feeding: "bg-accent text-accent-foreground", // Ambre - Alimentation
  ai: "bg-purple-500 text-white", // Violet - IA
  photo: "bg-info text-info-foreground", // Bleu - Photos
  stats: "bg-primary text-primary-foreground", // Vert - Stats
  weather: "bg-cyan-500 text-white", // Cyan - Meteo
  alerts: "bg-warning text-warning-foreground", // Orange - Alertes

  // Etats
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  error: "bg-destructive text-destructive-foreground",
  info: "bg-info text-info-foreground",
  neutral: "bg-muted text-muted-foreground",
} as const

// Variantes de boutons
export const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
} as const

// Tailles de boutons
export const buttonSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg",
  icon: "h-10 w-10",
  iconSm: "h-8 w-8",
  iconLg: "h-12 w-12",
} as const

// Styles de cartes
export const cardStyles = {
  default: "bg-card border rounded-xl shadow-sm",
  elevated: "bg-card border rounded-xl shadow-soft",
  interactive: "bg-card border rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer",
  ghost: "bg-transparent border-0 shadow-none",
} as const

// Animations
export const animations = {
  fadeIn: "animate-fade-in",
  fadeUp: "animate-fade-up",
  scaleIn: "animate-scale-in",
  slideUp: "animate-slide-up",
  slideInRight: "animate-slide-in-right",
  slideInLeft: "animate-slide-in-left",
  slideInDown: "animate-slide-in-down",
  bounceIn: "animate-bounce-in",
  successPulse: "animate-success-pulse",
  errorShake: "animate-error-shake",
  countUp: "animate-count-up",
  progressFill: "animate-progress-fill",
  float: "animate-float",
  pulse: "animate-pulse-slow",
} as const

// Transitions
export const transitions = {
  fast: "transition-all duration-150 ease-out",
  normal: "transition-all duration-200 ease-out",
  slow: "transition-all duration-300 ease-out",
  spring: "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  bounce: "transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
} as const

export const microInteractions = {
  // Hover effects
  hoverLift: "hover-lift",
  hoverScale: "hover-scale",
  cardInteractive: "card-interactive",

  // Icon animations
  iconRotate: "icon-hover-rotate",
  iconScale: "icon-hover-scale",
  iconBounce: "icon-hover-bounce",

  // Button effects
  btnRipple: "btn-ripple",

  // Link effects
  linkUnderline: "link-underline",

  // Focus states
  focusGlow: "focus-glow",

  // State feedback
  stateSuccess: "state-success",
  stateError: "state-error",

  // Loading
  skeleton: "skeleton",
} as const

// Classes utilitaires combinees frequemment utilisees
export const utils = {
  // Centrage flex
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",

  // Grilles responsives
  gridCols2: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
  gridCols3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
  gridCols4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",

  // Container max-width
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  containerNarrow: "mx-auto max-w-3xl px-4 sm:px-6",
  containerWide: "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8",

  // Effets visuels
  glass: "bg-white/80 backdrop-blur-xl dark:bg-black/80",
  gradient: "bg-gradient-to-r from-primary to-primary-light",

  // Focus states
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
} as const

// Breakpoints (pour reference)
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const
