/**
 * Input Component - VERSION SIMPLIFIÉE
 * =====================================
 * Champ de saisie avec validation et icônes
 * Couleurs string directes sans Reanimated
 */

import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'

interface InputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  error?: string
  hint?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  icon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightIconPress?: () => void
  disabled?: boolean
  multiline?: boolean
  numberOfLines?: number
  maxLength?: number
  required?: boolean
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry: initialSecure,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  required = false,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isSecure, setIsSecure] = useState(initialSecure)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)
  const toggleSecure = () => setIsSecure(!isSecure)

  const getBorderColor = () => {
    if (error) return '#EF4444'
    if (isFocused) return '#10B981'
    return '#E5E7EB'
  }

  const getLabelColor = () => {
    if (error) return '#EF4444'
    if (isFocused) return '#10B981'
    return '#374151'
  }

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, { color: getLabelColor() }]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: getBorderColor() },
          disabled && styles.disabled,
        ]}
      >
        {/* Left Icon */}
        {icon && (
          <View style={styles.iconLeft}>
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? '#10B981' : '#9CA3AF'}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            (rightIcon || initialSecure) && styles.inputWithRightIcon,
            multiline && styles.multiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          accessibilityLabel={label}
          accessibilityHint={hint}
        />

        {/* Right Icon / Password Toggle */}
        {initialSecure ? (
          <Pressable onPress={toggleSecure} style={styles.iconRight} hitSlop={8}>
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.iconRight}
            hitSlop={8}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Hint */}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}

      {/* Character Count */}
      {maxLength && (
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  iconLeft: {
    paddingLeft: 14,
  },
  iconRight: {
    paddingRight: 14,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputWithLeftIcon: {
    paddingLeft: 10,
  },
  inputWithRightIcon: {
    paddingRight: 10,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
})

export default Input
