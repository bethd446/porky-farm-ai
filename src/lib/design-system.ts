/**
 * Design System PorcPro - Style professionnel épuré (Vercel/Linear)
 * Palette unifiée : vert modéré + gris + blanc
 */

export const designSystem = {
  colors: {
    // Couleur primaire - Vert agriculture (usage modéré)
    primary: {
      DEFAULT: '#16a34a', // vert-600 - Boutons principaux uniquement
      light: '#4ade80',   // vert-400 - Accents légers
      dark: '#15803d',    // vert-700 - Hover states
      subtle: '#f0fdf4',  // vert-50 - Backgrounds très subtils
    },

    // Backgrounds - Gris très clairs
    background: {
      DEFAULT: '#ffffff',
      secondary: '#fafafa',  // gray-50 - Fond page
      tertiary: '#f4f4f5',   // gray-100 - Cards
    },

    // Texte - Hiérarchie claire
    text: {
      primary: '#18181b',    // gray-900 - Titres
      secondary: '#3f3f46',  // gray-700 - Texte normal
      tertiary: '#71717a',   // gray-500 - Texte secondaire
      disabled: '#a1a1aa',   // gray-400 - Désactivé
    },

    // Statuts - Usage ponctuel seulement
    status: {
      success: '#16a34a',
      warning: '#ea580c',
      error: '#dc2626',
      info: '#2563eb',
    },

    // Bordures - Subtiles
    border: {
      light: '#f4f4f5',   // gray-100
      DEFAULT: '#e4e4e7', // gray-200
      dark: '#d4d4d8',    // gray-300
    }
  },

  // Typographie
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },

  // Espacements cohérents
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },

  // Ombres subtiles
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },

  // Border radius
  radius: {
    sm: '0.375rem',  // 6px
    DEFAULT: '0.5rem',   // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },

  // Animations
  animations: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
    easing: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
} as const;

