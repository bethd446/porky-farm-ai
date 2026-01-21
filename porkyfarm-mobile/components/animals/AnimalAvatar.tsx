/**
 * AnimalAvatar - Composant Avatar Premium pour animaux
 * =====================================================
 * Affiche un avatar circulaire avec photo ou initiales
 * Indicateur de statut coloré
 */

import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing, typography, radius } from '../../lib/designTokens'
import { elevation } from '../../lib/design/elevation'

export type AnimalCategory = 'sow' | 'boar' | 'piglet' | 'fattening'
export type AnimalStatus = 'active' | 'sick' | 'pregnant' | 'sold' | 'deceased'

export interface AnimalAvatarProps {
  identifier: string
  photoUrl?: string | null
  category: AnimalCategory
  status?: AnimalStatus
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
}

const CATEGORY_COLORS: Record<AnimalCategory, string> = {
  sow: '#E91E63',      // Rose - Truie
  boar: '#3F51B5',     // Bleu - Verrat
  piglet: '#FF9800',   // Orange - Porcelet
  fattening: '#4CAF50', // Vert - Engraissement
}

const STATUS_COLORS: Record<AnimalStatus, string> = {
  active: colors.success,
  sick: colors.error,
  pregnant: colors.info,
  sold: colors.mutedForeground,
  deceased: '#424242',
}

const CATEGORY_ICONS: Record<AnimalCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  sow: 'pig',
  boar: 'pig-variant',
  piglet: 'pig',
  fattening: 'pig',
}

const SIZE_CONFIG = {
  sm: { container: 36, fontSize: 14, statusSize: 10, statusOffset: 0 },
  md: { container: 48, fontSize: 18, statusSize: 14, statusOffset: 2 },
  lg: { container: 64, fontSize: 24, statusSize: 18, statusOffset: 3 },
  xl: { container: 80, fontSize: 32, statusSize: 22, statusOffset: 4 },
}

export function AnimalAvatar({
  identifier,
  photoUrl,
  category,
  status = 'active',
  size = 'md',
  showStatus = true,
}: AnimalAvatarProps) {
  const config = SIZE_CONFIG[size]
  const categoryColor = CATEGORY_COLORS[category]
  const statusColor = STATUS_COLORS[status]
  const initials = identifier.slice(0, 2).toUpperCase()

  return (
    <View style={[styles.container, { width: config.container, height: config.container }]}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={[
            styles.image,
            {
              width: config.container,
              height: config.container,
              borderRadius: config.container / 2,
              borderColor: categoryColor,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: config.container,
              height: config.container,
              borderRadius: config.container / 2,
              backgroundColor: categoryColor + '20',
              borderColor: categoryColor,
            },
            elevation.xs,
          ]}
        >
          <MaterialCommunityIcons
            name={CATEGORY_ICONS[category]}
            size={config.fontSize}
            color={categoryColor}
          />
        </View>
      )}

      {showStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: config.statusSize,
              height: config.statusSize,
              borderRadius: config.statusSize / 2,
              backgroundColor: statusColor,
              right: config.statusOffset,
              bottom: config.statusOffset,
            },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderWidth: 2,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  initials: {
    fontWeight: typography.fontWeight.bold,
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.card,
  },
})

export default AnimalAvatar
