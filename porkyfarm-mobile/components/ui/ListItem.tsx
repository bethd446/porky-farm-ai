/**
 * ListItem - Composant uniforme pour les éléments de liste
 * =========================================================
 */

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ListItemProps {
  title: string
  subtitle?: string
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  iconBgColor?: string
  rightText?: string
  rightIcon?: keyof typeof Ionicons.glyphMap
  onPress?: () => void
  showChevron?: boolean
}

export function ListItem({
  title,
  subtitle,
  icon,
  iconColor = '#10B981',
  iconBgColor,
  rightText,
  rightIcon,
  onPress,
  showChevron = true,
}: ListItemProps) {
  const bgColor = iconBgColor || `${iconColor}15`

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Icône */}
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
      )}

      {/* Texte */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      {/* Droite */}
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      {rightIcon && <Ionicons name={rightIcon} size={20} color="#9CA3AF" />}
      {showChevron && onPress && !rightIcon && (
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  rightText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
})

export default ListItem

