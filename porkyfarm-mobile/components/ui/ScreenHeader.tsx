/**
 * ScreenHeader - Header d'écran standardisé
 * ==========================================
 * En-tête cohérent pour tous les écrans
 */

import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap
    onPress: () => void
    color?: string
  }
  transparent?: boolean
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
}: ScreenHeaderProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + 12 },
      transparent && styles.transparent
    ]}>
      <View style={styles.content}>
        {/* Gauche - Bouton retour ou espace */}
        <View style={styles.leftContainer}>
          {showBack ? (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.buttonPressed
              ]}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Centre - Titre */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Droite - Action ou espace */}
        <View style={styles.rightContainer}>
          {rightAction ? (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.buttonPressed
              ]}
              onPress={rightAction.onPress}
            >
              <Ionicons
                name={rightAction.icon}
                size={24}
                color={rightAction.color || '#10B981'}
              />
            </Pressable>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  leftContainer: {
    width: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 40,
  },
})

export default ScreenHeader
