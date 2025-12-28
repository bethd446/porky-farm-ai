/**
 * Composant EmptyState réutilisable (React Native)
 * Pour afficher un état vide avec illustration, texte et CTA
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, typography, radius } from '../lib/designTokens'

interface EmptyStateProps {
  emoji?: string
  icon?: string // Nom d'icône Lucide (à implémenter si nécessaire)
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Illustration */}
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}

      {/* Titre */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      <Text style={styles.description}>{description}</Text>

      {/* CTA */}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.xl,
    opacity: 0.5,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: typography.fontSize.body * typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
  },
})

