/**
 * Composant Toast réutilisable (React Native)
 * Pour afficher des messages de succès/erreur/info
 */

import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../lib/designTokens'
import { elevation } from '../lib/design/elevation'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  visible: boolean
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ visible, message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto-fermeture
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      handleClose()
    }
  }, [visible, duration])

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose()
    })
  }

  if (!visible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="#ffffff" />
      case 'error':
        return <XCircle size={20} color="#ffffff" />
      case 'warning':
        return <AlertCircle size={20} color="#ffffff" />
      default:
        return <Info size={20} color="#ffffff" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success
      case 'error':
        return colors.error
      case 'warning':
        return colors.warning
      default:
        return colors.info
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: getBackgroundColor() }, elevation.lg]}>
        <View style={styles.content}>
          {getIcon()}
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.base,
    right: spacing.base,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    minHeight: spacing.touchTarget,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: '#ffffff',
    lineHeight: typography.fontSize.bodySmall * typography.lineHeight.normal,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
})

