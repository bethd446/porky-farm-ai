/**
 * Étape 3 : Races principales
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { colors, spacing, typography, radius } from '../../lib/designTokens'
import { elevation } from '../../lib/design/elevation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native'

const BREEDS = ['Large White', 'Landrace', 'Pietrain', 'Duroc', 'Autre']

export default function OnboardingStep3Screen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])

  const toggleBreed = (breed: string) => {
    if (selectedBreeds.includes(breed)) {
      setSelectedBreeds(selectedBreeds.filter((b) => b !== breed))
    } else {
      setSelectedBreeds([...selectedBreeds, breed])
    }
  }

  const handleNext = () => {
    if (selectedBreeds.length === 0) {
      setSelectedBreeds(['Large White']) // Valeur par défaut
    }

    router.push({
      pathname: '/onboarding/step4',
      params: {
        ...params,
        breeds: selectedBreeds.length > 0 ? selectedBreeds.join(',') : 'Large White',
      },
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Étape 3 sur 6</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Quelles races avez-vous principalement ?</Text>
        <Text style={styles.hint}>Sélectionnez une ou plusieurs races</Text>

        <View style={styles.breedsList}>
          {BREEDS.map((breed) => {
            const isSelected = selectedBreeds.includes(breed)
            return (
              <TouchableOpacity
                key={breed}
                style={[styles.breedCard, isSelected && styles.breedCardSelected]}
                onPress={() => toggleBreed(breed)}
                activeOpacity={0.7}
              >
                <Text style={[styles.breedText, isSelected && styles.breedTextSelected]}>
                  {breed}
                </Text>
                {isSelected && <Check size={20} color="#ffffff" />}
              </TouchableOpacity>
            )
          })}
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
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
  },
  breedsList: {
    gap: spacing.base,
  },
  breedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...elevation.sm,
  },
  breedCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  breedText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  breedTextSelected: {
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
    ...elevation.md,
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
  },
})

