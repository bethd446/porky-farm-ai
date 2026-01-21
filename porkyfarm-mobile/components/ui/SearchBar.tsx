/**
 * SearchBar Component - Barre de recherche
 * =========================================
 */

import { useState, useRef } from 'react'
import { View, TextInput, StyleSheet, Pressable, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { colors, typography, spacing, radius, shadows } from '../../lib/designTokens'
import { Search, X } from 'lucide-react-native'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  autoFocus?: boolean
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
  style?: ViewStyle
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
  autoFocus = false,
  onFocus,
  onBlur,
  onClear,
  style,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const focusAnimation = useSharedValue(0)

  const handleFocus = () => {
    setIsFocused(true)
    focusAnimation.value = withSpring(1, { damping: 15 })
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    focusAnimation.value = withSpring(0, { damping: 15 })
    onBlur?.()
  }

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChangeText('')
    onClear?.()
    inputRef.current?.focus()
  }

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: isFocused ? colors.primary : colors.border,
    shadowOpacity: interpolate(focusAnimation.value, [0, 1], [0.04, 0.1]),
  }))

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusAnimation.value, [0, 1], [0.5, 1]),
  }))

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, style]}>
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <Search size={20} color={isFocused ? colors.primary : colors.textMuted} />
      </Animated.View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus={autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <AnimatedPressable
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={8}
        >
          <View style={styles.clearIcon}>
            <X size={14} color={colors.textMuted} />
          </View>
        </AnimatedPressable>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.foreground,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  clearIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
