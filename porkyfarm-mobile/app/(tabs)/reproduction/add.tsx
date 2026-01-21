import { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { gestationsService, type GestationInsert, calculateExpectedFarrowingDate } from '../../../services/gestations'
import { animalsService, type Animal } from '../../../services/animals'
import { animalToUI } from '../../../lib/animalHelpers'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'
import { logger } from '../../../lib/logger'
import { DatePicker, LoadingInline } from '../../../components/ui'
import { elevation } from '../../../lib/design/elevation'
import { useToast } from '../../../hooks/useToast'
import { Toast } from '../../../components/Toast'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { Baby } from 'lucide-react-native'
import { getTodayISO, toISODateString } from '../../../lib/dateUtils'
import { useRefresh } from '../../../contexts/RefreshContext'

export default function AddGestationScreen() {
  const [formData, setFormData] = useState<GestationInsert>({
    sow_id: '',
    boar_id: null,
    mating_date: getTodayISO(),
    status: 'en_cours', // Status V2.0 Supabase
  })
  const [sows, setSows] = useState<Animal[]>([])
  const [boars, setBoars] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAnimals, setLoadingAnimals] = useState(true)
  const router = useRouter()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const { refreshGestations } = useRefresh()

  const loadAnimals = useCallback(async () => {
    setLoadingAnimals(true)
    try {
      const { data, error } = await animalsService.getAll()
      if (error) {
        logger.error('[AddGestation] Error loading animals:', error)
        showError('Impossible de charger les animaux. Vérifiez votre connexion.')
        setSows([])
        setBoars([])
      } else {
        const allAnimals = data || []
        // Filtrer par gender ou sex (compatibilité V2.0/legacy)
        setSows(allAnimals.filter((a) => a.gender === 'female' || a.sex === 'female'))
        setBoars(allAnimals.filter((a) => a.gender === 'male' || a.sex === 'male'))
      }
    } catch (err) {
      logger.error('[AddGestation] Unexpected error loading animals:', err)
      showError('Une erreur est survenue lors du chargement')
      setSows([])
      setBoars([])
    } finally {
      setLoadingAnimals(false)
    }
  }, [showError])

  useEffect(() => {
    loadAnimals()
  }, [loadAnimals])

  const handleSubmit = async () => {
    if (!formData.sow_id || !formData.mating_date) {
      showError('Veuillez sélectionner une truie et une date de saillie')
      return
    }

    setLoading(true)
    try {
      // Calculer automatiquement la date prévue
      const expectedDate = calculateExpectedFarrowingDate(formData.mating_date)
      const { error } = await gestationsService.create({
        ...formData,
        expected_farrowing_date: expectedDate,
      })
      if (error) {
        showError(error.message || 'Erreur lors de la création')
      } else {
        showSuccess('Gestation enregistrée avec succès')
        refreshGestations()
        setTimeout(() => router.back(), 1500)
      }
    } catch (err: unknown) {
      logger.error('[AddGestation] Error creating gestation:', err)
      showError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const expectedFarrowingDate = formData.mating_date
    ? calculateExpectedFarrowingDate(formData.mating_date)
    : null

  if (loadingAnimals) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nouvelle saillie</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.skeletonContainer}>
            <LoadingSkeleton width="100%" height={60} style={styles.skeleton} />
            <LoadingSkeleton width="100%" height={60} style={styles.skeleton} />
            <LoadingSkeleton width="100%" height={100} style={styles.skeleton} />
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Baby size={24} color={colors.primary} />
          <Text style={styles.title}>Nouvelle saillie</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Truie *</Text>
        {sows.length === 0 ? (
          <View style={styles.emptyAnimalsContainer}>
            <Text style={styles.emptyAnimalsText}>
              Aucune truie disponible. Ajoutez d'abord une truie dans le cheptel.
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.animalSelector}>
            {sows.map((sow) => {
              const sowUI = animalToUI(sow)
              return (
                <TouchableOpacity
                  key={sow.id}
                  style={[
                    styles.animalOption,
                    formData.sow_id === sow.id && styles.animalOptionSelected,
                    elevation.xs,
                  ]}
                  onPress={() => setFormData({ ...formData, sow_id: sow.id })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.animalOptionText,
                      formData.sow_id === sow.id && styles.animalOptionTextSelected,
                    ]}
                  >
                    {sowUI.name || sowUI.identifier}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        )}

        <Text style={styles.label}>Verrat (optionnel)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.animalSelector}>
          <TouchableOpacity
            style={[
              styles.animalOption,
              !formData.boar_id && styles.animalOptionSelected,
              elevation.xs,
            ]}
            onPress={() => setFormData({ ...formData, boar_id: null })}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.animalOptionText,
                !formData.boar_id && styles.animalOptionTextSelected,
              ]}
            >
              Aucun
            </Text>
          </TouchableOpacity>
          {boars.map((boar) => {
            const boarUI = animalToUI(boar)
            return (
              <TouchableOpacity
                key={boar.id}
                style={[
                  styles.animalOption,
                  formData.boar_id === boar.id && styles.animalOptionSelected,
                  elevation.xs,
                ]}
                onPress={() => setFormData({ ...formData, boar_id: boar.id })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.animalOptionText,
                    formData.boar_id === boar.id && styles.animalOptionTextSelected,
                  ]}
                >
                  {boarUI.name || boarUI.identifier}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <DatePicker
          label="Date de saillie *"
          value={formData.mating_date}
          onChange={(date) => {
            if (date) {
              setFormData({ ...formData, mating_date: toISODateString(date) })
            }
          }}
          maximumDate={new Date()}
          helperText="Date à laquelle la saillie a eu lieu"
        />
        {expectedFarrowingDate && (
          <View style={styles.hintContainer}>
            <Text style={styles.hint}>
              📅 Mise-bas prévue : {new Date(expectedFarrowingDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[commonStyles.input, styles.textArea]}
          value={formData.notes || ''}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Notes supplémentaires..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[
            commonStyles.button,
            commonStyles.buttonPrimary,
            styles.submitButton,
            loading && styles.submitButtonDisabled,
            elevation.md,
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <LoadingInline size="small" color="#ffffff" />
          ) : (
            <Text style={commonStyles.buttonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.base,
    paddingTop: spacing['4xl'],
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  form: {
    padding: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  input: {
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emptyAnimalsContainer: {
    padding: spacing.base,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  emptyAnimalsText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  animalSelector: {
    marginBottom: spacing.sm,
  },
  animalOption: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
  },
  animalOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  animalOptionText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  animalOptionTextSelected: {
    color: '#ffffff',
  },
  hintContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.info,
    fontWeight: typography.fontWeight.medium,
  },
  submitButton: {
    marginTop: spacing['2xl'],
    marginBottom: spacing['4xl'],
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  skeletonContainer: {
    padding: spacing.base,
    gap: spacing.base,
  },
  skeleton: {
    marginBottom: spacing.sm,
  },
})
