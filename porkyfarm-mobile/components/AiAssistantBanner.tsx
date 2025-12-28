/**
 * Bannière Assistant IA avec gradient violet premium
 * Style UX Pilot + Ultra Design (glass, ombres, animations)
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Brain, ChevronRight } from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../lib/designTokens'
import { premiumGradients, premiumShadows, premiumGlass, premiumStyles } from '../lib/premiumStyles'
import { useEffect, useRef } from 'react'

interface AiAssistantBannerProps {
  onPress?: () => void
  premium?: boolean
}

export function AiAssistantBanner({ onPress, premium = true }: AiAssistantBannerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (premium) {
      // Animation pulse subtile sur l'icône
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    }
  }, [premium, pulseAnim])

  return (
    <TouchableOpacity
      style={[styles.container, premium && styles.containerPremium]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={premiumGradients.ai.purple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              premium && styles.iconContainerPremium,
              premium && { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Brain size={24} color="#ffffff" />
          </Animated.View>
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
  },
  containerPremium: {
    ...premiumShadows.card.medium,
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
  iconContainerPremium: {
    ...premiumGlass.light,
    ...premiumShadows.icon.soft,
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

