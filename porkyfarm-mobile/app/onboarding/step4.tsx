/**
 * Étape 4 : Habitudes d'alimentation
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'

export default function OnboardingStep4Screen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [feedingFrequency, setFeedingFrequency] = useState<'twice' | 'thrice'>('twice')
  const [rationSows, setRationSows] = useState('2.5')
  const [rationLactating, setRationLactating] = useState('3.5')
  const [rationFattening, setRationFattening] = useState('3')
  const [rationPiglets, setRationPiglets] = useState('0.5')

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/step5',
      params: {
        ...params,
        feedingFrequency,
        rationSows,
        rationLactating,
        rationFattening,
        rationPiglets,
      },
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Étape 4 sur 6</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Habitudes d'alimentation</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fréquence d'alimentation</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                feedingFrequency === 'twice' && styles.optionCardSelected,
              ]}
              onPress={() => setFeedingFrequency('twice')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  feedingFrequency === 'twice' && styles.optionTextSelected,
                ]}
              >
                Matin et soir
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionCard,
                feedingFrequency === 'thrice' && styles.optionCardSelected,
              ]}
              onPress={() => setFeedingFrequency('thrice')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  feedingFrequency === 'thrice' && styles.optionTextSelected,
                ]}
              >
                Matin, midi et soir
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ration quotidienne par sujet (kg/jour)</Text>

          <View style={styles.rationRow}>
            <Text style={styles.rationLabel}>Truies gestantes</Text>
            <TextInput
              style={styles.rationInput}
              value={rationSows}
              onChangeText={setRationSows}
              placeholder="2.5"
              keyboardType="decimal-pad"
            />
            <Text style={styles.rationUnit}>kg</Text>
          </View>

          <View style={styles.rationRow}>
            <Text style={styles.rationLabel}>Truies en lactation</Text>
            <TextInput
              style={styles.rationInput}
              value={rationLactating}
              onChangeText={setRationLactating}
              placeholder="3.5"
              keyboardType="decimal-pad"
            />
            <Text style={styles.rationUnit}>kg</Text>
          </View>

          <View style={styles.rationRow}>
            <Text style={styles.rationLabel}>Porcs d'engraissement</Text>
            <TextInput
              style={styles.rationInput}
              value={rationFattening}
              onChangeText={setRationFattening}
              placeholder="3"
              keyboardType="decimal-pad"
            />
            <Text style={styles.rationUnit}>kg</Text>
          </View>

          <View style={styles.rationRow}>
            <Text style={styles.rationLabel}>Porcelets</Text>
            <TextInput
              style={styles.rationInput}
              value={rationPiglets}
              onChangeText={setRationPiglets}
              placeholder="0.5"
              keyboardType="decimal-pad"
            />
            <Text style={styles.rationUnit}>kg</Text>
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
    marginBottom: spacing.lg,
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
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  optionCard: {
    flex: 1,
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
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
  rationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rationLabel: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
    flex: 1,
  },
  rationInput: {
    width: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  rationUnit: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    marginLeft: spacing.sm,
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

