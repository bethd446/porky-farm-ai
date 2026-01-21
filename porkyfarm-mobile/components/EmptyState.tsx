/**
 * EmptyState Component - VERSION AMÉLIORÉE
 * ==========================================
 * État vide avec support images, icônes et emojis
 */

import React from 'react'
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Image, ImageSourcePropType } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getEmptyStateImage } from '@/lib/imageHelpers'

export interface EmptyStateProps {
  type?: 'cheptel' | 'feed' | 'tasks' | 'health' | 'reproduction'
  icon?: keyof typeof Ionicons.glyphMap
  emoji?: string
  image?: ImageSourcePropType
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  children?: React.ReactNode
  style?: ViewStyle
}

export function EmptyState({
  type,
  icon,
  emoji,
  image,
  title,
  description,
  actionLabel,
  onAction,
  children,
  style,
}: EmptyStateProps) {
  // Priorité: image > type > emoji > icon
  const displayImage = image || (type ? getEmptyStateImage(type) : null)

  return (
    <View style={[styles.container, style]}>
      {displayImage ? (
        <Image source={displayImage} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.iconContainer}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <Ionicons
              name={icon || 'file-tray-outline'}
              size={48}
              color="#9CA3AF"
            />
          )}
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#FFF" style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
      {children && <View style={styles.actions}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actions: {
    marginTop: 24,
  },
  actionButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default EmptyState
