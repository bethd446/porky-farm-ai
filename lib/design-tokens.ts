/**
 * PORKYFARM DESIGN TOKENS
 * ========================
 * Tokens de design unifiés pour web et mobile
 * Utiliser ces tokens au lieu de couleurs/tailles hardcodées
 */

// ============================================
// COULEURS
// ============================================

export const colors = {
  // Primary (Vert forêt - Branding PorkyFarm)
  primary: {
    DEFAULT: "#2d6a4f",      // oklch(0.45 0.12 145)
    light: "#40916c",       // oklch(0.55 0.12 145) - Hover
    dark: "#1b4332",        // oklch(0.35 0.12 145) - Pressed
    foreground: "#ffffff",
  },

  // Secondary (Gris ardoise)
  secondary: {
    DEFAULT: "#f1f5f9",     // oklch(0.94 0.01 260)
    foreground: "#334155",  // oklch(0.35 0.02 260)
  },

  // Accent (Ambre doré)
  accent: {
    DEFAULT: "#d4a373",     // oklch(0.82 0.14 75)
    light: "#e8c4a0",
    foreground: "#1a1a1a",
  },

  // Backgrounds
  background: {
    DEFAULT: "#fafaf8",     // Blanc cassé chaud
    card: "#ffffff",        // Blanc pur pour cartes
    muted: "#f5f5f5",       // Fond atténué
  },

  // Textes
  foreground: {
    DEFAULT: "#1a1a1a",     // Quasi-noir
    muted: "#6b7280",       // Gris moyen (contraste 4.6:1)
    subtle: "#9ca3af",      // Gris clair (légendes uniquement)
  },

  // Bordures
  border: {
    DEFAULT: "#e5e7eb",     // Gris très clair
    strong: "#d1d5db",      // Gris moyen - séparateurs
  },

  // États sémantiques
  success: {
    DEFAULT: "#10b981",     // oklch(0.52 0.16 145)
    light: "#d1fae5",
    foreground: "#ffffff",
  },

  warning: {
    DEFAULT: "#f59e0b",     // oklch(0.72 0.16 55)
    light: "#fef3c7",
    foreground: "#1a1a1a",  // Texte sombre pour contraste
  },

  error: {
    DEFAULT: "#ef4444",     // oklch(0.55 0.16 25)
    light: "#fee2e2",
    foreground: "#ffffff",
  },

  info: {
    DEFAULT: "#3b82f6",     // oklch(0.55 0.1 240)
    light: "#dbeafe",
    foreground: "#ffffff",
  },
} as const

// ============================================
// ESPACEMENT (Basé sur 4px)
// ============================================

export const spacing = {
  xs: 4,      // 0.25rem
  sm: 8,      // 0.5rem
  md: 12,     // 0.75rem
  base: 16,   // 1rem
  lg: 20,     // 1.25rem
  xl: 24,     // 1.5rem
  "2xl": 32,  // 2rem
  "3xl": 40,  // 2.5rem
  "4xl": 48,  // 3rem

  // Composants
  cardPadding: 16,
  cardGap: 12,
  sectionPadding: 24,
  inputPadding: 12,
  buttonPadding: 16,

  // Touch targets (mobile)
  touchTarget: 44,        // Minimum 44x44px
  touchTargetLarge: 56,   // 56x56px pour CTA
} as const

// ============================================
// TYPOGRAPHIE
// ============================================

export const typography = {
  // Familles
  fontFamily: {
    web: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mobileIOS: "System",
    mobileAndroid: "Roboto",
  },

  // Tailles (mobile → desktop)
  fontSize: {
    h1: { mobile: 24, desktop: 36 },
    h2: { mobile: 20, desktop: 30 },
    h3: { mobile: 18, desktop: 24 },
    h4: { mobile: 16, desktop: 20 },
    body: { mobile: 16, desktop: 18 },
    bodySmall: { mobile: 14, desktop: 16 },
    caption: { mobile: 12, desktop: 14 },
    label: { mobile: 14, desktop: 16 },
  },

  // Poids
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Interlignes
  lineHeight: {
    tight: 1.2,      // Titres
    normal: 1.4,     // Sous-titres
    relaxed: 1.6,    // Corps de texte
  },
} as const

// ============================================
// BORDERS & RADIUS
// ============================================

export const radius = {
  sm: 4,      // 0.25rem - Boutons, inputs
  md: 8,      // 0.5rem - Cards internes
  lg: 12,     // 0.75rem - Cards principales
  xl: 16,     // 1rem - Modals
  full: 9999, // Pills, avatars
} as const

export const borders = {
  width: {
    thin: 1,
    medium: 2,
    thick: 4,
  },
  color: {
    DEFAULT: colors.border.DEFAULT,
    strong: colors.border.strong,
  },
} as const

// ============================================
// OMBRES
// ============================================

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
} as const

// ============================================
// ICÔNES
// ============================================

export const icons = {
  // Modules
  dashboard: "LayoutDashboard",
  livestock: "PiggyBank",
  health: "Stethoscope",
  reproduction: "Baby",
  feeding: "Calculator",
  ai: "Brain",
  profile: "User",

  // Actions
  add: "Plus",
  edit: "Pencil",
  delete: "Trash2",
  save: "Check",
  cancel: "X",
  search: "Search",
  filter: "Filter",

  // États
  success: "CheckCircle",
  error: "AlertCircle",
  warning: "AlertTriangle",
  info: "Info",
} as const

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// ============================================
// EXPORTS TYPES
// ============================================

export type ColorToken = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type TypographySize = keyof typeof typography.fontSize

