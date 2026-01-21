/**
 * Ecran Detail Animal - Version Premium
 * =====================================
 * Photo, tags, edition, actions rapides
 */

import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../../contexts/ThemeContext'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useToast } from '../../../hooks/useToast'
import { animalsService, type Animal, type AnimalUpdate, mapSexToCategory } from '../../../services/animals'
import { animalToUI } from '../../../lib/animalHelpers'
import { logger } from '../../../lib/logger'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingScreen } from '../../../components/ui/LoadingScreen'
import { Toast } from '../../../components/Toast'
import {
  Camera,
  Edit3,
  Save,
  Trash2,
  Heart,
  Stethoscope,
  UtensilsCrossed,
  DollarSign,
  Tag,
  Calendar,
  Scale,
  MapPin,
  ChevronRight,
  X,
} from 'lucide-react-native'

// Types for theme colors from ThemeContext
interface ThemeColors {
  text: string
  textSecondary: string
  background: string
  surface: string
  border: string
  primary: string
}

// Props for the InfoRow component
interface InfoRowProps {
  icon: React.ComponentType<{ size: number; color: string }>
  label: string
  value: string | number
  themeColors: ThemeColors
  isLast?: boolean
}

// Props for the ActionButton component
interface ActionButtonProps {
  icon: React.ComponentType<{ size: number; color: string }>
  label: string
  color: string
  themeColors: ThemeColors
  onPress: () => void
}

// Tags predefinis
const AVAILABLE_TAGS = [
  { id: 'reproducteur', label: 'Reproducteur', color: '#8B5CF6', icon: Heart },
  { id: 'gestation', label: 'En gestation', color: '#EC4899', icon: Heart },
  { id: 'lactation', label: 'Lactation', color: '#F59E0B', icon: Heart },
  { id: 'sevrage', label: 'Sevrage', color: '#10B981', icon: Tag },
  { id: 'engraissement', label: 'Engraissement', color: '#3B82F6', icon: Tag },
  { id: 'traitement', label: 'Sous traitement', color: '#EF4444', icon: Stethoscope },
  { id: 'surveillance', label: 'A surveiller', color: '#F97316', icon: Tag },
  { id: 'vente', label: 'A vendre', color: '#6366F1', icon: DollarSign },
]

