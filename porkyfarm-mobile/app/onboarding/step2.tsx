/**
 * Étape 2 : Répartition par catégorie
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'

export default function OnboardingStep2Screen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const totalPigs = parseInt(params.totalPigs as string, 10) || 0

  const [sows, setSows] = useState('')
  const [boars, setBoars] = useState('')
  const [fattening, setFattening] = useState('')
  const [piglets, setPiglets] = useState('')

  const calculateTotal = () => {
    return (
      (parseInt(sows, 10) || 0) +
      (parseInt(boars, 10) || 0) +
      (parseInt(fattening, 10) || 0) +
      (parseInt(piglets, 10) || 0)
    )
  }

  const handleNext = () => {
    const sum = calculateTotal()
    if (sum === 0) {
      Alert.alert('Erreur', 'Veuillez renseigner au moins une catégorie')
      return
    }
    if (sum > totalPigs) {
      Alert.alert('Attention', `La somme (${sum}) dépasse le total déclaré (${totalPigs}). Voulez-vous continuer ?`)
      return
    }

    router.push({
      pathname: '/onboarding/step3',
      params: {
        totalPigs: totalPigs.toString(),
        sows: sows || '0',
        boars: boars || '0',
        fattening: fattening || '0',
        piglets: piglets || '0',
      },
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Étape 2 sur 6</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Sur ces {totalPigs} porcs, combien sont :</Text>

        <View style={styles.categories}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Truies</Text>
            <TextInput
              style={styles.categoryInput}
              value={sows}
              onChangeText={setSows}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Verrats</Text>
            <TextInput
              style={styles.categoryInput}
              value={boars}
              onChangeText={setBoars}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Porcs d'engraissement</Text>
            <TextInput
              style={styles.categoryInput}
              value={fattening}
              onChangeText={setFattening}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Porcelets</Text>
            <TextInput
              style={styles.categoryInput}
              value={piglets}
              onChangeText={setPiglets}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total saisi :</Text>
          <Text style={styles.summaryValue}>{calculateTotal()} / {totalPigs}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, calculateTotal() === 0 ? styles.buttonDisabled : null]}
          onPress={handleNext}
          disabled={calculateTotal() === 0}
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
    marginBottom: spacing.xl,
  },
  categories: {
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  categoryLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
    flex: 1,
  },
  categoryInput: {
    width: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    marginTop: spacing.base,
  },
  summaryLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  summaryValue: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
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

