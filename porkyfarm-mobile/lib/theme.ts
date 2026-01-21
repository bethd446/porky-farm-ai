import { colors, spacing, typography, radius, commonStyles } from './designTokens'
import { elevation } from './design/elevation'

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  elevation,
} as const

export { colors, spacing, typography, radius, elevation, commonStyles }
