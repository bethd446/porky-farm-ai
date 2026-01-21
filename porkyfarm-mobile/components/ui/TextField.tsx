import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native'
import { colors, spacing, typography, radius } from '../../lib/designTokens'

interface TextFieldProps extends TextInputProps {
  label?: string
  error?: string | null
  helperText?: string
  containerStyle?: ViewStyle
}

export function TextField({
  label,
  error,
  helperText,
  containerStyle,
  style,
  ...textInputProps
}: TextFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          textInputProps.multiline && styles.inputMultiline,
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        {...textInputProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.base,
    fontSize: typography.fontSize.body,
    backgroundColor: colors.card,
    color: colors.foreground,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
})

