/**
 * Étape 1 : Nombre total de porcs
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'

export default function OnboardingStep1Screen() {
  const router = useRouter()
  const [totalPigs, setTotalPigs] = useState('')

  const handleNext = () => {
    const count = parseInt(totalPigs, 10)
    if (count > 0) {
      router.push({
        pathname: '/onboarding/step2',
        params: { totalPigs: count.toString() },
      })
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Étape 1 sur 6</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Combien de porcs avez-vous actuellement dans la ferme ?</Text>
        <Text style={styles.hint}>Ex : 10 porcs</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={totalPigs}
            onChangeText={setTotalPigs}
            placeholder="0"
            keyboardType="numeric"
            autoFocus
          />
          <Text style={styles.inputLabel}>porcs</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !totalPigs || parseInt(totalPigs, 10) <= 0 ? styles.buttonDisabled : null]}
          onPress={handleNext}
          disabled={!totalPigs || parseInt(totalPigs, 10) <= 0}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Suivant</Text>
          <ArrowRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.base,
  },
  stepIndicator: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    fontWeight: typography.fontWeight.medium,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.base,
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    textAlign: 'center',
    backgroundColor: colors.card,
  },
  inputLabel: {
    fontSize: typography.fontSize.h3,
    color: colors.mutedForeground,
  },
  footer: {
    paddingTop: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  buttonDisabled: {
    backgroundColor: colors.mutedForeground,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
  },
})

