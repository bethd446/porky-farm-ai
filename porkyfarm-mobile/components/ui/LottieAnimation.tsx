/**
 * LottieAnimation - Wrapper universel pour animations Lottie
 * ==========================================================
 * Composant réutilisable avec fallback et gestion d'erreurs
 */

import React, { useRef, useEffect, useState } from 'react'
import { View, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native'
import LottieView from 'lottie-react-native'
import { colors } from '../../lib/designTokens'

export interface LottieAnimationProps {
  /** Source de l'animation - peut être require() ou URL */
  source: any
  /** Style du conteneur */
  style?: ViewStyle
  /** Taille de l'animation */
  size?: number | { width: number; height: number }
  /** Lecture automatique (défaut: true) */
  autoPlay?: boolean
  /** Boucle infinie (défaut: true) */
  loop?: boolean
  /** Vitesse de lecture (défaut: 1) */
  speed?: number
  /** Callback à la fin de l'animation */
  onAnimationFinish?: () => void
  /** Couleur du fallback/loading */
  fallbackColor?: string
  /** Afficher un fallback pendant le chargement */
  showFallback?: boolean
}

export function LottieAnimation({
  source,
  style,
  size = 120,
  autoPlay = true,
  loop = true,
  speed = 1,
  onAnimationFinish,
  fallbackColor = colors.primary,
  showFallback = true,
}: LottieAnimationProps) {
  const animationRef = useRef<LottieView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Calculer les dimensions
  const dimensions = typeof size === 'number'
    ? { width: size, height: size }
    : size

  useEffect(() => {
    if (animationRef.current && autoPlay) {
      animationRef.current.play()
    }
  }, [autoPlay])

  // Méthodes exposées via ref
  const play = () => animationRef.current?.play()
  const pause = () => animationRef.current?.pause()
  const reset = () => animationRef.current?.reset()

  if (hasError || !source) {
    return (
      <View style={[styles.fallback, dimensions, style]}>
        <ActivityIndicator size="small" color={fallbackColor} />
      </View>
    )
  }

  return (
    <View style={[dimensions, style]}>
      {showFallback && isLoading && (
        <View style={[styles.fallback, dimensions, styles.absolute]}>
          <ActivityIndicator size="small" color={fallbackColor} />
        </View>
      )}
      <LottieView
        ref={animationRef}
        source={source}
        style={dimensions}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationLoaded={() => setIsLoading(false)}
        onAnimationFailure={() => setHasError(true)}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  )
}

// Composant simplifié pour animations inline
export function LottieInline({
  source,
  size = 24,
  ...props
}: Omit<LottieAnimationProps, 'showFallback'>) {
  return (
    <LottieAnimation
      source={source}
      size={size}
      showFallback={false}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
    zIndex: 1,
  },
})

export default LottieAnimation
