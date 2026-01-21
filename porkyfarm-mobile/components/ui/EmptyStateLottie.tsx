/**
 * EmptyStateLottie - État vide avec animations Lottie
 * ====================================================
 * Version améliorée avec support Lottie et fallbacks
 */

import React from 'react'
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Image, ImageSourcePropType } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { colors, spacing, typography, radius } from '../../lib/designTokens'

// Import Lottie conditionnel
let LottieView: any = null
try {
  LottieView = require('lottie-react-native').default
} catch {
  // Lottie non disponible
}

export type EmptyStateType =
  | 'cheptel'
  | 'feed'
  | 'tasks'
  | 'health'
  | 'reproduction'
  | 'costs'
  | 'search'
  | 'error'
  | 'offline'
  | 'success'

// Configuration des types avec animations
const TYPE_CONFIG: Record<EmptyStateType, {
  emoji: string
  color: string
  defaultTitle: string
  defaultDescription: string
}> = {
  cheptel: {
    emoji: '🐷',
    color: '#EC4899',
    defaultTitle: 'Aucun animal',
    defaultDescription: 'Ajoutez votre premier animal pour commencer',
  },
  feed: {
    emoji: '🌾',
    color: '#F59E0B',
    defaultTitle: 'Stock vide',
    defaultDescription: 'Ajoutez vos stocks d\'aliments',
  },
  tasks: {
    emoji: '✅',
    color: '#10B981',
    defaultTitle: 'Aucune tâche',
    defaultDescription: 'Toutes vos tâches sont terminées !',
  },
  health: {
    emoji: '🩺',
    color: '#EF4444',
    defaultTitle: 'Aucun cas de santé',
    defaultDescription: 'Vos animaux sont en bonne santé',
  },
  reproduction: {
    emoji: '🍼',
    color: '#8B5CF6',
    defaultTitle: 'Aucune gestation',
    defaultDescription: 'Enregistrez vos saillies et gestations',
  },
  costs: {
    emoji: '💰',
    color: '#3B82F6',
    defaultTitle: 'Aucune transaction',
    defaultDescription: 'Commencez à suivre vos coûts et revenus',
  },
  search: {
    emoji: '🔍',
    color: '#6B7280',
    defaultTitle: 'Aucun résultat',
    defaultDescription: 'Essayez avec d\'autres termes de recherche',
  },
  error: {
    emoji: '⚠️',
    color: '#F59E0B',
    defaultTitle: 'Erreur',
    defaultDescription: 'Une erreur est survenue',
  },
  offline: {
    emoji: '📡',
    color: '#6B7280',
    defaultTitle: 'Hors ligne',
    defaultDescription: 'Vérifiez votre connexion internet',
  },
  success: {
    emoji: '🎉',
    color: '#10B981',
    defaultTitle: 'Terminé !',
    defaultDescription: 'Opération réussie',
  },
}

export interface EmptyStateLottieProps {
  /** Type prédéfini pour configuration automatique */
  type?: EmptyStateType
  /** Animation Lottie source (optionnel) */
  animationSource?: any
  /** Image statique (fallback) */
  image?: ImageSourcePropType
  /** Emoji personnalisé */
  emoji?: string
  /** Icône Ionicons */
  icon?: keyof typeof Ionicons.glyphMap
  /** Titre */
  title?: string
  /** Description */
  description?: string
  /** Couleur d'accent */
  accentColor?: string
  /** Label du bouton d'action */
  actionLabel?: string
  /** Callback d'action */
  onAction?: () => void
  /** Label du bouton secondaire */
  secondaryLabel?: string
  /** Callback secondaire */
  onSecondary?: () => void
  /** Taille de l'animation/image */
  size?: number
  /** Style personnalisé */
  style?: ViewStyle
  /** Mode compact */
  compact?: boolean
  /** Enfants additionnels */
  children?: React.ReactNode
}

