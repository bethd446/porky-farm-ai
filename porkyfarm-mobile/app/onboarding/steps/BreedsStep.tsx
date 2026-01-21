/**
 * Étape : Races
 * Sélection des races élevées
 * Version 2.0 - Corrigé pour éviter les boucles de rendu
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { useOnboardingState } from '../../../lib/onboarding/hooks/useOnboardingState'
import { Check } from 'lucide-react-native'
import { Wording } from '../../../lib/constants/wording'

interface BreedsStepProps {
  onDataChange?: (data: { breeds: string[] }) => void
  onNext?: () => void
}

const AVAILABLE_BREEDS = [
  'Large White',
  'Landrace',
  'Piétrain',
  'Duroc',
  'Hampshire',
  'Autre',
]

export function BreedsStep({ onDataChange, onNext }: BreedsStepProps) {
  const { cachedData, markStep } = useOnboardingState()
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Stocker onDataChange dans un ref pour éviter les dépendances dans useEffect
  const onDataChangeRef = useRef(onDataChange)
  useEffect(() => {
    onDataChangeRef.current = onDataChange
  }, [onDataChange])

  // Initialiser la valeur depuis le cache UNE SEULE FOIS au montage
  useEffect(() => {
    if (isInitialized) return
    
    if (cachedData && typeof cachedData === 'object' && 'breeds' in cachedData) {
      const breeds = (cachedData as any).breeds
      if (Array.isArray(breeds) && breeds.length > 0) {
        setSelectedBreeds(breeds)
      }
    }
    setIsInitialized(true)
  }, [cachedData, isInitialized])

  const toggleBreed = useCallback((breed: string) => {
    setSelectedBreeds(prev => {
      const newSelection = prev.includes(breed)
        ? prev.filter(b => b !== breed)
        : [...prev, breed]
      return newSelection
    })
    setError(null) // Réinitialiser l'erreur à chaque changement
  }, [])

  // Validation
  const validateSelection = useCallback((): string | null => {
    if (selectedBreeds.length === 0) {
      return 'Veuillez sélectionner au moins une race.'
    }
    return null
  }, [selectedBreeds])

  // Handler pour le bouton "Suivant"
  const handleNext = useCallback(async () => {
    const validationError = validateSelection()
    
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Sauvegarder dans Supabase
      const result = await markStep('breeds', { breeds: selectedBreeds })
      
      if (result.error) {
        setError('Erreur lors de la sauvegarde. Réessayez.')
        setSaving(false)
        return
      }

      // Notifier le parent (une seule fois, pas dans un useEffect)
      onDataChangeRef.current?.({ breeds: selectedBreeds })
      
      // Appeler onNext si fourni (pour navigation)
      onNext?.()
    } catch (err) {
      console.error('[BreedsStep] Erreur lors de la sauvegarde:', err)
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setSaving(false)
    }
  }, [selectedBreeds, validateSelection, markStep, onNext])

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{Wording.onboarding.breeds.title}</Text>
        <Text style={styles.subtitle}>{Wording.onboarding.breeds.subtitle}</Text>
        <Text style={styles.hint}>Sélectionnez une ou plusieurs races</Text>
        
        <View style={styles.breedsList}>
          {AVAILABLE_BREEDS.map(breed => {
            const isSelected = selectedBreeds.includes(breed)
            return (
              <TouchableOpacity
                key={breed}
                style={[styles.breedItem, isSelected && styles.breedItemSelected]}
                onPress={() => toggleBreed(breed)}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Text style={[styles.breedText, isSelected && styles.breedTextSelected]}>
                  {breed}
                </Text>
                {isSelected && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.relaxed,
  },
  hint: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  breedsList: {
    gap: spacing.base,
  },
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 56,
    ...elevation.sm,
  },
  breedItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  breedText: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
  },
  breedTextSelected: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  errorContainer: {
    backgroundColor: `${colors.error}15`,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.base,
    marginTop: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.error,
    textAlign: 'center',
  },
})

// Export par défaut pour éviter les warnings Expo Router
export default BreedsStep
