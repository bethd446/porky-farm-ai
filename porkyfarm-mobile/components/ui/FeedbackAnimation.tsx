/**
 * FeedbackAnimation - Animations de feedback utilisateur
 * =======================================================
 * Composants pour success, error, warning, info avec animations
 */

import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { colors, spacing, typography, radius } from '../../lib/designTokens'

// Import Lottie conditionnel
let LottieView: any = null
try {
  LottieView = require('lottie-react-native').default
} catch {
  // Lottie non disponible
}

export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

const FEEDBACK_CONFIG: Record<FeedbackType, {
  color: string
  icon: keyof typeof Ionicons.glyphMap
  emoji: string
  defaultTitle: string
}> = {
  success: {
    color: '#10B981',
    icon: 'checkmark-circle',
    emoji: '✅',
    defaultTitle: 'Succès !',
  },
  error: {
    color: '#EF4444',
    icon: 'close-circle',
    emoji: '❌',
    defaultTitle: 'Erreur',
  },
  warning: {
    color: '#F59E0B',
    icon: 'warning',
    emoji: '⚠️',
    defaultTitle: 'Attention',
  },
  info: {
    color: '#3B82F6',
    icon: 'information-circle',
    emoji: 'ℹ️',
    defaultTitle: 'Information',
  },
}

export interface FeedbackAnimationProps {
  /** Type de feedback */
  type: FeedbackType
  /** Animation Lottie source (optionnel) */
  animationSource?: any
  /** Titre */
  title?: string
  /** Message */
  message?: string
  /** Taille de l'icône/animation */
  size?: number
  /** Afficher en mode compact */
  compact?: boolean
  /** Animation automatique d'entrée */
  animate?: boolean
  /** Style personnalisé */
  style?: ViewStyle
  /** Callback à la fin de l'animation */
  onAnimationComplete?: () => void
}

export function FeedbackAnimation({
  type,
  animationSource,
  title,
  message,
  size = 80,
  compact = false,
  animate = true,
  style,
  onAnimationComplete,
}: FeedbackAnimationProps) {
  const { colors: themeColors } = useTheme()
  const config = FEEDBACK_CONFIG[type]
  const scaleAnim = useRef(new Animated.Value(animate ? 0 : 1)).current
  const opacityAnim = useRef(new Animated.Value(animate ? 0 : 1)).current

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete?.()
      })
    }
  }, [animate])

  const renderIcon = () => {
    if (LottieView && animationSource) {
      return (
        <LottieView
          source={animationSource}
          style={{ width: size, height: size }}
          autoPlay
          loop={false}
        />
      )
    }

    return (
      <View style={[
        styles.iconCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.color + '15',
        }
      ]}>
        <Ionicons
          name={config.icon}
          size={size * 0.5}
          color={config.color}
        />
      </View>
    )
  }

  const finalTitle = title || config.defaultTitle

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          { backgroundColor: config.color + '10', borderLeftColor: config.color },
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <Ionicons name={config.icon} size={24} color={config.color} />
        <View style={styles.compactText}>
          <Text style={[styles.compactTitle, { color: themeColors.text }]}>
            {finalTitle}
          </Text>
          {message && (
            <Text style={[styles.compactMessage, { color: themeColors.textSecondary }]}>
              {message}
            </Text>
          )}
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {renderIcon()}

      <Text style={[styles.title, { color: themeColors.text }]}>
        {finalTitle}
      </Text>

      {message && (
        <Text style={[styles.message, { color: themeColors.textSecondary }]}>
          {message}
        </Text>
      )}
    </Animated.View>
  )
}

// Composant spécialisé Success
export function SuccessAnimation({
  title = 'Succès !',
  message,
  onComplete,
  ...props
}: Omit<FeedbackAnimationProps, 'type'> & { onComplete?: () => void }) {
  return (
    <FeedbackAnimation
      type="success"
      title={title}
      message={message}
      onAnimationComplete={onComplete}
      {...props}
    />
  )
}

// Composant spécialisé Error
export function ErrorAnimation({
  title = 'Erreur',
  message,
  ...props
}: Omit<FeedbackAnimationProps, 'type'>) {
  return (
    <FeedbackAnimation
      type="error"
      title={title}
      message={message}
      {...props}
    />
  )
}

// Animation de checkmark simple
export function CheckmarkAnimation({
  size = 60,
  color = colors.success,
  onComplete,
}: {
  size?: number
  color?: string
  onComplete?: () => void
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.()
    })

    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  })

  return (
    <Animated.View
      style={[
        styles.checkmarkContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '15',
          transform: [{ scale: scaleAnim }, { rotate }],
        },
      ]}
    >
      <Ionicons name="checkmark" size={size * 0.5} color={color} />
    </Animated.View>
  )
}

// Animation de pulsation pour loading
export function PulseAnimation({
  size = 20,
  color = colors.primary,
}: {
  size?: number
  color?: string
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  compactText: {
    flex: 1,
  },
  compactTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  compactMessage: {
    fontSize: typography.fontSize.bodySmall,
    marginTop: 2,
  },
  // Checkmark
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Pulse
  pulse: {
    opacity: 0.8,
  },
})

export default FeedbackAnimation
