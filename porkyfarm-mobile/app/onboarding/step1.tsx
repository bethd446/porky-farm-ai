/**
 * Etape 1 : Nombre total de porcs
 * Onboarding avec progression visuelle et animations
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../contexts/ThemeContext'
import { ProgressBar, StepIndicator } from '../../components/ui'
import { ScalePress } from '../../components/animations'
import { spacing, typography, radius, shadows } from '../../lib/designTokens'
import { ArrowLeft, ArrowRight, PiggyBank } from 'lucide-react-native'
import { useOnboardingState } from '../../lib/onboarding/hooks/useOnboardingState'

const TOTAL_STEPS = 6
const CURRENT_STEP = 1

export default function OnboardingStep1Screen() {
  const router = useRouter()
  const { colors: themeColors } = useTheme()
  const { markStep, cachedData } = useOnboardingState()
  const [totalPigs, setTotalPigs] = useState('')
  const [saving, setSaving] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (cachedData && typeof cachedData === 'object' && 'totalPigs' in cachedData) {
      setTotalPigs(String((cachedData as any).totalPigs || ''))
    }
  }, [cachedData])

  const handleNext = async () => {
    const count = parseInt(totalPigs, 10)
    if (count <= 0) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSaving(true)

    try {
      const { error } = await markStep('step1', { totalPigs: count })
      if (error) {
        console.warn('[Step1] Failed to save step:', error.message)
      }

      router.push({
        pathname: '/onboarding/step2',
        params: { totalPigs: count.toString() },
      })
    } catch (err) {
      console.error('[Step1] Error:', err)
      router.push({
        pathname: '/onboarding/step2',
        params: { totalPigs: count.toString() },
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  const isValid = totalPigs && parseInt(totalPigs, 10) > 0

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header avec progression */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <ScalePress onPress={handleBack}>
            <View style={[styles.backButton, { backgroundColor: themeColors.surface }]}>
              <ArrowLeft size={22} color={themeColors.text} />
            </View>
          </ScalePress>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={CURRENT_STEP / TOTAL_STEPS}
              height={4}
              variant="gradient"
              style={styles.progressBar}
            />
            <Text style={[styles.stepText, { color: themeColors.textMuted }]}>
              Etape {CURRENT_STEP} sur {TOTAL_STEPS}
            </Text>
          </View>
        </Animated.View>

        {/* Contenu */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icone */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: themeColors.primarySurface }]}>
              <PiggyBank size={40} color={themeColors.primary} />
            </View>
          </Animated.View>

          {/* Question */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.questionContainer}>
            <Text style={[styles.question, { color: themeColors.text }]}>
              Combien de porcs avez-vous ?
            </Text>
            <Text style={[styles.hint, { color: themeColors.textSecondary }]}>
              Indiquez le nombre total de porcs dans votre elevage
            </Text>
          </Animated.View>

          {/* Input */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.inputSection}>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: themeColors.surface, borderColor: isFocused ? themeColors.primary : themeColors.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={totalPigs}
                onChangeText={setTotalPigs}
                placeholder="0"
                placeholderTextColor={themeColors.textMuted}
                keyboardType="numeric"
                autoFocus
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={5}
              />
              <Text style={[styles.inputSuffix, { color: themeColors.textSecondary }]}>
                porcs
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer avec bouton */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.footer}>
          <Pressable
            onPress={handleNext}
            disabled={!isValid || saving}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: themeColors.primary },
              (!isValid || saving) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Sauvegarde...' : 'Continuer'}
            </Text>
            {!saving && <ArrowRight size={20} color="#FFFFFF" />}
          </Pressable>

          {/* Step indicator dots */}
          <StepIndicator
            totalSteps={TOTAL_STEPS}
            currentStep={CURRENT_STEP - 1}
            style={styles.stepIndicator}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    marginBottom: spacing.xs,
  },
  stepText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionContainer: {
    marginBottom: spacing.xl,
  },
  question: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    minWidth: 200,
  },
  input: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    minWidth: 80,
    padding: 0,
  },
  inputSuffix: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    gap: spacing.sm,
    minHeight: 56,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  stepIndicator: {
    marginTop: spacing.lg,
  },
})
