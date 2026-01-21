/**
 * MenuListItem - Item de liste menu standardisé
 * ==============================================
 * Pour les menus et listes de navigation
 * Migré de Moti vers React Native Animated
 */

import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSlideIn, useScalePress } from '@/hooks/useAnimations'

interface MenuListItemProps {
  title: string
  subtitle?: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  iconBgColor?: string
  onPress: () => void
  showChevron?: boolean
  rightElement?: React.ReactNode
  delay?: number
}

export const MenuListItem: React.FC<MenuListItemProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  iconBgColor,
  onPress,
  showChevron = true,
  rightElement,
  delay = 0,
}) => {
  const bgColor = iconBgColor || `${iconColor}15`
  const { slideIn, animatedStyle: slideStyle } = useSlideIn('left', 20, 300, delay)
  const { onPressIn, onPressOut, animatedStyle: pressStyle } = useScalePress(0.98)

  useEffect(() => {
    slideIn()
  }, [slideIn])

  return (
    <Animated.View style={slideStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.container, pressStyle]}>
          {/* Icône */}
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={22} color={iconColor} />
          </View>

          {/* Texte */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {/* Droite */}
          {rightElement || (showChevron && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#D1D5DB"
            />
          ))}
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
})

export default MenuListItem
