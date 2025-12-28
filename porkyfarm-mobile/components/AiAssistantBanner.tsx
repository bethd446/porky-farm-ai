/**
 * Bannière Assistant IA avec gradient violet
 * Style UX Pilot
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Brain, ChevronRight } from 'lucide-react-native'
import { colors, spacing, typography, radius, shadows } from '../lib/designTokens'

interface AiAssistantBannerProps {
  onPress?: () => void
}

export function AiAssistantBanner({ onPress }: AiAssistantBannerProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#8b5cf6', '#a78bfa', '#c4b5fd']} // Violet gradient (UX Pilot style)
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Brain size={24} color="#ffffff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Assistant IA</Text>
            <Text style={styles.subtitle}>Posez vos questions</Text>
          </View>
          <ChevronRight size={20} color="#ffffff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.base,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    padding: spacing.base,
    borderRadius: radius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSize.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
  },
})