const CATEGORY_LABELS: Record<string, string> = {
  sow: 'Truie',
  boar: 'Verrat',
  piglet: 'Porcelet',
  fattening: "Porc a l'engrais",
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: '#10B981' },
  sick: { label: 'Malade', color: '#EF4444' },
  pregnant: { label: 'Gestante', color: '#EC4899' },
  nursing: { label: 'Allaitante', color: '#F59E0B' },
  sold: { label: 'Vendu', color: '#6366F1' },
  deceased: { label: 'Decede', color: '#6B7280' },
  quarantine: { label: 'Quarantaine', color: '#EF4444' },
}

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors: themeColors } = useTheme()
  const { refreshAnimals, refreshHealthCases } = useRefresh()
  const { toast, showSuccess, showError, hideToast } = useToast()

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null)

  // Champs éditables
  const [editName, setEditName] = useState('')
  const [editBreed, setEditBreed] = useState('')
  const [editWeight, setEditWeight] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('actif')

  // Chargement de l'animal
  const loadAnimal = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await animalsService.getById(id)

      if (fetchError) {
        throw fetchError
      }

      if (!data) {
        throw new Error('Animal non trouve')
      }

      setAnimal(data)
      // Initialiser les champs éditables
      setEditName(data.name || '')
      setEditBreed(data.breed || '')
      setEditNotes(data.notes?.replace(/#\w+\s*/g, '').trim() || '')
      setEditStatus(data.status || 'actif')
      // Poids depuis weight_history
      if (data.weight_history && Array.isArray(data.weight_history) && data.weight_history.length > 0) {
        const sorted = [...data.weight_history].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setEditWeight(sorted[0]?.weight?.toString() || '')
      } else {
        setEditWeight(data.weight_kg?.toString() || '')
      }
      // Charger les tags depuis les notes (format: #tag1 #tag2)
      if (data.notes) {
        const tagMatches = data.notes.match(/#(\w+)/g)
        if (tagMatches) {
          setSelectedTags(tagMatches.map(t => t.replace('#', '')))
        }
      }
    } catch (err) {
      logger.error('[AnimalDetail] Error loading animal:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadAnimal()
  }, [loadAnimal])

  // Selection de photo
  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Permission requise', "Autorisez l'acces aux photos pour continuer.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setNewPhotoUrl(result.assets[0].uri)
      showSuccess('Photo selectionnee')
    }
  }

  // Toggle tag
  const toggleTag = (tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    )
  }

  // Sauvegarde
  const handleSave = async () => {
    if (!animal?.id) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSaving(true)

    try {
      // Preparer les notes avec les tags
      const tagString = selectedTags.map(t => `#${t}`).join(' ')
      const newNotes = tagString ? `${tagString} ${editNotes}`.trim() : editNotes.trim()

      // Préparer weight_history avec le nouveau poids
      let newWeightHistory = animal.weight_history || []
      const newWeight = parseFloat(editWeight)
      if (!isNaN(newWeight) && newWeight > 0) {
        const today = new Date().toISOString().split('T')[0]
        // Vérifier si on a déjà un poids pour aujourd'hui
        const existingTodayIndex = newWeightHistory.findIndex(w => w.date === today)
        if (existingTodayIndex >= 0) {
          newWeightHistory[existingTodayIndex] = { date: today, weight: newWeight }
        } else {
          newWeightHistory = [...newWeightHistory, { date: today, weight: newWeight }]
        }
      }

      const updates: AnimalUpdate = {
        name: editName.trim() || null,
        breed: editBreed.trim() || null,
        notes: newNotes || null,
        status: editStatus,
        weight_kg: !isNaN(newWeight) && newWeight > 0 ? newWeight : animal.weight_kg,
        weight_history: newWeightHistory.length > 0 ? newWeightHistory : null,
      }

      if (newPhotoUrl) {
        updates.photo_url = newPhotoUrl
      }

      const { error: updateError } = await animalsService.update(animal.id, updates)

      if (updateError) throw updateError

      // Mettre à jour l'état local
      setAnimal(prev => prev ? { ...prev, ...updates } as typeof prev : null)
      setIsEditing(false)
      refreshAnimals() // Refresh temps réel
      showSuccess('Animal mis a jour')
    } catch (err) {
      logger.error('[AnimalDetail] Error saving animal:', err)
      showError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // Suppression
  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    Alert.alert(
      "Supprimer l'animal",
      `Etes-vous sur de vouloir supprimer ${animal?.name || animal?.identifier || animal?.tag_number || 'cet animal'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await animalsService.delete(animal!.id)
              if (error) throw error
              refreshAnimals() // Refresh temps réel
              refreshHealthCases() // Refresh santé aussi
              showSuccess('Animal supprime')
              router.back()
            } catch (err) {
              showError('Erreur lors de la suppression')
            }
          },
        },
      ]
    )
  }

  // Etats de chargement et erreur
  if (loading) {
    return <LoadingScreen message="Chargement..." />
  }

  if (error || !animal) {
    return (
      <ErrorState
        message={error || 'Animal non trouve'}
        onRetry={loadAnimal}
      />
    )
  }

  const animalUI = animalToUI(animal)
  const category = mapSexToCategory(animal.sex || 'unknown')
  const statusConfig = STATUS_CONFIG[animal.status] || STATUS_CONFIG.active
  const photoUrl = newPhotoUrl || animal.photo_url

  // Extraire le poids le plus recent
  let currentWeight: number | null = null
  if (animal.weight_history && Array.isArray(animal.weight_history) && animal.weight_history.length > 0) {
    const sorted = [...animal.weight_history].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    currentWeight = sorted[0]?.weight || null
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: animalUI.name || animalUI.identifier,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  if (isEditing) {
                    handleSave()
                  } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setIsEditing(true)
                  }
                }}
                disabled={saving}
                style={styles.headerButton}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : isEditing ? (
                  <Save size={22} color={colors.primary} />
                ) : (
                  <Edit3 size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Trash2 size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec photo */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={isEditing ? pickImage : undefined}
            disabled={!isEditing}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            ) : (
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                style={styles.photoPlaceholder}
              >
                <Camera size={40} color="#FFFFFF" />
                {isEditing && (
                  <Text style={styles.photoHint}>Ajouter une photo</Text>
                )}
              </LinearGradient>
            )}
            {isEditing && photoUrl && (
              <View style={styles.editPhotoOverlay}>
                <Camera size={24} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            {isEditing ? (
              <TextInput
                style={[styles.editInput, styles.editNameInput, { color: themeColors.text, borderColor: colors.primary }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nom de l'animal"
                placeholderTextColor={themeColors.textSecondary}
              />
            ) : (
              <Text style={[styles.animalName, { color: themeColors.text }]}>
                {animalUI.name || animalUI.identifier}
              </Text>
            )}
            <Text style={[styles.animalCategory, { color: themeColors.textSecondary }]}>
              {CATEGORY_LABELS[category] || category}
            </Text>

            {/* Badge statut - cliquable en mode édition */}
            <TouchableOpacity
              style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}
              onPress={() => {
                if (isEditing) {
                  // Cycle entre les statuts
                  const statuses = ['actif', 'vendu', 'mort', 'reforme']
                  const currentIndex = statuses.indexOf(editStatus)
                  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                  setEditStatus(nextStatus)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              }}
              disabled={!isEditing}
            >
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {isEditing ? STATUS_CONFIG[editStatus]?.label || editStatus : statusConfig.label}
                {isEditing && ' ▼'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Tags
          </Text>
          <View style={styles.tagsContainer}>
            {AVAILABLE_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag.id)
              const IconComponent = tag.icon
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: isSelected ? tag.color + '20' : themeColors.surface,
                      borderColor: isSelected ? tag.color : themeColors.border,
                    },
                  ]}
                  onPress={() => isEditing && toggleTag(tag.id)}
                  disabled={!isEditing}
                  activeOpacity={isEditing ? 0.7 : 1}
                >
                  <IconComponent
                    size={14}
                    color={isSelected ? tag.color : themeColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      { color: isSelected ? tag.color : themeColors.textSecondary },
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {!isEditing && selectedTags.length === 0 && (
            <Text style={[styles.emptyTagsText, { color: themeColors.textSecondary }]}>
              Aucun tag. Appuyez sur Modifier pour en ajouter.
            </Text>
          )}
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Informations
          </Text>

          <View style={[styles.infoCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
            {/* Identifiant (non éditable) */}
            <InfoRow
              icon={Tag}
              label="Identifiant"
              value={animal.identifier || animal.tag_number || 'N/A'}
              themeColors={themeColors}
            />

            {/* Race (éditable) */}
            {isEditing ? (
              <View style={styles.editRow}>
                <Tag size={18} color={themeColors.textSecondary} />
                <Text style={[styles.editLabel, { color: themeColors.textSecondary }]}>Race</Text>
                <TextInput
                  style={[styles.editRowInput, { color: themeColors.text, borderColor: themeColors.border }]}
                  value={editBreed}
                  onChangeText={setEditBreed}
                  placeholder="Ex: Large White"
                  placeholderTextColor={themeColors.textSecondary}
                />
              </View>
            ) : (
              <InfoRow
                icon={Tag}
                label="Race"
                value={animal.breed || 'Non renseignee'}
                themeColors={themeColors}
              />
            )}

            {/* Date naissance (affichage seul) */}
            <InfoRow
              icon={Calendar}
              label="Date de naissance"
              value={animal.birth_date ? new Date(animal.birth_date).toLocaleDateString('fr-FR') : 'Non renseignee'}
              themeColors={themeColors}
            />

            {/* Poids (éditable) */}
            {isEditing ? (
              <View style={[styles.editRow, { borderBottomWidth: 0 }]}>
                <Scale size={18} color={themeColors.textSecondary} />
                <Text style={[styles.editLabel, { color: themeColors.textSecondary }]}>Poids (kg)</Text>
                <TextInput
                  style={[styles.editRowInput, { color: themeColors.text, borderColor: themeColors.border }]}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  placeholder="Ex: 150"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <InfoRow
                icon={Scale}
                label="Poids"
                value={currentWeight ? `${currentWeight} kg` : 'Non renseigne'}
                themeColors={themeColors}
                isLast
              />
            )}
          </View>
        </View>

        {/* Notes (toujours visible, éditable) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Notes
          </Text>
          <View style={[styles.notesCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
            {isEditing ? (
              <TextInput
                style={[styles.editNotesInput, { color: themeColors.text }]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Ajoutez des notes sur cet animal..."
                placeholderTextColor={themeColors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={[styles.notesText, { color: themeColors.text }]}>
                {animal.notes?.replace(/#\w+\s*/g, '').trim() || 'Aucune note pour cet animal.'}
              </Text>
            )}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Actions rapides
          </Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon={Stethoscope}
              label="Cas sante"
              color="#EF4444"
              themeColors={themeColors}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/health/add')
              }}
            />
            <ActionButton
              icon={Heart}
              label="Reproduction"
              color="#EC4899"
              themeColors={themeColors}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/reproduction/add')
              }}
            />
            <ActionButton
              icon={UtensilsCrossed}
              label="Alimentation"
              color="#F59E0B"
              themeColors={themeColors}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/feeding')
              }}
            />
            <ActionButton
              icon={DollarSign}
              label="Cout"
              color="#10B981"
              themeColors={themeColors}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/costs/add')
              }}
            />
          </View>
        </View>

        {/* Bouton supprimer */}
        {isEditing && (
          <View style={styles.deleteSection}>
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: colors.error }]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color={colors.error} />
              <Text style={[styles.deleteButtonText, { color: colors.error }]}>
                Supprimer cet animal
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  )
}

// Composants helper
const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, themeColors, isLast = false }) => {
  return (
    <View style={[styles.infoRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColors.border }]}>
      <View style={styles.infoRowLeft}>
        <Icon size={18} color={themeColors.textSecondary} />
        <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: themeColors.text }]}>{value}</Text>
    </View>
  )
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, color, themeColors, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: themeColors.surface }, elevation.sm]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: themeColors.text }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSize.body,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    fontSize: typography.fontSize.small,
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  editPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  animalName: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
  },
  animalCategory: {
    fontSize: typography.fontSize.body,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
  },
  emptyTagsText: {
    fontSize: typography.fontSize.body,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  infoCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.body,
  },
  infoValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  notesCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  notesText: {
    fontSize: typography.fontSize.body,
    lineHeight: 22,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
  },
  deleteSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  // Styles pour les champs éditables
  editInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.body,
  },
  editNameInput: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    minWidth: 200,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: spacing.sm,
  },
  editLabel: {
    fontSize: typography.fontSize.body,
    width: 80,
  },
  editRowInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.body,
  },
  editNotesInput: {
    fontSize: typography.fontSize.body,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bottomSpacer: {
    height: 100,
  },
})
