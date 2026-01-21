/**
 * LottieFAB - Floating Action Button avec animation Lottie
 * =========================================================
 * FAB simple avec animation Lottie intégrée
 */

import React, { useRef, useEffect } from 'react'
import {
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius } from '../../lib/designTokens'

// Import Lottie conditionnel
let LottieView: any = null
try {
  LottieView = require('lottie-react-native').default
} catch {
  // Lottie non disponible
}

export interface LottieFABProps {
  /** Action au press */
  onPress: (event: GestureResponderEvent) => void
  /** Animation Lottie source (optionnel) */
  animationSource?: any
  /** Icône Ionicons (fallback) */
  icon?: keyof typeof Ionicons.glyphMap
  /** Couleur de fond */
  backgroundColor?: string
  /** Couleur de l'icône */
  iconColor?: string
  /** Taille du FAB */
  size?: number
  /** Position depuis le bas */
  bottom?: number
  /** Position depuis la droite */
  right?: number
  /** Style personnalisé */
  style?: ViewStyle
  /** FAB visible */
  visible?: boolean
  /** Désactivé */
  disabled?: boolean
  /** Animation d'entrée/sortie */
  animate?: boolean
}

export function LottieFAB({
  onPress,
  animationSource,
  icon = 'add',
  backgroundColor = colors.primary,
  iconColor = '#FFFFFF',
  size = 56,
  bottom = 90,
  right,
  style,
  visible = true,
  disabled = false,
  animate = true,
}: LottieFABProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const pressAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (animate) {
      Animated.spring(scaleAnim, {
        toValue: visible ? 1 : 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start()
    } else {
      scaleAnim.setValue(visible ? 1 : 0)
    }
  }, [visible, animate])

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.9,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start()
  }

  if (!visible && !animate) return null

  const renderContent = () => {
    if (LottieView && animationSource) {
      return (
        <LottieView
          source={animationSource}
          style={{ width: size * 0.6, height: size * 0.6 }}
          autoPlay
          loop
        />
      )
    }

    return <Ionicons name={icon} size={size * 0.5} color={iconColor} />
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom,
          right: right ?? undefined,
          alignSelf: right ? 'flex-end' : 'center',
          transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
          opacity: scaleAnim,
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.fab,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  )
}

// FAB avec loading state
export function LoadingFAB({
  loading = false,
  loadingColor = '#FFFFFF',
  ...props
}: LottieFABProps & { loading?: boolean; loadingColor?: string }) {
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start()
    } else {
      rotateAnim.setValue(0)
    }
  }, [loading])

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  if (loading) {
    return (
      <LottieFAB
        {...props}
        icon="sync"
        disabled
        style={StyleSheet.flatten([props.style]) as ViewStyle}
      />
    )
  }

  return <LottieFAB {...props} />
}

// Mini FAB
export function MiniFAB({
  size = 40,
  bottom = 80,
  ...props
}: Omit<LottieFABProps, 'size' | 'bottom'> & { size?: number; bottom?: number }) {
  return <LottieFAB size={size} bottom={bottom} {...props} />
}

// FAB avec badge
export function BadgeFAB({
  badge,
  badgeColor = colors.error,
  badgeTextColor = '#FFFFFF',
  ...props
}: LottieFABProps & {
  badge?: number | string
  badgeColor?: string
  badgeTextColor?: string
}) {
  if (!badge) return <LottieFAB {...props} />

  const displayBadge = typeof badge === 'number' && badge > 99 ? '99+' : String(badge)

  return (
    <LottieFAB {...props}>
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor,
          },
        ]}
      >
        <Animated.Text style={[styles.badgeText, { color: badgeTextColor }]}>
          {displayBadge}
        </Animated.Text>
      </Animated.View>
    </LottieFAB>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
})

export default LottieFAB
