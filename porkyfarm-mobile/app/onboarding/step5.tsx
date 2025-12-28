/**
 * Étape 5 : Superficie & type de bâtiment (optionnel)
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'

export default function OnboardingStep5Screen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [surface, setSurface] = useState('')
  const [buildingType, setBuildingType] = useState<'closed' | 'semi_open' | 'outdoor' | ''>('')

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/step6',
      params: {
        ...params,
        surface: surface || '',
        buildingType: buildingType || '',
      },
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Étape 5 sur 6</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Superficie & type de bâtiment</Text>
        <Text style={styles.hint}>(Optionnel - vous pouvez passer cette étape)</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Superficie approximative</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={surface}
              onChangeText={setSurface}
              placeholder="Ex : 500"
              keyboardType="numeric"
            />
            <Text style={styles.inputLabel}>m²</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'élevage</Text>
          <View style={styles.optionsList}>
            {[
              { value: 'closed', label: 'Bâtiment fermé' },
              { value: 'semi_open', label: 'Semi-ouvert' },
              { value: 'outdoor', label: 'Plein air' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  buildingType === option.value && styles.optionCardSelected,
                ]}
                onPress={() => setBuildingType(option.value as any)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    buildingType === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
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
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.base,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.base,
    fontSize: typography.fontSize.body,
    backgroundColor: colors.card,
  },
  inputLabel: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  optionsList: {
    gap: spacing.base,
  },
  optionCard: {
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  optionCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  optionTextSelected: {
    color: '#ffffff',
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
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
  },
})

