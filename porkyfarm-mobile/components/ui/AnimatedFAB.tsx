/**
 * AnimatedFAB - Floating Action Button animé
 * ==========================================
 * Bouton + central avec menu d'actions rapides
 * Migré de Moti vers React Native Animated
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Pressable,
  View,
  Text,
  Modal,
  Animated,
  Easing,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useScalePress, useAnimatedValue } from '@/hooks/useAnimations'

export interface QuickAction {
  id: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
  onPress: () => void
}

interface AnimatedFABProps {
  actions: QuickAction[]
  visible?: boolean
}

// Composant pour chaque action du menu
const ActionItem: React.FC<{
  action: QuickAction
  index: number
  isOpen: boolean
  onActionPress: () => void
}> = ({ action, index, isOpen, onActionPress }) => {
  const opacity = useAnimatedValue(0)
  const translateY = useAnimatedValue(30)
  const scale = useAnimatedValue(0.8)

  useEffect(() => {
    if (isOpen) {
      const delay = index * 60
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          delay,
          useNativeDriver: true,
          damping: 15,
        }),
        Animated.spring(scale, {
          toValue: 1,
          delay,
          useNativeDriver: true,
          damping: 15,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isOpen, index, opacity, translateY, scale])

  return (
    <Animated.View
      style={[
        styles.actionItem,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Text style={styles.actionLabel}>{action.label}</Text>
      <Pressable
        onPress={onActionPress}
        style={[styles.actionButton, { backgroundColor: action.color }]}
      >
        <Ionicons name={action.icon} size={24} color="#FFF" />
      </Pressable>
    </Animated.View>
  )
}

export const AnimatedFAB: React.FC<AnimatedFABProps> = ({
  actions,
  visible = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const rotation = useAnimatedValue(0)
  const fabScale = useAnimatedValue(0.8)
  const fabOpacity = useAnimatedValue(0)
  const { onPressIn, onPressOut, animatedStyle: pressStyle } = useScalePress(0.9)

  // Animation d'entrée du FAB
  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
      }),
      Animated.timing(fabOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fabScale, fabOpacity])

  // Animation de rotation du +
  useEffect(() => {
    Animated.spring(rotation, {
      toValue: isOpen ? 45 : 0,
      useNativeDriver: true,
      damping: 15,
    }).start()
  }, [isOpen, rotation])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const handleActionPress = (action: QuickAction) => {
    closeMenu()
    setTimeout(action.onPress, 200)
  }

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 45],
    outputRange: ['0deg', '45deg'],
  })

  if (!visible) return null

  return (
    <>
      {/* Modal Backdrop */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeMenu}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <ActionItem
                key={action.id}
                action={action}
                index={index}
                isOpen={isOpen}
                onActionPress={() => handleActionPress(action)}
              />
            ))}
          </View>

          {/* Close FAB dans le modal */}
          <Pressable onPress={closeMenu} style={styles.modalFabContainer}>
            <Animated.View
              style={[
                styles.fab,
                { transform: [{ rotate: rotateInterpolate }] },
              ]}
            >
              <Ionicons name="add" size={32} color="#FFF" />
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* FAB Button (toujours visible) */}
      {!isOpen && (
        <Pressable
          onPress={toggleMenu}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.fabContainer}
        >
          <Animated.View
            style={[
              styles.fab,
              pressStyle,
              {
                transform: [
                  { scale: fabScale },
                  ...(pressStyle.transform || []),
                ],
                opacity: fabOpacity,
              },
            ]}
          >
            <Ionicons name="add" size={32} color="#FFF" />
          </Animated.View>
        </Pressable>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  actionsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionLabel: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    zIndex: 100,
  },
  modalFabContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
})

export default AnimatedFAB
