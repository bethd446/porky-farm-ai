/**
 * Chip Component - Filtres et tags selectionnables
 * =================================================
 */

import { Pressable, Text, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { typography, spacing, radius } from '../../lib/designTokens'
import { useColors } from '../../contexts/ThemeContext'
import { X, Check } from 'lucide-react-native'

type ChipVariant = 'filter' | 'input' | 'suggestion'

interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  onRemove?: () => void
  variant?: ChipVariant
  icon?: React.ReactNode
  disabled?: boolean
  style?: ViewStyle
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  variant = 'filter',
  icon,
  disabled = false,
  style,
}: ChipProps) {
  const colors = useColors()
  
  const handlePress = () => {
    if (disabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.()
  }

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onRemove?.()
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { damping: 15 }) }],
  }))

  const isRemovable = variant === 'input' && onRemove

  // Styles dynamiques basés sur le thème
  const dynamicStyles = {
    chip: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
    },
    chipSelected: {
      backgroundColor: colors.primarySurface,
      borderColor: colors.primary,
    },
    chipSuggestion: {
      backgroundColor: colors.surface,
    },
    label: {
      color: colors.textSecondary,
    },
    labelSelected: {
      color: colors.primary,
    },
    labelDisabled: {
      color: colors.textMuted,
    },
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={[
        styles.chip,
        dynamicStyles.chip,
        selected && dynamicStyles.chipSelected,
        disabled && styles.chipDisabled,
        variant === 'suggestion' && dynamicStyles.chipSuggestion,
        animatedStyle,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      {selected && variant === 'filter' && (
        <Check size={14} color={colors.primary} style={styles.checkIcon} />
      )}

      <Text
        style={[
          styles.label,
          dynamicStyles.label,
          selected && dynamicStyles.labelSelected,
          disabled && dynamicStyles.labelDisabled,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {isRemovable && (
        <Pressable onPress={handleRemove} hitSlop={8} style={styles.removeButton}>
          <X size={14} color={colors.textMuted} />
        </Pressable>
      )}
    </AnimatedPressable>
  )
}

// Groupe de Chips pour filtres
interface ChipGroupProps {
  options: { label: string; value: string }[]
  selected: string | string[]
  onSelect: (value: string) => void
  multiple?: boolean
  style?: ViewStyle
}

export function ChipGroup({
  options,
  selected,
  onSelect,
  multiple = false,
  style,
}: ChipGroupProps) {
  const isSelected = (value: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(value)
    }
    return selected === value
  }

  return (
    <View style={[styles.group, style]}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={isSelected(option.value)}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
  },
  removeButton: {
    marginLeft: spacing.xs,
    padding: 2,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
})
