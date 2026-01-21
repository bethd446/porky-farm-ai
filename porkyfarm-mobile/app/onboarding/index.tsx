/**
 * Écran d'accueil de l'onboarding
 * Présente le wizard et démarre le flux
 */

import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, typography, radius } from '../../lib/designTokens'
import { logger } from '../../lib/logger'
import { elevation } from '../../lib/design/elevation'
import { PiggyBank, ArrowRight, ArrowLeft } from 'lucide-react-native'
import { HerdSizeStep } from './steps/HerdSizeStep'
import { BreedsStep } from './steps/BreedsStep'
import { BreedingStructureStep } from './steps/BreedingStructureStep'
import { FarmSizeStep } from './steps/FarmSizeStep'
import { useOnboardingState } from '../../lib/onboarding/hooks/useOnboardingState'
import { useToast } from '../../hooks/useToast'
import { PrimaryButton, SecondaryButton } from '../../components/ui'
import { Wording } from '../../lib/constants/wording'

// Types pour les steps
type OnboardingStep = 'welcome' | 'herd' | 'breeds' | 'breeding' | 'farm'

// Données collectées pendant l'onboarding
interface OnboardingData {
  totalAnimals?: number
  breeds?: string[]
  breedingStructure?: {
    sows?: number
    boars?: number
    piglets?: number
  }
  farmSize?: number
}

interface OnboardingWelcomeScreenProps {
  onComplete?: () => void | Promise<void>
}

export default function OnboardingWelcomeScreen({ onComplete }: OnboardingWelcomeScreenProps = {}) {
  const router = useRouter()
  const { complete, markStep } = useOnboardingState()
  const { showToast } = useToast()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [completing, setCompleting] = useState(false)

  // Mettre à jour les données collectées
  const handleDataChange = useCallback((step: OnboardingStep, data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }, [])

  // Navigation entre les steps
  const handleNext = async () => {
    const steps: OnboardingStep[] = ['welcome', 'herd', 'breeds', 'breeding', 'farm']
    const currentIndex = steps.indexOf(currentStep)
    
    if (currentIndex < steps.length - 1) {
      // Sauvegarder l'étape actuelle avant de passer à la suivante
      const nextStep = steps[currentIndex + 1]
      await markStep(nextStep, onboardingData)
      setCurrentStep(nextStep)
    } else {
      // Fin de l'onboarding : compléter et rediriger
      await handleComplete()
    }
  }
  
  // Compléter l'onboarding
  const handleComplete = async () => {
    setCompleting(true)
    
    try {
      logger.debug('[Onboarding] handleComplete: start')
      
      // Agrégation de toutes les données collectées
      const finalOnboardingData = {
        ...onboardingData,
        completedAt: new Date().toISOString(),
      }
      
      logger.debug('[Onboarding] finalOnboardingData:', finalOnboardingData)
      
      const result = await complete(finalOnboardingData)
      
      if (result.error) {
        logger.error('[Onboarding] handleComplete error:', result.error)
        Alert.alert(
          'Erreur',
          result.error.message ?? 'Erreur lors de la finalisation de l\'onboarding.'
        )
        setCompleting(false)
        return
      }
      
      logger.debug('[Onboarding] completion OK, profile:', result.profile)
      
      // Le guard va automatiquement détecter la complétion via refreshOnboardingState
      // On appelle le callback pour forcer le refetch
      if (onComplete) {
        logger.debug('[Onboarding] Appel onComplete callback pour mettre à jour le guard')
        await onComplete()
      } else {
        // Fallback : rediriger vers le dashboard après un court délai
        logger.debug('[Onboarding] Pas de callback, redirection vers dashboard')
        setTimeout(() => {
          router.replace('/(tabs)')
        }, 500)
      }
      
      showToast('Onboarding complété avec succès !', 'success')
    } catch (err: any) {
      logger.error('[Onboarding] handleComplete error:', err)
      Alert.alert(
        'Erreur',
        err?.message ?? 'Erreur lors de la finalisation de l\'onboarding.'
      )
    } finally {
      setCompleting(false)
    }
  }

  const handleBack = () => {
    const steps: OnboardingStep[] = ['welcome', 'herd', 'breeds', 'breeding', 'farm']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  // Écran de bienvenue
  if (currentStep === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <PiggyBank size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>{Wording.onboarding.welcome.title}</Text>
          <Text style={styles.subtitle}>{Wording.onboarding.welcome.subtitle}</Text>

          <View style={styles.benefits}>
            <Text style={styles.benefitText}>✓ Configuration de votre cheptel</Text>
            <Text style={styles.benefitText}>✓ Gestion des races</Text>
            <Text style={styles.benefitText}>✓ Structure d'élevage</Text>
            <Text style={styles.benefitText}>✓ Superficie de la ferme</Text>
          </View>

          <Text style={styles.note}>Vous pourrez modifier tout cela plus tard depuis les paramètres</Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            title="Commencer"
            onPress={handleNext}
            disabled={completing}
            icon={<ArrowRight size={20} color="#ffffff" />}
          />
        </View>
      </View>
    )
  }

  // Steps du questionnaire
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {currentStep === 'herd' && (
          <HerdSizeStep 
            onDataChange={(data) => handleDataChange('herd', data)}
            onNext={() => {
              // Navigation vers le step suivant gérée par le parent
              const steps: OnboardingStep[] = ['welcome', 'herd', 'breeds', 'breeding', 'farm']
              const currentIndex = steps.indexOf('herd')
              if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1]
                setCurrentStep(nextStep)
              }
            }}
          />
        )}
        {currentStep === 'breeds' && (
          <BreedsStep 
            onDataChange={(data) => handleDataChange('breeds', data)}
            onNext={() => {
              const steps: OnboardingStep[] = ['welcome', 'herd', 'breeds', 'breeding', 'farm']
              const currentIndex = steps.indexOf('breeds')
              if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1]
                setCurrentStep(nextStep)
              }
            }}
          />
        )}
        {currentStep === 'breeding' && (
          <BreedingStructureStep 
            onDataChange={(data) => handleDataChange('breeding', data)}
            onNext={() => {
              const steps: OnboardingStep[] = ['welcome', 'herd', 'breeds', 'breeding', 'farm']
              const currentIndex = steps.indexOf('breeding')
              if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1]
                setCurrentStep(nextStep)
              }
            }}
          />
        )}
        {currentStep === 'farm' && (
          <FarmSizeStep 
            onDataChange={(data) => handleDataChange('farm', data)}
            onNext={handleComplete}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navigationButtons}>
          <SecondaryButton
            title="Précédent"
            onPress={handleBack}
            disabled={completing}
            style={{ flex: 1 }}
            fullWidth={false}
          />
          <PrimaryButton
            title={completing ? 'Finalisation...' : currentStep === 'farm' ? 'Terminer' : 'Suivant'}
            onPress={handleNext}
            disabled={completing}
            loading={completing}
            style={{ flex: 1 }}
            icon={!completing && currentStep !== 'farm' ? <ArrowRight size={20} color="#ffffff" /> : undefined}
          />
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    ...elevation.md,
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
    paddingTop: spacing.base,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.base,
  },
})
