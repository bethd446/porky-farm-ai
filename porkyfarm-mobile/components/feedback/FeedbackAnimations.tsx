/**
 * Feedback Animations - PorkyFarm 2026
 * =====================================
 * Composants pour success, error, confetti
 *
 * Design: Organic/agricultural aesthetic avec spring physics
 * Palette: Vert #10B981 | Warning #F59E0B | Error #EF4444
 */

import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { spacing, radius, typography, shadows } from '../../lib/theme/tokens'

// Essayer d'importer Lottie (fallback gracieux si non disponible)
let LottieView: any = null
try {
  LottieView = require('lottie-react-native').default
} catch {
  // Lottie non disponible - utiliser animations natives
}

// ===========================================
// TYPES
// ===========================================

interface FeedbackProps {
  visible: boolean
  message?: string
  onComplete?: () => void
  duration?: number
  size?: number
}

interface ToastProps {
  visible: boolean
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onHide?: () => void
}

// ===========================================
// SUCCESS ANIMATION
// ===========================================

/**
 * SuccessAnimation - Checkmark anime avec message
 * Spring physics pour un rendu organique et satisfaisant
 */
export function SuccessAnimation({
  visible,
  message = 'Succes !',
  onComplete,
  duration = 2000,
  size = 80,
}: FeedbackProps) {
  const { colors } = useTheme()
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const checkmarkScale = useRef(new Animated.Value(0)).current
  const ringScale = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    if (visible) {
      // Reset des valeurs
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      checkmarkScale.setValue(0)
      ringScale.setValue(0.8)

      // Animation d'entree avec sequence choreographiee
      Animated.parallel([
        // Container fade + scale
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Ring pulse
        Animated.spring(ringScale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }).start()

        // Checkmark bounce avec delai
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }).start()
      })

      // Auto-hide apres duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 150,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => onComplete?.())
      }, duration)

      return () => clearTimeout(timer)
    } else {
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      checkmarkScale.setValue(0)
      ringScale.setValue(0.8)
    }
  }, [visible, duration, onComplete])

  if (!visible) return null

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.feedbackContainer,
          {
            backgroundColor: colors.surface,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          {/* Ring externe anime */}
          <Animated.View
            style={[
              styles.iconRing,
              {
                borderColor: colors.success,
                width: size,
                height: size,
                borderRadius: size / 2,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          {/* Cercle de fond */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.successLight,
                width: size * 0.85,
                height: size * 0.85,
                borderRadius: (size * 0.85) / 2,
              },
            ]}
          >
            {/* Checkmark anime */}
            <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
              <Ionicons
                name="checkmark"
                size={size * 0.45}
                color={colors.success}
              />
            </Animated.View>
          </View>
        </View>
        {message && (
          <Text style={[styles.feedbackMessage, { color: colors.text }]}>
            {message}
          </Text>
        )}
      </Animated.View>
    </View>
  )
}

// ===========================================
// ERROR ANIMATION
// ===========================================

/**
 * ErrorAnimation - Alerte animee avec shake
 * Effet de secousse pour attirer l'attention sur l'erreur
 */
export function ErrorAnimation({
  visible,
  message = 'Erreur',
  onComplete,
  duration = 2500,
  size = 80,
}: FeedbackProps) {
  const { colors } = useTheme()
  const scaleAnim = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (visible) {
      // Reset
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      shakeAnim.setValue(0)
      pulseAnim.setValue(1)

      // Animation d'entree
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Shake effect (3 secousses)
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 12,
            duration: 60,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -12,
            duration: 60,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 8,
            duration: 60,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -8,
            duration: 60,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 60,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start()

        // Pulse subtil de l'icone
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ).start()
      })

      // Auto-hide
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onComplete?.())
      }, duration)

      return () => clearTimeout(timer)
    } else {
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      shakeAnim.setValue(0)
    }
  }, [visible, duration, onComplete])

  if (!visible) return null

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.feedbackContainer,
          {
            backgroundColor: colors.surface,
            transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: colors.errorLight,
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="close" size={size * 0.5} color={colors.error} />
        </Animated.View>
        {message && (
          <Text style={[styles.feedbackMessage, { color: colors.text }]}>
            {message}
          </Text>
        )}
      </Animated.View>
    </View>
  )
}

// ===========================================
// CONFETTI ANIMATION
// ===========================================

