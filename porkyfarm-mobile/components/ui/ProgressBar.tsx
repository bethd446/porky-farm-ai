/**
 * ProgressBar Component - Indicateur de progression
 * ==================================================
 */

import { View, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radius, gradients } from '../../lib/designTokens'

interface ProgressBarProps {
  progress: number // 0 to 1
  height?: number
  animated?: boolean
  showGlow?: boolean
  variant?: 'default' | 'gradient' | 'success'
  style?: ViewStyle
}

export function ProgressBar({
  progress,
  height = 6,
  animated = true,
  showGlow = true,
  variant = 'default',
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)

  const animatedStyle = useAnimatedStyle(() => {
    const width = animated
      ? withSpring(clampedProgress * 100, { damping: 20, stiffness: 100 })
      : clampedProgress * 100

    return {
      width: `${width}%`,
    }
  }, [clampedProgress, animated])

  const getBarColor = () => {
    switch (variant) {
      case 'success':
        return colors.success
      case 'gradient':
        return colors.primary
      default:
        return colors.primary
    }
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]} />

      <Animated.View
        style={[
          styles.bar,
          { height, borderRadius: height / 2 },
          animatedStyle,
        ]}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={
              (gradients?.primary && Array.isArray(gradients.primary) && gradients.primary.length >= 2)
                ? gradients.primary
                : ['#10B981', '#059669'] // Valeur par défaut sécurisée
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientBar, { borderRadius: height / 2 }]}
          />
        ) : (
          <View
            style={[
              styles.solidBar,
              { backgroundColor: getBarColor(), borderRadius: height / 2 },
            ]}
          />
        )}

        {showGlow && clampedProgress > 0 && (
          <View
            style={[
              styles.glow,
              {
                backgroundColor: getBarColor(),
                height: height * 2,
                width: height * 2,
                borderRadius: height,
                right: -height / 2,
                top: -height / 2,
              },
            ]}
          />
        )}
      </Animated.View>
    </View>
  )
}

// Indicateur de progression par etapes (dots)
interface StepIndicatorProps {
  totalSteps: number
  currentStep: number
  style?: ViewStyle
}

export function StepIndicator({
  totalSteps,
  currentStep,
  style,
}: StepIndicatorProps) {
  return (
    <View style={[styles.stepsContainer, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepDot,
                isCompleted && styles.stepDotCompleted,
                isCurrent && styles.stepDotCurrent,
              ]}
            />
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted,
                ]}
              />
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    width: '100%',
    backgroundColor: colors.border,
  },
  bar: {
    position: 'absolute',
    overflow: 'hidden',
  },
  gradientBar: {
    flex: 1,
  },
  solidBar: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    opacity: 0.4,
  },
  // Step Indicator
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  stepDotCompleted: {
    backgroundColor: colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: colors.primary,
  },
})