export function EmptyStateLottie({
  type,
  animationSource,
  image,
  emoji,
  icon,
  title,
  description,
  accentColor,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  size = 160,
  style,
  compact = false,
  children,
}: EmptyStateLottieProps) {
  const { colors: themeColors, isDark } = useTheme()

  // Récupérer la config du type si spécifié
  const config = type ? TYPE_CONFIG[type] : null
  const finalEmoji = emoji || config?.emoji
  const finalColor = accentColor || config?.color || colors.primary
  const finalTitle = title || config?.defaultTitle || 'État vide'
  const finalDescription = description || config?.defaultDescription

  // Rendu de l'élément visuel principal
  const renderVisual = () => {
    // Priorité: Animation Lottie > Image > Emoji > Icône
    if (LottieView && animationSource) {
      return (
        <LottieView
          source={animationSource}
          style={{ width: size, height: size }}
          autoPlay
          loop
        />
      )
    }

    if (image) {
      return (
        <Image
          source={image}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      )
    }

    if (finalEmoji) {
      return (
        <View style={[
          styles.emojiContainer,
          {
            width: compact ? 60 : 100,
            height: compact ? 60 : 100,
            backgroundColor: finalColor + '15',
          }
        ]}>
          <Text style={[styles.emoji, { fontSize: compact ? 32 : 48 }]}>
            {finalEmoji}
          </Text>
        </View>
      )
    }

    return (
      <View style={[
        styles.iconContainer,
        {
          width: compact ? 60 : 80,
          height: compact ? 60 : 80,
          backgroundColor: isDark ? themeColors.surface : '#F3F4F6',
        }
      ]}>
        <Ionicons
          name={icon || 'file-tray-outline'}
          size={compact ? 28 : 40}
          color={themeColors.textSecondary}
        />
      </View>
    )
  }

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: themeColors.surface }, style]}>
        {renderVisual()}
        <View style={styles.compactText}>
          <Text style={[styles.compactTitle, { color: themeColors.text }]}>
            {finalTitle}
          </Text>
          {finalDescription && (
            <Text style={[styles.compactDescription, { color: themeColors.textSecondary }]}>
              {finalDescription}
            </Text>
          )}
        </View>
        {actionLabel && onAction && (
          <TouchableOpacity
            onPress={onAction}
            style={[styles.compactAction, { backgroundColor: finalColor }]}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      {renderVisual()}

      <Text style={[styles.title, { color: themeColors.text }]}>
        {finalTitle}
      </Text>

      {finalDescription && (
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          {finalDescription}
        </Text>
      )}

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: finalColor }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}

      {secondaryLabel && onSecondary && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onSecondary}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryButtonText, { color: finalColor }]}>
            {secondaryLabel}
          </Text>
        </TouchableOpacity>
      )}

      {children}
    </View>
  )
}

// Composant pour états de recherche vide
export function SearchEmptyState({
  query,
  onClear,
  ...props
}: Omit<EmptyStateLottieProps, 'type'> & { query?: string; onClear?: () => void }) {
  return (
    <EmptyStateLottie
      type="search"
      title={query ? `Aucun résultat pour "${query}"` : 'Aucun résultat'}
      description="Essayez avec d'autres termes de recherche"
      actionLabel={onClear ? 'Effacer la recherche' : undefined}
      onAction={onClear}
      {...props}
    />
  )
}

// Composant pour états offline
export function OfflineState({
  onRetry,
  ...props
}: Omit<EmptyStateLottieProps, 'type'> & { onRetry?: () => void }) {
  return (
    <EmptyStateLottie
      type="offline"
      actionLabel={onRetry ? 'Réessayer' : undefined}
      onAction={onRetry}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emojiContainer: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    textAlign: 'center',
  },
  iconContainer: {
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryButton: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    margin: spacing.md,
    gap: spacing.md,
  },
  compactText: {
    flex: 1,
  },
  compactTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  compactDescription: {
    fontSize: typography.fontSize.bodySmall,
    marginTop: 2,
  },
  compactAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default EmptyStateLottie
