/**
 * IconBadge - Icône dans un cercle coloré
 * ========================================
 * Composant réutilisable pour afficher une icône avec fond coloré
 */

import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type IconSize = 'sm' | 'md' | 'lg' | 'xl'

interface IconBadgeProps {
  icon: keyof typeof Ionicons.glyphMap
  color: string
  backgroundColor?: string
  size?: IconSize
  style?: ViewStyle
}

const SIZES: Record<IconSize, { container: number; icon: number; radius: number }> = {
  sm: { container: 36, icon: 18, radius: 10 },
  md: { container: 44, icon: 22, radius: 12 },
  lg: { container: 52, icon: 26, radius: 14 },
  xl: { container: 60, icon: 30, radius: 16 },
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  color,
  backgroundColor,
  size = 'md',
  style,
}) => {
  const dimensions = SIZES[size]
  const bgColor = backgroundColor || `${color}15`

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.radius,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={dimensions.icon} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default IconBadge
