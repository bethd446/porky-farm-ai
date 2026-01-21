/**
 * Étape : Structure d'élevage
 * Nombre de truies, verrats, porcelets
 * Version 2.0 - Corrigé pour éviter les boucles de rendu
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { useOnboardingState } from '../../../lib/onboarding/hooks/useOnboardingState'
import { TextField } from '../../../components/ui'
import { Wording } from '../../../lib/constants/wording'

interface BreedingStructureStepProps {
  onDataChange?: (data: { breedingStructure: { sows: number; boars: number; piglets: number } }) => void
  onNext?: () => void
}

export function BreedingStructureStep({ onDataChange, onNext }: BreedingStructureStepProps) {
  const { cachedData, markStep } = useOnboardingState()
  const [sows, setSows] = useState('')
  const [boars, setBoars] = useState('')
  const [piglets, setPiglets] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Stocker onDataChange dans un ref pour éviter les dépendances dans useEffect
  const onDataChangeRef = useRef(onDataChange)
  useEffect(() => {
    onDataChangeRef.current = onDataChange
  }, [onDataChange])

  // Initialiser les valeurs depuis le cache UNE SEULE FOIS au montage
  useEffect(() => {
    if (isInitialized) return
    
    if (cachedData && typeof cachedData === 'object' && 'breedingStructure' in cachedData) {
      const structure = (cachedData as any).breedingStructure
      if (structure) {
        if (structure.sows) setSows(String(structure.sows))
        if (structure.boars) setBoars(String(structure.boars))
        if (structure.piglets) setPiglets(String(structure.piglets))
      }
    }
    setIsInitialized(true)
  }, [cachedData, isInitialized])

  // Handlers pour filtrer l'input (uniquement des chiffres)
  const handleSowsChange = useCallback((text: string) => {
    const numeric = text.replace(/[^0-9]/g, '')
    setSows(numeric)
    setError(null)
  }, [])

  const handleBoarsChange = useCallback((text: string) => {
    const numeric = text.replace(/[^0-9]/g, '')
    setBoars(numeric)
    setError(null)
  }, [])

  const handlePigletsChange = useCallback((text: string) => {
    const numeric = text.replace(/[^0-9]/g, '')
    setPiglets(numeric)
    setError(null)
  }, [])

  // Validation
  const validateInputs = useCallback((): string | null => {
    const sowsNum = parseInt(sows, 10) || 0
    const boarsNum = parseInt(boars, 10) || 0
    const pigletsNum = parseInt(piglets, 10) || 0

    if (sowsNum < 0 || boarsNum < 0 || pigletsNum < 0) {
      return 'Les valeurs ne peuvent pas être négatives.'
    }

    if (sowsNum > 10000 || boarsNum > 10000 || pigletsNum > 10000) {
      return 'Les valeurs ne peuvent pas dépasser 10 000.'
    }

    if (sowsNum === 0 && boarsNum === 0 && pigletsNum === 0) {
      return 'Veuillez saisir au moins une valeur.'
    }

    return null
  }, [sows, boars, piglets])

  // Handler pour le bouton "Suivant"
  const handleNext = useCallback(async () => {
    const validationError = validateInputs()
    
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const sowsNum = parseInt(sows, 10) || 0
      const boarsNum = parseInt(boars, 10) || 0
      const pigletsNum = parseInt(piglets, 10) || 0
      const structure = { sows: sowsNum, boars: boarsNum, piglets: pigletsNum }

      // Sauvegarder dans Supabase
      const result = await markStep('breeding', { breedingStructure: structure })
      
      if (result.error) {
        setError('Erreur lors de la sauvegarde. Réessayez.')
        setSaving(false)
        return
      }

      // Notifier le parent (une seule fois, pas dans un useEffect)
      onDataChangeRef.current?.({ breedingStructure: structure })
      
      // Appeler onNext si fourni (pour navigation)
      onNext?.()
    } catch (err) {
      console.error('[BreedingStructureStep] Erreur lors de la sauvegarde:', err)
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setSaving(false)
    }
  }, [sows, boars, piglets, validateInputs, markStep, onNext])

  const hasAnyValue = (parseInt(sows, 10) || 0) > 0 || (parseInt(boars, 10) || 0) > 0 || (parseInt(piglets, 10) || 0) > 0

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{Wording.onboarding.breedingStructure.title}</Text>
        <Text style={styles.subtitle}>{Wording.onboarding.breedingStructure.subtitle}</Text>
        <Text style={styles.hint}>Indiquez le nombre d'animaux par catégorie</Text>
        
        <TextField
          label="Nombre de truies"
          placeholder="0"
          keyboardType="number-pad"
          value={sows}
          onChangeText={handleSowsChange}
          editable={!saving}
          maxLength={5}
        />

        <TextField
          label="Nombre de verrats"
          placeholder="0"
          keyboardType="number-pad"
          value={boars}
          onChangeText={handleBoarsChange}
          editable={!saving}
          maxLength={5}
        />

        <TextField
          label="Nombre de porcelets"
          placeholder="0"
          keyboardType="number-pad"
          value={piglets}
          onChangeText={handlePigletsChange}
          editable={!saving}
          maxLength={5}
          error={error}
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
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.relaxed,
  },
  hint: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
})

// Export par défaut pour éviter les warnings Expo Router
export default BreedingStructureStep
