/**
 * Ecran Ajout Cas de Sante PRO
 * ============================
 * Selection guidee des symptomes + diagnostic suggere
 */

import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { useTheme } from '../../../contexts/ThemeContext'
import { healthCasesService, type HealthCaseInsert } from '../../../services/healthCases'
import { healthProService, type Symptom, type DiseaseSuggestion, SYMPTOM_CATEGORIES, SEVERITY_OPTIONS } from '../../../services/healthPro'
import { animalsService, type Animal } from '../../../services/animals'
import { animalToUI } from '../../../lib/animalHelpers'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { useToast } from '../../../hooks/useToast'
import { Toast } from '../../../components/Toast'
import { DatePicker, LoadingScreen, LoadingInline } from '../../../components/ui'
import { getTodayISO, toISODateString } from '../../../lib/dateUtils'
import { useRefresh } from '../../../contexts/RefreshContext'
import { logger } from '../../../lib/logger'
import {
  Heart,
  ArrowLeft,
  Check,
  AlertTriangle,
  ThermometerSun,
  Stethoscope,
  Shield,
} from 'lucide-react-native'

export default function AddHealthCaseProScreen() {
  const router = useRouter()
  const { colors: themeColors } = useTheme()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const { refreshHealthCases } = useRefresh()

  // Etats de chargement
  const [loadingAnimals, setLoadingAnimals] = useState(true)
  const [loadingSymptoms, setLoadingSymptoms] = useState(true)
  const [saving, setSaving] = useState(false)

  // Donnees de reference
  const [animals, setAnimals] = useState<Animal[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [suggestedDiseases, setSuggestedDiseases] = useState<DiseaseSuggestion[]>([])

  // Formulaire
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [activeSymptomCategory, setActiveSymptomCategory] = useState('general')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [temperature, setTemperature] = useState('')
  const [startDate, setStartDate] = useState(getTodayISO())
  const [treatment, setTreatment] = useState('')
  const [veterinarian, setVeterinarian] = useState('')
  const [quarantine, setQuarantine] = useState(false)

  // Chargement des donnees
  const loadData = useCallback(async () => {
    try {
      // Charger animaux
      setLoadingAnimals(true)
      const { data: animalsData, error: animalsError } = await animalsService.getAll()
      if (animalsError) {
        logger.error('[AddHealthCase] Error loading animals:', animalsError)
        showError('Impossible de charger les animaux')
      } else {
        setAnimals(animalsData || [])
      }
    } catch (err) {
      logger.error('[AddHealthCase] Unexpected error loading animals:', err)
    } finally {
      setLoadingAnimals(false)
    }

    try {
      // Charger symptomes
      setLoadingSymptoms(true)
      const { data: symptomsData, error: symptomsError } = await healthProService.getSymptoms()
      if (symptomsError) {
        // Erreur de permission attendue si la table symptoms n'est pas configurée
        // Continuer sans symptomes (fallback vers mode basique)
        logger.debug('[AddHealthCase] Symptoms not available (RLS restriction or table not configured)')
        setSymptoms([])
      } else {
        setSymptoms(symptomsData || [])
      }
    } catch (err) {
      logger.error('[AddHealthCase] Unexpected error loading symptoms:', err)
      setSymptoms([]) // Fallback silencieux
    } finally {
      setLoadingSymptoms(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Suggestion de diagnostic quand symptomes changent
  useEffect(() => {
    const suggestDiagnosis = async () => {
      if (selectedSymptoms.length === 0) {
        setSuggestedDiseases([])
        return
      }

      try {
        const { data } = await healthProService.suggestDiseases(selectedSymptoms)
        setSuggestedDiseases(data || [])
      } catch (err) {
        logger.error('[AddHealthCase] Error suggesting diseases:', err)
      }
    }
    suggestDiagnosis()
  }, [selectedSymptoms])

  // Generer titre automatique basé sur symptomes
  useEffect(() => {
    if (selectedSymptoms.length > 0 && !title) {
      const symptomNames = selectedSymptoms
        .map((code) => symptoms.find((s) => s.code === code)?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join(', ')
      if (symptomNames) {
        setTitle(symptomNames)
      }
    }
  }, [selectedSymptoms, symptoms, title])

  // Toggle symptome
  const toggleSymptom = (code: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  // Soumission
  const handleSubmit = async () => {
    if (!selectedAnimalId) {
      showError('Veuillez selectionner un animal')
      return
    }
    if (!title.trim()) {
      showError('Veuillez donner un titre au cas')
      return
    }

    setSaving(true)
    try {
      const caseData: HealthCaseInsert = {
        animal_id: selectedAnimalId,
        title: title.trim(),
        description: description.trim() || selectedSymptoms.join(', '),
        severity,
        status: 'active',
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : null,
        treatment: treatment.trim() || null,
        start_date: startDate,
        quarantine_applied: quarantine,
      }

      const { error: createError } = await healthCasesService.create(caseData)

      if (createError) {
        throw createError
      }

      showSuccess('Cas de sante enregistre')
      refreshHealthCases()
      setTimeout(() => router.back(), 1000)
    } catch (err) {
      logger.error('[AddHealthCase] Error creating health case:', err)
      showError('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  // Filtrer symptomes par categorie active
  const filteredSymptoms = symptoms.filter((s) => s.category === activeSymptomCategory)

  // Mode symptomes disponible?
  const symptomsAvailable = symptoms.length > 0

  if (loadingAnimals) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
          <View style={styles.headerContent}>
            <Heart size={24} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>Nouveau cas de sante</Text>
          </View>
        </View>
        <LoadingScreen
          message="Chargement..."
          size={120}
          color={colors.primary}
        />
      </View>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nouveau cas de sante',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={22} color={themeColors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selection animal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Animal concerne *
          </Text>
          {animals.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                Aucun animal disponible. Ajoutez d'abord un animal dans le cheptel.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.animalScroll}
            >
              {animals.map((animal) => {
                const animalUI = animalToUI(animal)
                const isSelected = selectedAnimalId === animal.id
                return (
                  <TouchableOpacity
                    key={animal.id}
                    style={[
                      styles.animalChip,
                      {
                        backgroundColor: isSelected ? colors.primary : themeColors.surface,
                        borderColor: isSelected ? colors.primary : themeColors.border,
                      },
                      elevation.xs,
                    ]}
                    onPress={() => setSelectedAnimalId(animal.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.animalChipText,
                        { color: isSelected ? '#FFF' : themeColors.text },
                      ]}
                    >
                      {animalUI.name || animalUI.identifier}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )}
        </View>

        {/* Symptomes - Mode PRO */}
        {symptomsAvailable && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Stethoscope size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 0 }]}>
                Symptomes observes
              </Text>
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {SYMPTOM_CATEGORIES.map((cat) => {
                const isActive = activeSymptomCategory === cat.id
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor: isActive ? cat.color + '20' : 'transparent',
                        borderColor: isActive ? cat.color : themeColors.border,
                      },
                    ]}
                    onPress={() => setActiveSymptomCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        { color: isActive ? cat.color : themeColors.textSecondary },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {/* Liste symptomes */}
            {loadingSymptoms ? (
              <View style={styles.symptomsLoadingContainer}>
                <LoadingInline size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.symptomsGrid}>
                {filteredSymptoms.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.code)
                  return (
                    <TouchableOpacity
                      key={symptom.code}
                      style={[
                        styles.symptomChip,
                        {
                          backgroundColor: isSelected
                            ? colors.primary + '20'
                            : themeColors.surface,
                          borderColor: isSelected ? colors.primary : themeColors.border,
                        },
                      ]}
                      onPress={() => toggleSymptom(symptom.code)}
                    >
                      {isSelected && <Check size={14} color={colors.primary} />}
                      <Text
                        style={[
                          styles.symptomChipText,
                          { color: isSelected ? colors.primary : themeColors.text },
                        ]}
                      >
                        {symptom.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
                {filteredSymptoms.length === 0 && (
                  <Text style={[styles.noSymptomsText, { color: themeColors.textSecondary }]}>
                    Aucun symptome dans cette categorie
                  </Text>
                )}
              </View>
            )}

            {/* Badge symptomes selectionnes */}
            {selectedSymptoms.length > 0 && (
              <View style={[styles.selectedBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.selectedBadgeText, { color: colors.primary }]}>
                  {selectedSymptoms.length} symptome{selectedSymptoms.length > 1 ? 's' : ''} selectionne{selectedSymptoms.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Diagnostic suggere */}
        {suggestedDiseases.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.suggestionCard, { backgroundColor: '#FEF3C7' }]}>
              <View style={styles.suggestionHeader}>
                <AlertTriangle size={20} color="#D97706" />
                <Text style={styles.suggestionTitle}>Diagnostic suggere</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>
                    {Math.round(suggestedDiseases[0].matchScore * 100)}%
                  </Text>
                </View>
              </View>

              <Text style={styles.diseaseName}>{suggestedDiseases[0].name}</Text>
              <Text style={styles.diseaseDesc}>{suggestedDiseases[0].description}</Text>

              {suggestedDiseases[0].quarantine_required && (
                <View style={styles.warningBanner}>
                  <Shield size={16} color="#EF4444" />
                  <Text style={styles.warningText}>Quarantaine recommandee</Text>
                </View>
              )}

              {suggestedDiseases[0].recommended_actions && (
                <>
                  <Text style={styles.actionLabel}>Action recommandee :</Text>
                  <Text style={styles.actionText}>
                    {suggestedDiseases[0].recommended_actions}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* Severite */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Severite</Text>
          <View style={styles.severityRow}>
            {SEVERITY_OPTIONS.map((opt) => {
              const isActive = severity === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.severityOption,
                    {
                      backgroundColor: isActive ? opt.color + '20' : themeColors.surface,
                      borderColor: isActive ? opt.color : themeColors.border,
                    },
                    elevation.xs,
                  ]}
                  onPress={() => setSeverity(opt.value as typeof severity)}
                >
                  <View
                    style={[styles.severityDot, { backgroundColor: opt.color }]}
                  />
                  <Text
                    style={[
                      styles.severityText,
                      { color: isActive ? opt.color : themeColors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Details</Text>

          <Text style={[styles.label, { color: themeColors.text }]}>Titre du cas *</Text>
          <TextInput
            style={[
              commonStyles.input,
              styles.input,
              { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Toux et fievre"
            placeholderTextColor={themeColors.textSecondary}
          />

          <Text style={[styles.label, { color: themeColors.text }]}>Description</Text>
          <TextInput
            style={[
              commonStyles.input,
              styles.textArea,
              { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Decrivez les symptomes observes..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={3}
          />

          {/* Temperature */}
          <View style={styles.temperatureRow}>
            <ThermometerSun size={18} color={themeColors.textSecondary} />
            <Text style={[styles.label, { color: themeColors.text, marginBottom: 0, marginTop: 0 }]}>
              Temperature (°C)
            </Text>
          </View>
          <TextInput
            style={[
              commonStyles.input,
              styles.input,
              styles.shortInput,
              { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border },
            ]}
            value={temperature}
            onChangeText={setTemperature}
            placeholder="39.5"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="decimal-pad"
          />

          <DatePicker
            label="Date de debut"
            value={startDate}
            onChange={(date) => setStartDate(date ? toISODateString(date) : getTodayISO())}
            maximumDate={new Date()}
            helperText="Date de detection du probleme"
          />
        </View>

        {/* Quarantaine */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.checkboxRow, { backgroundColor: themeColors.surface }, elevation.xs]}
            onPress={() => setQuarantine(!quarantine)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: quarantine ? colors.primary : 'transparent',
                  borderColor: quarantine ? colors.primary : themeColors.border,
                },
              ]}
            >
              {quarantine && <Check size={14} color="#FFF" />}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={[styles.checkboxLabel, { color: themeColors.text }]}>
                Mise en quarantaine
              </Text>
              <Text style={[styles.checkboxHint, { color: themeColors.textSecondary }]}>
                L'animal sera isole du reste du troupeau
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Traitement */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Traitement (optionnel)
          </Text>
          <TextInput
            style={[
              commonStyles.input,
              styles.textArea,
              { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border },
            ]}
            value={treatment}
            onChangeText={setTreatment}
            placeholder="Decrivez le traitement administre..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { color: themeColors.text }]}>Veterinaire</Text>
          <TextInput
            style={[
              commonStyles.input,
              styles.input,
              { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border },
            ]}
            value={veterinarian}
            onChangeText={setVeterinarian}
            placeholder="Nom du veterinaire"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        {/* Bouton submit */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              commonStyles.button,
              commonStyles.buttonPrimary,
              styles.submitButton,
              saving && styles.submitButtonDisabled,
              elevation.md,
            ]}
            onPress={handleSubmit}
            disabled={saving || !selectedAnimalId || !title.trim()}
            activeOpacity={0.8}
          >
            {saving ? (
              <LoadingInline size="small" color="#ffffff" />
            ) : (
              <Text style={commonStyles.buttonText}>Enregistrer le cas</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.base,
    paddingTop: spacing['4xl'],
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
  },
  headerButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.body,
  },
  symptomsLoadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  animalScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  animalChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
  },
  animalChipText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  categoryScroll: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  symptomChipText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
  },
  noSymptomsText: {
    fontSize: typography.fontSize.bodySmall,
    fontStyle: 'italic',
    padding: spacing.md,
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  selectedBadgeText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold,
  },
  suggestionCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestionTitle: {
    flex: 1,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
    color: '#92400E',
  },
  matchBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  matchText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
  },
  diseaseName: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: '#92400E',
    marginBottom: spacing.xs,
  },
  diseaseDesc: {
    fontSize: typography.fontSize.body,
    color: '#92400E',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  warningText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
    color: '#EF4444',
  },
  actionLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: '#92400E',
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.bodySmall,
    color: '#92400E',
    lineHeight: 18,
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  shortInput: {
    width: 120,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  checkboxHint: {
    fontSize: typography.fontSize.bodySmall,
    marginTop: 2,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  bottomSpacer: {
    height: 100,
  },
})
