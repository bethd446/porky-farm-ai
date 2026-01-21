/**
 * PORKYFARM - COULEURS LIGHT/DARK MODE
 * =====================================
 * Palette verte premium avec support mode sombre
 */

export const lightColors = {
  // Primaires
  primary: '#2D6A4F',
  primaryLight: '#40916C',
  primaryLighter: '#52B788',
  primaryDark: '#1B4332',
  primarySurface: '#D8F3DC',

  // Backgrounds
  background: '#FAFDF7',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F8F4',

  // Textes
  text: '#1B4332',
  textSecondary: '#52796F',
  textMuted: '#95A5A0',
  textInverse: '#FFFFFF',

  // Etats
  success: '#40916C',
  successLight: '#D1FAE5',
  warning: '#E9C46A',
  warningLight: '#FEF3C7',
  error: '#E76F51',
  errorLight: '#FEE2E2',
  info: '#457B9D',
  infoLight: '#DBEAFE',

  // Bordures
  border: '#E8F0EB',
  borderFocus: '#2D6A4F',
  borderStrong: '#C8DED3',

  // Ombres
  shadow: 'rgba(45, 106, 79, 0.1)',
  shadowStrong: 'rgba(27, 67, 50, 0.15)',

  // Categories
  categoryFood: '#74C69D',
  categoryHealth: '#E76F51',
  categoryEquipment: '#457B9D',
  categoryLabor: '#E9C46A',
  categoryOther: '#8D99AE',

  // Card
  card: '#FFFFFF',
  cardElevated: '#F8FBF9',
} as const

export const darkColors = {
  // Primaires (plus lumineux en dark mode)
  primary: '#52B788',
  primaryLight: '#74C69D',
  primaryLighter: '#95D5B2',
  primaryDark: '#40916C',
  primarySurface: '#1B4332',

  // Backgrounds
  background: '#0D1B14',
  surface: '#152D22',
  surfaceElevated: '#1E3D2E',

  // Textes
  text: '#E8F0EB',
  textSecondary: '#A8C5B5',
  textMuted: '#6B8C7A',
  textInverse: '#1B4332',

  // Etats (legèrement ajustés pour dark mode)
  success: '#52B788',
  successLight: '#1E3D2E',
  warning: '#F4D58D',
  warningLight: '#3D3520',
  error: '#FF8A70',
  errorLight: '#3D2020',
  info: '#6BA3BE',
  infoLight: '#1E2D3D',

  // Bordures
  border: '#2D4A3A',
  borderFocus: '#52B788',
  borderStrong: '#3D5A4A',

  // Ombres
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)',

  // Categories
  categoryFood: '#74C69D',
  categoryHealth: '#FF8A70',
  categoryEquipment: '#6BA3BE',
  categoryLabor: '#F4D58D',
  categoryOther: '#A8B5C0',

  // Card
  card: '#152D22',
  cardElevated: '#1E3D2E',
} as const

// Type flexible pour les deux themes
export type ThemeColors = {
  readonly primary: string
  readonly primaryLight: string
  readonly primaryLighter: string
  readonly primaryDark: string
  readonly primarySurface: string
  readonly background: string
  readonly surface: string
  readonly surfaceElevated: string
  readonly text: string
  readonly textSecondary: string
  readonly textMuted: string
  readonly textInverse: string
  readonly success: string
  readonly successLight: string
  readonly warning: string
  readonly warningLight: string
  readonly error: string
  readonly errorLight: string
  readonly info: string
  readonly infoLight: string
  readonly border: string
  readonly borderFocus: string
  readonly borderStrong: string
  readonly shadow: string
  readonly shadowStrong: string
  readonly categoryFood: string
  readonly categoryHealth: string
  readonly categoryEquipment: string
  readonly categoryLabor: string
  readonly categoryOther: string
  readonly card: string
  readonly cardElevated: string
}
