/**
 * Étape 6 : Objectif principal + Résumé + Finalisation
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { ArrowLeft, CheckCircle } from 'lucide-react-native'
import { onboardingService } from '../../services/onboarding'

const GOALS = [
  { value: 'health', label: 'Suivi santé' },
  { value: 'reproduction', label: 'Reproduction & mises-bas' },
  { value: 'costs', label: 'Coûts & alimentation' },
  { value: 'all', label: 'Tout en même temps' },
]

export default function OnboardingStep6Screen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [mainGoal, setMainGoal] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Préparer les données d'onboarding
      const onboardingData = {
        totalPigs: parseInt(params.totalPigs as string, 10),
        sows: parseInt(params.sows as string, 10) || 0,
        boars: parseInt(params.boars as string, 10) || 0,
        fattening: parseInt(params.fattening as string, 10) || 0,
        piglets: parseInt(params.piglets as string, 10) || 0,
        breeds: (params.breeds as string)?.split(',') || ['Large White'],
        feedingFrequency: (params.feedingFrequency as 'twice' | 'thrice') || 'twice',
        rationSows: parseFloat(params.rationSows as string) || 2.5,
        rationLactating: parseFloat(params.rationLactating as string) || 3.5,
        rationFattening: parseFloat(params.rationFattening as string) || 3,
        rationPiglets: parseFloat(params.rationPiglets as string) || 0.5,
        surface: params.surface ? parseInt(params.surface as string, 10) : undefined,
        buildingType: (params.buildingType as any) || undefined,
        mainGoal: mainGoal as any,
      }

      // Compléter l'onboarding (crée animaux + tâches)
      const { error } = await onboardingService.completeOnboarding(onboardingData)

      if (error) {
        Alert.alert('Erreur', `Impossible de finaliser la configuration: ${error.message}`)
        setLoading(false)
        return
      }

      // Rediriger vers le dashboard
      router.replace('/(tabs)')
    } catch (err: any) {
      console.error('Error completing onboarding:', err)
      Alert.alert('Erreur', 'Une erreur est survenue lors de la finalisation')
      setLoading(false)
    }
  }

  const summary = {
    totalPigs: parseInt(params.totalPigs as string, 10),
    sows: parseInt(params.sows as string, 10) || 0,
    boars: parseInt(params.boars as string, 10) || 0,
    fattening: parseInt(params.fattening as string, 10) || 0,
    piglets: parseInt(params.piglets as string, 10) || 0,
    feedingFrequency: (params.feedingFrequency as 'twice' | 'thrice') || 'twice',
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Étape 6 sur 6</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Votre priorité avec PorkyFarm</Text>

        <View style={styles.goalsList}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[styles.goalCard, mainGoal === goal.value && styles.goalCardSelected]}
              onPress={() => setMainGoal(goal.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.goalText, mainGoal === goal.value && styles.goalTextSelected]}>
                {goal.label}
              </Text>
              {mainGoal === goal.value && <CheckCircle size={20} color="#ffffff" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Résumé */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé de votre configuration</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total porcs :</Text>
            <Text style={styles.summaryValue}>{summary.totalPigs}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Truies :</Text>
            <Text style={styles.summaryValue}>{summary.sows}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Verrats :</Text>
            <Text style={styles.summaryValue}>{summary.boars}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Porcs d'engraissement :</Text>
            <Text style={styles.summaryValue}>{summary.fattening}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Porcelets :</Text>
            <Text style={styles.summaryValue}>{summary.piglets}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Alimentation :</Text>
            <Text style={styles.summaryValue}>
              {summary.feedingFrequency === 'twice' ? '2 fois/jour' : '3 fois/jour'}
            </Text>
          </View>
        </View>

        <Text style={styles.note}>
          ✓ {summary.totalPigs} animaux seront créés automatiquement{'\n'}
          ✓ Votre routine d'alimentation sera configurée{'\n'}
          ✓ Une to-do liste quotidienne sera générée
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.buttonText}>Configuration en cours...</Text>
            </>
          ) : (
            <>
              <Text style={styles.buttonText}>Terminer et aller à l'Accueil</Text>
              <CheckCircle size={20} color="#ffffff" />
            </>
          )}
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
  goalsList: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  goalCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  goalText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  goalTextSelected: {
    color: '#ffffff',
  },
  summaryCard: {
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.base,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  summaryValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  note: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    lineHeight: 20,
    fontStyle: 'italic',
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
    opacity: 0.7,
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
  },
})

