/**
 * useAnimations - Hooks d'animation React Native Animated
 * ========================================================
 * Remplace Moti par des hooks natifs performants
 *
 * Règles:
 * - useNativeDriver: true TOUJOURS (sauf layout)
 * - useRef pour les valeurs animées (pas de re-création)
 * - useCallback pour les fonctions d'animation
 */

import { useRef, useCallback, useEffect } from 'react'
import { Animated, Easing } from 'react-native'

// ═══════════════════════════════════════════════════════════════
// HOOK: useAnimatedValue
// Créer une valeur animée avec useRef (bonne pratique)
// ═══════════════════════════════════════════════════════════════
export function useAnimatedValue(initialValue: number = 0): Animated.Value {
  const animatedValue = useRef(new Animated.Value(initialValue)).current
  return animatedValue
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useAnimatedXY
// Créer une valeur animée XY pour les translations
// ═══════════════════════════════════════════════════════════════
export function useAnimatedXY(
  initialX: number = 0,
  initialY: number = 0
): Animated.ValueXY {
  const animatedValue = useRef(
    new Animated.ValueXY({ x: initialX, y: initialY })
  ).current
  return animatedValue
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useFadeIn
// Animation d'apparition en fondu
// ═══════════════════════════════════════════════════════════════
export function useFadeIn(duration: number = 300, delay: number = 0) {
  const opacity = useAnimatedValue(0)

  const fadeIn = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [opacity, duration, delay])

  const fadeOut = useCallback(
    (callback?: () => void) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(callback)
    },
    [opacity, duration]
  )

  const reset = useCallback(() => {
    opacity.setValue(0)
  }, [opacity])

  return {
    opacity,
    fadeIn,
    fadeOut,
    reset,
    animatedStyle: { opacity },
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useScalePress
// Animation de pression (scale down on press)
// ═══════════════════════════════════════════════════════════════
export function useScalePress(scaleDown: number = 0.96) {
  const scale = useAnimatedValue(1)

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: scaleDown,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }, [scale, scaleDown])

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }, [scale])

  return {
    scale,
    onPressIn,
    onPressOut,
    animatedStyle: { transform: [{ scale }] },
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useSlideIn
// Animation d'entrée par glissement
// ═══════════════════════════════════════════════════════════════
type SlideDirection = 'left' | 'right' | 'top' | 'bottom'

export function useSlideIn(
  direction: SlideDirection = 'bottom',
  distance: number = 30,
  duration: number = 400,
  delay: number = 0
) {
  const isHorizontal = direction === 'left' || direction === 'right'
  const initialValue =
    direction === 'left' || direction === 'top' ? -distance : distance

  const translate = useAnimatedValue(initialValue)
  const opacity = useAnimatedValue(0)

  const slideIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.6,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start()
  }, [translate, opacity, duration, delay])

  const slideOut = useCallback(
    (callback?: () => void) => {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: initialValue,
          duration: duration * 0.8,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.6,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(callback)
    },
    [translate, opacity, initialValue, duration]
  )

  const reset = useCallback(() => {
    translate.setValue(initialValue)
    opacity.setValue(0)
  }, [translate, opacity, initialValue])

  const animatedStyle = {
    opacity,
    transform: [isHorizontal ? { translateX: translate } : { translateY: translate }],
  }

  return {
    slideIn,
    slideOut,
    reset,
    animatedStyle,
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useListItemAnimation
// Animation pour éléments de liste (stagger effect)
// ═══════════════════════════════════════════════════════════════
export function useListItemAnimation(
  index: number,
  baseDelay: number = 50,
  duration: number = 300
) {
  const opacity = useAnimatedValue(0)
  const translateY = useAnimatedValue(20)
  const delay = index * baseDelay

  const animate = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, translateY, duration, delay])

  const reset = useCallback(() => {
    opacity.setValue(0)
    translateY.setValue(20)
  }, [opacity, translateY])

  return {
    animate,
    reset,
    animatedStyle: {
      opacity,
      transform: [{ translateY }],
    },
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: usePulse
// Animation de pulsation (pour alertes, notifications)
// ═══════════════════════════════════════════════════════════════
export function usePulse(minScale: number = 0.97, maxScale: number = 1.03) {
  const scale = useAnimatedValue(1)
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  const startPulse = useCallback(() => {
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: maxScale,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: minScale,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    animationRef.current.start()
  }, [scale, minScale, maxScale])

  const stopPulse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop()
      animationRef.current = null
    }
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [scale])

  return {
    scale,
    startPulse,
    stopPulse,
    animatedStyle: { transform: [{ scale }] },
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useShake
// Animation de secousse (pour erreurs, validation)
// ═══════════════════════════════════════════════════════════════
export function useShake(intensity: number = 10) {
  const translateX = useAnimatedValue(0)

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: intensity * 0.6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -intensity * 0.6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start()
  }, [translateX, intensity])

  return {
    shake,
    animatedStyle: { transform: [{ translateX }] },
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useRotate
// Animation de rotation (pour FAB, loading indicators)
// ═══════════════════════════════════════════════════════════════
export function useRotate(duration: number = 300) {
  const rotation = useAnimatedValue(0)

  const rotateTo = useCallback(
    (degrees: number, callback?: () => void) => {
      Animated.timing(rotation, {
        toValue: degrees,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(callback)
    },
    [rotation, duration]
  )

  const spin = useCallback(() => {
    rotation.setValue(0)
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 360,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()
  }, [rotation])

  const interpolatedRotation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  })

  return {
    rotation,
    rotateTo,
    spin,
    animatedStyle: { transform: [{ rotate: interpolatedRotation }] },
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useCombinedAnimation
// Combiner plusieurs animations (fade + slide + scale)
// ═══════════════════════════════════════════════════════════════
export function useCombinedAnimation(
  options: {
    fade?: boolean
    slide?: SlideDirection
    scale?: boolean
    duration?: number
    delay?: number
  } = {}
) {
  const {
    fade = true,
    slide,
    scale = false,
    duration = 300,
    delay = 0,
  } = options

  const opacity = useAnimatedValue(fade ? 0 : 1)
  const translateY = useAnimatedValue(slide === 'bottom' ? 20 : slide === 'top' ? -20 : 0)
  const translateX = useAnimatedValue(slide === 'right' ? 20 : slide === 'left' ? -20 : 0)
  const scaleValue = useAnimatedValue(scale ? 0.9 : 1)

  const animateIn = useCallback(() => {
    const animations: Animated.CompositeAnimation[] = []

    if (fade) {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
      )
    }

    if (slide) {
      const translateAnim = slide === 'left' || slide === 'right' ? translateX : translateY
      animations.push(
        Animated.timing(translateAnim, {
          toValue: 0,
          duration,
          delay,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        })
      )
    }

    if (scale) {
      animations.push(
        Animated.timing(scaleValue, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      )
    }

    Animated.parallel(animations).start()
  }, [opacity, translateX, translateY, scaleValue, fade, slide, scale, duration, delay])

  return {
    animateIn,
    animatedStyle: {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { scale: scaleValue },
      ],
    },
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useAutoAnimate
// Lance l'animation automatiquement au mount
// ═══════════════════════════════════════════════════════════════
export function useAutoAnimate(
  direction: SlideDirection = 'bottom',
  delay: number = 0
) {
  const { slideIn, animatedStyle } = useSlideIn(direction, 20, 300, delay)

  useEffect(() => {
    slideIn()
  }, [slideIn])

  return { animatedStyle }
}
