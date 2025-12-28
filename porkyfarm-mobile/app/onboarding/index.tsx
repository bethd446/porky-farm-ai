/**
 * Écran d'accueil de l'onboarding
 * Présente le wizard et démarre le flux
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { PiggyBank, ArrowRight } from 'lucide-react-native'

export default function OnboardingWelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <PiggyBank size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Bienvenue sur PorkyFarm</Text>
        <Text style={styles.subtitle}>Configurons votre ferme en 1 minute</Text>

        <View style={styles.benefits}>
          <Text style={styles.benefitText}>✓ Création automatique de votre cheptel</Text>
          <Text style={styles.benefitText}>✓ Configuration de la routine d'alimentation</Text>
          <Text style={styles.benefitText}>✓ To-do liste quotidienne personnalisée</Text>
          <Text style={styles.benefitText}>✓ Prêt à utiliser immédiatement</Text>
        </View>

        <Text style={styles.note}>Vous pourrez modifier tout cela plus tard depuis les paramètres</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/step1')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Commencer</Text>
          <ArrowRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  benefits: {
    width: '100%',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  benefitText: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
    marginBottom: spacing.sm,
    paddingLeft: spacing.base,
  },
  note: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    paddingBottom: spacing.xl,
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

