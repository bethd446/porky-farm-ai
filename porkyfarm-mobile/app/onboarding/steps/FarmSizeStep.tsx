/**
 * Étape : Superficie de la ferme
 * Surface totale et répartition
 * Version 2.0 - Corrigé pour éviter les boucles de rendu
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { useOnboardingState } from '../../../lib/onboarding/hooks/useOnboardingState'
import { TextField, SegmentedControl } from '../../../components/ui'
import { Wording } from '../../../lib/constants/wording'

interface FarmSizeStepProps {
  onDataChange?: (data: { farmSize: number; farmSizeUnit: 'ha' | 'm2' }) => void
  onNext?: () => void
}

export function FarmSizeStep({ onDataChange, onNext }: FarmSizeStepProps) {
  const { cachedData, markStep } = useOnboardingState()
  const [farmSize, setFarmSize] = useState('')
  const [unit, setUnit] = useState<'ha' | 'm2'>('ha')
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
    
    if (cachedData && typeof cachedData === 'object' && 'farmSize' in cachedData) {
      const value = (cachedData as any).farmSize
      if (value) {
        setFarmSize(String(value))
      }
      if ((cachedData as any).farmSizeUnit) {
        setUnit((cachedData as any).farmSizeUnit)
      }
    }
    setIsInitialized(true)
  }, [cachedData, isInitialized])

  // Handler pour filtrer l'input (uniquement des chiffres et un point décimal)
  const handleChange = useCallback((text: string) => {
    // Permettre les chiffres et un point décimal
    const numeric = text.replace(/[^0-9.]/g, '')
    // S'assurer qu'il n'y a qu'un seul point
    const parts = numeric.split('.')
    const filtered = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numeric
    setFarmSize(filtered)
    setError(null)
  }, [])

  // Validation
  const validateValue = useCallback((): string | null => {
    const value = parseFloat(farmSize)
    if (Number.isNaN(value) || value <= 0) {
      return 'Veuillez saisir une superficie supérieure à 0.'
    }
    if (value > 100000) {
      return 'La superficie ne peut pas dépasser 100 000 hectares.'
    }
    return null
  }, [farmSize])

  // Handler pour le bouton "Suivant"
  const handleNext = useCallback(async () => {
    const validationError = validateValue()
    
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const value = parseFloat(farmSize)
      
      // Sauvegarder dans Supabase
      const result = await markStep('farm', { farmSize: value, farmSizeUnit: unit })
      
      if (result.error) {
        setError('Erreur lors de la sauvegarde. Réessayez.')
        setSaving(false)
        return
      }

      // Notifier le parent (une seule fois, pas dans un useEffect)
      onDataChangeRef.current?.({ farmSize: value, farmSizeUnit: unit })
      
      // Appeler onNext si fourni (pour navigation)
      onNext?.()
    } catch (err) {
      console.error('[FarmSizeStep] Erreur lors de la sauvegarde:', err)
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setSaving(false)
    }
  }, [farmSize, unit, validateValue, markStep, onNext])

  const hasValue = parseFloat(farmSize) > 0

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{Wording.onboarding.farmSize.title}</Text>
        <Text style={styles.subtitle}>{Wording.onboarding.farmSize.subtitle}</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextField
              label="Superficie"
              placeholder="0"
              keyboardType="decimal-pad"
              value={farmSize}
              onChangeText={handleChange}
              editable={!saving}
              maxLength={10}
              error={error}
              containerStyle={styles.textFieldContainer}
            />
          </View>
          <View style={styles.unitWrapper}>
            <SegmentedControl
              options={[
                { label: 'ha', value: 'ha' },
                { label: 'm²', value: 'm2' },
              ]}
              value={unit}
              onChange={(value) => setUnit(value as 'ha' | 'm2')}
            />
          </View>
        </View>

        <Text style={styles.hint}>
          1 hectare (ha) = 10 000 m²
        </Text>
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
  inputRow: {
    flexDirection: 'row',
    gap: spacing.base,
    alignItems: 'flex-end',
    marginBottom: spacing.base,
  },
  inputWrapper: {
    flex: 1,
  },
  textFieldContainer: {
    marginBottom: 0,
  },
  unitWrapper: {
    width: 120,
    paddingBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    fontStyle: 'italic',
    marginTop: spacing.base,
  },
})

// Export par défaut pour éviter les warnings Expo Router
export default FarmSizeStep
