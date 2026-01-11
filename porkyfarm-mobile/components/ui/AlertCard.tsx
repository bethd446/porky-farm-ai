/**
 * AlertCard - Card d'alerte avec animation pulse
 * ==============================================
 * Pour alertes critiques: gestations, sante, taches urgentes
 */

import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { spacing, radius, typography, shadows, colors as tokenColors } from '../../lib/theme/tokens'

type AlertLevel = 'critical' | 'warning' | 'info'

interface AlertCardProps {
  level: AlertLevel
  title: string
  message: string
  count?: number
  icon?: keyof typeof Ionicons.glyphMap
  onPress?: () => void
  /** Animation pulse pour critical */
  pulse?: boolean
}

const levelConfig = {
  critical: {
    bgColor: tokenColors.status.errorLight,
    borderColor: tokenColors.status.error,
    iconColor: tokenColors.status.error,
    defaultIcon: 'alert-circle' as const,
  },
  warning: {
    bgColor: tokenColors.status.warningLight,
    borderColor: tokenColors.status.warning,
    iconColor: tokenColors.status.warning,
    defaultIcon: 'warning' as const,
  },
  info: {
    bgColor: tokenColors.status.infoLight,
    borderColor: tokenColors.status.info,
    iconColor: tokenColors.status.info,
    defaultIcon: 'information-circle' as const,
  },
}

export function AlertCard({
  level,
  title,
  message,
  count,
  icon,
  onPress,
  pulse = level === 'critical',
}: AlertCardProps) {
  const { colors, isDark } = useTheme()
  const pulseAnim = useRef(new Animated.Value(1)).current
  const config = levelConfig[level]

  useEffect(() => {
    if (pulse) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
      animation.start()
      return () => animation.stop()
    }
  }, [pulse, pulseAnim])

  const cardStyle = {
    backgroundColor: isDark ? config.bgColor + '20' : config.bgColor,
    borderLeftColor: config.borderColor,
  }

  const content = (
    <Animated.View
      style={[
        styles.container,
        cardStyle,
        { transform: [{ scale: pulse ? pulseAnim : 1 }] },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.borderColor + '20' }]}>
        <Ionicons
          name={icon || config.defaultIcon}
          size={24}
          color={config.iconColor}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {count !== undefined && (
            <View style={[styles.countBadge, { backgroundColor: config.borderColor }]}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textMuted}
          style={styles.chevron}
        />
      )}
    </Animated.View>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    )
  }

  return content
}

// ===================================================================
// AlertCardCompact - Version compacte pour listes
// ===================================================================

interface AlertCardCompactProps {
  level: AlertLevel
  text: string
  onPress?: () => void
}

export function AlertCardCompact({ level, text, onPress }: AlertCardCompactProps) {
  const { colors } = useTheme()
  const config = levelConfig[level]

  const content = (
    <View style={[styles.compact, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.defaultIcon} size={16} color={config.iconColor} />
      <Text style={[styles.compactText, { color: colors.text }]} numberOfLines={1}>
        {text}
      </Text>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </View>
  )

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>
  }
  return content
}

// ===================================================================
// AlertBanner - Banniere pleine largeur
// ===================================================================

interface AlertBannerProps {
  level: AlertLevel
  message: string
  action?: { label: string; onPress: () => void }
  onDismiss?: () => void
}

export function AlertBanner({ level, message, action, onDismiss }: AlertBannerProps) {
  const config = levelConfig[level]

  return (
    <View style={[styles.banner, { backgroundColor: config.borderColor }]}>
      <Ionicons name={config.defaultIcon} size={20} color="#FFFFFF" />
      <Text style={styles.bannerText} numberOfLines={2}>
        {message}
      </Text>
      {action && (
        <Pressable onPress={action.onPress} style={styles.bannerAction}>
          <Text style={styles.bannerActionText}>{action.label}</Text>
        </Pressable>
      )}
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.bannerDismiss}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  )
}

// ===================================================================
// STYLES
// ===================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  message: {
    fontSize: typography.fontSize.md,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  // Compact
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  compactText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  bannerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  bannerAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.sm,
  },
  bannerActionText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  bannerDismiss: {
    padding: spacing.xs,
  },
})

export default AlertCard
