/**
 * Étape : Taille du cheptel
 * Nombre total d'animaux dans la ferme
 * Version 2.0 - Corrigé pour éviter les boucles de rendu
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { useOnboardingState } from '../../../lib/onboarding/hooks/useOnboardingState'
import { TextField, PrimaryButton } from '../../../components/ui'
import { Wording } from '../../../lib/constants/wording'

interface HerdSizeStepProps {
  onDataChange?: (data: { totalAnimals: number }) => void
  onNext?: () => void
}

export function HerdSizeStep({ onDataChange, onNext }: HerdSizeStepProps) {
  const { cachedData, markStep } = useOnboardingState()
  const [totalAnimals, setTotalAnimals] = useState<string>('')
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
    
    if (cachedData && typeof cachedData === 'object' && 'totalAnimals' in cachedData) {
      const value = (cachedData as any).totalAnimals
      if (value && typeof value === 'number' && value > 0) {
        setTotalAnimals(String(value))
        setIsInitialized(true)
      } else {
        setIsInitialized(true)
      }
    } else {
      setIsInitialized(true)
    }
  }, [cachedData, isInitialized])

  // Handler pour filtrer l'input (uniquement des chiffres)
  const handleChange = useCallback((text: string) => {
    // Filtrer pour ne garder que des chiffres
    const numeric = text.replace(/[^0-9]/g, '')
    setTotalAnimals(numeric)
    setError(null) // Réinitialiser l'erreur à chaque changement
  }, [])

  // Validation de la valeur
  const validateValue = useCallback((value: number): string | null => {
    if (Number.isNaN(value) || value <= 0) {
      return 'Veuillez saisir un nombre supérieur à 0.'
    }
    if (value > 10000) {
      return 'Le nombre maximum est de 10 000 animaux.'
    }
    return null
  }, [])

  // Handler pour le bouton "Suivant"
  const handleNext = useCallback(async () => {
    const value = Number(totalAnimals)
    const validationError = validateValue(value)
    
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Sauvegarder dans Supabase
      const result = await markStep('herd', { totalAnimals: value })
      
      if (result.error) {
        setError('Erreur lors de la sauvegarde. Réessayez.')
        setSaving(false)
        return
      }

      // Notifier le parent (une seule fois, pas dans un useEffect)
      onDataChangeRef.current?.({ totalAnimals: value })
      
      // Appeler onNext si fourni (pour navigation)
      onNext?.()
    } catch (err) {
      console.error('[HerdSizeStep] Erreur lors de la sauvegarde:', err)
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setSaving(false)
    }
  }, [totalAnimals, validateValue, markStep, onNext])

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{Wording.onboarding.herdSize.title}</Text>
        <Text style={styles.subtitle}>{Wording.onboarding.herdSize.subtitle}</Text>
        
        <TextField
          label="Nombre total d'animaux"
          placeholder="Ex: 250"
          keyboardType="number-pad"
          value={totalAnimals}
          onChangeText={handleChange}
          editable={!saving}
          maxLength={5}
          error={error}
          helperText={Wording.onboarding.herdSize.hint}
        />
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
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed,
  },
})

// Export par défaut pour éviter les warnings Expo Router
export default HerdSizeStep
