/**
 * LoadingScreen - Écran de chargement plein écran avec animation
 * ==============================================================
 * Utilisé pour les états de chargement globaux
 */

import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useTheme } from '../../contexts/ThemeContext'
import { colors, spacing, typography } from '../../lib/designTokens'

// Animation Lottie optionnelle (désactivée si non disponible)
let LottieView: any = null
try {
  LottieView = require('lottie-react-native').default
} catch {
  // Lottie non disponible, utiliser fallback
}

export interface LoadingScreenProps {
  /** Message affiché sous l'animation */
  message?: string
  /** Sous-titre optionnel */
  subtitle?: string
  /** Taille de l'animation (défaut: 150) */
  size?: number
  /** Couleur de l'indicateur de chargement */
  color?: string
  /** Animation Lottie source (optionnel) */
  animationSource?: any
}

export function LoadingScreen({
  message = 'Chargement...',
  subtitle,
  size = 150,
  color = colors.primary,
  animationSource,
}: LoadingScreenProps) {
  const { colors: themeColors } = useTheme()

  // Essayer d'utiliser Lottie si disponible
  const renderAnimation = () => {
    if (LottieView && animationSource) {
      return (
        <LottieView
          source={animationSource}
          style={{ width: size, height: size }}
          autoPlay
          loop
        />
      )
    }

    // Fallback: ActivityIndicator stylisé
    return (
      <View style={[styles.fallbackContainer, { width: size, height: size }]}>
        <View style={[styles.pulseOuter, { borderColor: color + '30' }]}>
          <View style={[styles.pulseMiddle, { borderColor: color + '50' }]}>
            <ActivityIndicator size="large" color={color} />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {renderAnimation()}

        {message && (
          <Text style={[styles.message, { color: themeColors.text }]}>
            {message}
          </Text>
        )}

        {subtitle && (
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  )
}

export interface LoadingInlineProps {
  /** Message court (optionnel) */
  message?: string
  /** Taille de l'indicateur */
  size?: 'small' | 'large'
  /** Couleur */
  color?: string
}

export function LoadingInline({
  message,
  size = 'small',
  color = colors.primary,
}: LoadingInlineProps) {
  const { colors: themeColors } = useTheme()

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[styles.inlineMessage, { color: themeColors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  )
}

export interface LoadingOverlayProps {
  /** Visible ou non */
  visible: boolean
  /** Message */
  message?: string
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { colors: themeColors } = useTheme()

  if (!visible) return null

  return (
    <View style={styles.overlay}>
      <View style={[styles.overlayContent, { backgroundColor: themeColors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Text style={[styles.overlayMessage, { color: themeColors.text }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseMiddle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  inlineMessage: {
    fontSize: typography.fontSize.bodySmall,
  },
  // Overlay styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  overlayMessage: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
})

export default LoadingScreen