/**
 * ConfettiAnimation - Celebration avec particules
 * Fallback elegant si Lottie non disponible
 */
export function ConfettiAnimation({
  visible,
  message,
  onComplete,
  duration = 3000,
}: FeedbackProps) {
  const { colors } = useTheme()
  const opacityAnim = useRef(new Animated.Value(0)).current
  const trophyScale = useRef(new Animated.Value(0)).current
  const trophyRotate = useRef(new Animated.Value(0)).current
  const glowOpacity = useRef(new Animated.Value(0)).current

  // Particules animees (simulation confetti simple)
  const particles = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotation: new Animated.Value(0),
    }))
  ).current

  useEffect(() => {
    if (visible) {
      // Reset
      opacityAnim.setValue(0)
      trophyScale.setValue(0)
      trophyRotate.setValue(0)
      glowOpacity.setValue(0)

      // Animation principale
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(trophyScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Petit wiggle du trophee
        Animated.sequence([
          Animated.timing(trophyRotate, {
            toValue: 0.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(trophyRotate, {
            toValue: -0.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(trophyRotate, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start()

        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.2,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ).start()

        // Particules explosent vers l'exterieur
        particles.forEach((particle, index) => {
          const angle = (index / 8) * Math.PI * 2
          const distance = 80 + Math.random() * 40

          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: Math.cos(angle) * distance,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Math.sin(angle) * distance,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(particle.rotation, {
              toValue: Math.random() * 4 - 2,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Fade out des particules
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start()
          })
        })
      })

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(trophyScale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onComplete?.())
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration, onComplete])

  if (!visible) return null

  const particleColors = [
    colors.success,
    colors.warning,
    colors.info,
    colors.primary,
    '#EC4899', // Rose
    '#8B5CF6', // Violet
    '#F59E0B', // Orange
    '#10B981', // Vert
  ]

  const rotateInterpolate = trophyRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  })

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.confettiContainer, { opacity: opacityAnim }]}>
        {/* Particules */}
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                backgroundColor: particleColors[index],
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  {
                    rotate: particle.rotation.interpolate({
                      inputRange: [-2, 2],
                      outputRange: ['-180deg', '180deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: colors.primary,
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Badge celebration */}
        <Animated.View
          style={[
            styles.celebrationBadge,
            {
              backgroundColor: colors.primary,
              transform: [
                { scale: trophyScale },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <Ionicons name="trophy" size={48} color="#FFFFFF" />
        </Animated.View>

        {message && (
          <Text style={[styles.confettiMessage, { color: colors.text }]}>
            {message}
          </Text>
        )}
      </Animated.View>
    </View>
  )
}

// ===========================================
// ANIMATED TOAST
// ===========================================

/**
 * AnimatedToast - Notification toast animee
 * Slide depuis le haut avec spring physics
 */
export function AnimatedToast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const { colors } = useTheme()
  const translateY = useRef(new Animated.Value(-100)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const scaleX = useRef(new Animated.Value(0.95)).current

  const typeConfig = {
    success: { bg: colors.success, icon: 'checkmark-circle' as const },
    error: { bg: colors.error, icon: 'alert-circle' as const },
    warning: { bg: colors.warning, icon: 'warning' as const },
    info: { bg: colors.info, icon: 'information-circle' as const },
  }

  const config = typeConfig[type]

  useEffect(() => {
    if (visible) {
      translateY.setValue(-100)
      opacityAnim.setValue(0)
      scaleX.setValue(0.95)

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleX, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start()

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide?.())
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration, onHide])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.bg,
          transform: [{ translateY }, { scaleX }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.toastIconContainer}>
        <Ionicons name={config.icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.toastText} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  )
}

// ===========================================
// STYLES
// ===========================================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  feedbackContainer: {
    padding: spacing['2xl'],
    borderRadius: radius['2xl'],
    alignItems: 'center',
    minWidth: 200,
    maxWidth: 280,
    ...shadows.xl,
  },
  iconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconRing: {
    position: 'absolute',
    borderWidth: 3,
    opacity: 0.3,
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackMessage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  confettiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  celebrationBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
  },
  confettiMessage: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
    ...shadows.lg,
  },
  toastIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
})

// ===========================================
// EXPORTS
// ===========================================

export default {
  SuccessAnimation,
  ErrorAnimation,
  ConfettiAnimation,
  AnimatedToast,
}
