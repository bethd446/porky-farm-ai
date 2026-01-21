import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { animalsService, mapUICategoryToDBCategory, type AnimalInsert } from '../../../services/animals'
import { requestMediaLibraryPermission, requestCameraPermission } from '../../../lib/permissions'
import { ScreenContainer, TextField, AnimalCategoryGrid, PrimaryButton, SecondaryButton, ScreenHeader, DatePicker } from '../../../components/ui'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { Wording } from '../../../lib/constants/wording'
import { useToast } from '../../../hooks/useToast'
import { useRefresh } from '../../../contexts/RefreshContext'
import { Image as ImageIcon, Camera } from 'lucide-react-native'
import { getTodayISO, toISODateString } from '../../../lib/dateUtils'
import { logger } from '../../../lib/logger'

export default function AddAnimalScreen() {
  const [formData, setFormData] = useState<{
    tag_number: string
    name: string | null
    category: 'sow' | 'boar' | 'piglet' | 'fattening' // Pour l'UI
    breed: string | null
    birth_date: string | null
    weight: number | null // Pour l'UI, sera converti en weight_history
    status: string
    notes: string | null
    photo_url: string | null
  }>({
    tag_number: '',
    name: null,
    category: 'fattening',
    breed: null,
    birth_date: null,
    weight: null,
    status: 'actif',
    notes: null,
    photo_url: null,
  })

  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const router = useRouter()
  const { toast, showError, showSuccess, hideToast } = useToast()
  const { refreshAnimals } = useRefresh()

  const handlePickImage = async () => {
    const permission = await requestMediaLibraryPermission()
    if (!permission.granted) {
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true)
        const asset = result.assets[0]
        const response = await fetch(asset.uri)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          setPhoto(base64)
          setFormData({ ...formData, photo_url: base64 })
          setUploadingPhoto(false)
        }
        reader.readAsDataURL(blob)
      }
    } catch (err) {
      logger.error('Error picking image:', err)
      showError('Impossible de charger la photo')
      setUploadingPhoto(false)
    }
  }

  const handleTakePhoto = async () => {
    const permission = await requestCameraPermission()
    if (!permission.granted) {
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true)
        const asset = result.assets[0]
        const response = await fetch(asset.uri)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          setPhoto(base64)
          setFormData({ ...formData, photo_url: base64 })
          setUploadingPhoto(false)
        }
        reader.readAsDataURL(blob)
      }
    } catch (err) {
      logger.error('Error taking photo:', err)
      showError('Impossible de prendre la photo')
      setUploadingPhoto(false)
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setFormData({ ...formData, photo_url: null })
  }

  const handleSubmit = async () => {
    // Validation stricte
    const trimmedTagNumber = formData.tag_number.trim()
    if (!trimmedTagNumber || trimmedTagNumber.length === 0) {
      showError('Le numéro d\'identification est obligatoire')
      return
    }

    if (trimmedTagNumber.length > 50) {
      showError('Le numéro d\'identification ne peut pas dépasser 50 caractères')
      return
    }

    if (!formData.category) {
      showError('La catégorie est obligatoire')
      return
    }

    // Validation du poids si fourni
    if (formData.weight !== null && formData.weight !== undefined) {
      if (isNaN(formData.weight) || formData.weight < 0 || formData.weight > 1000) {
        showError('Le poids doit être un nombre entre 0 et 1000 kg')
        return
      }
    }

    setLoading(true)
    try {
      // Mapper category UI vers category DB (français)
      const dbCategory = mapUICategoryToDBCategory(formData.category)

      // Déterminer le sex basé sur la catégorie (DB n'accepte que male/female)
      let sex: 'male' | 'female' = 'male' // Défaut
      if (formData.category === 'sow') {
        sex = 'female'
      } else if (formData.category === 'boar') {
        sex = 'male'
      }
      // Pour piglet et fattening, on garde 'male' par défaut

      const weightHistory = formData.weight
        ? [{ date: getTodayISO(), weight: formData.weight }]
        : null

      // Créer l'objet AnimalInsert avec les bonnes colonnes
      const animalData: AnimalInsert = {
        tag_number: trimmedTagNumber,
        identifier: trimmedTagNumber, // Identifier = tag_number pour compatibilité
        name: formData.name?.trim() || null,
        birth_date: formData.birth_date || null,
        category: dbCategory,
        sex: sex, // DB n'accepte que 'male' ou 'female'
        gender: sex, // Même valeur que sex
        breed: formData.breed?.trim() || null,
        status: formData.status || 'actif',
        weight_kg: formData.weight || null, // Ajouter weight_kg directement
        weight_history: weightHistory,
        photo_url: formData.photo_url || null,
        notes: formData.notes?.trim() || null,
      }

      const { data, error } = await animalsService.create(animalData)
      if (error) {
        logger.error('[AddAnimal] Error creating animal:', error)
        
        // Messages d'erreur plus explicites
        let errorMessage = 'Impossible d\'enregistrer l\'animal.'
        if (error.message) {
          if (error.message.includes('duplicate') || error.message.includes('unique') || error.message.includes('violates unique')) {
            errorMessage = 'Ce numéro d\'identification existe déjà. Veuillez en choisir un autre.'
          } else if (error.message.includes('null value') || error.message.includes('NOT NULL')) {
            errorMessage = 'Certaines informations obligatoires sont manquantes. Veuillez vérifier le formulaire.'
          } else if (error.message.includes('permission') || error.message.includes('RLS') || error.message.includes('42501')) {
            errorMessage = 'Erreur de permissions. Veuillez vous reconnecter.'
          } else if (error.message.includes('check constraint') || error.message.includes('CHECK')) {
            errorMessage = 'Une valeur saisie n\'est pas valide. Veuillez vérifier les données.'
          } else {
            errorMessage = error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message
          }
        }
        
        showError(errorMessage)
      } else {
        showSuccess('Animal ajouté avec succès')
        refreshAnimals()
        setTimeout(() => router.back(), 1000)
      }
    } catch (err: unknown) {
      logger.error('Uncaught error creating animal:', err)
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'ajout de l\'animal.'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title="Ajouter un animal" showBack onBack={() => router.back()} />

      <View style={styles.form}>
        {/* Photo */}
        <Text style={styles.label}>Photo de l'animal</Text>
        <View style={styles.photoSection}>
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
              <Text style={styles.photoPlaceholderLabel}>Aucune photo</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <SecondaryButton
              title="Galerie"
              onPress={handlePickImage}
              disabled={uploadingPhoto || loading}
              loading={uploadingPhoto}
              fullWidth={false}
              style={styles.photoButton}
              icon={<ImageIcon size={18} color={colors.primary} />}
            />
            <SecondaryButton
              title="Prendre photo"
              onPress={handleTakePhoto}
              disabled={uploadingPhoto || loading}
              loading={uploadingPhoto}
              fullWidth={false}
              style={styles.photoButton}
              icon={<Camera size={18} color={colors.primary} />}
            />
          </View>
        </View>

        <TextField
          label="Numéro d'identification *"
          value={formData.tag_number}
          onChangeText={(text) => setFormData({ ...formData, tag_number: text })}
          placeholder="Ex: TRUIE-001"
          maxLength={50}
        />

        <TextField
          label="Nom (optionnel)"
          value={formData.name || ''}
          onChangeText={(text) => setFormData({ ...formData, name: text.trim() || null })}
          placeholder="Ex: Bella"
          maxLength={100}
        />

        <AnimalCategoryGrid
          label="Catégorie *"
          options={[
            { label: Wording.categories.sow, value: 'sow' },
            { label: Wording.categories.boar, value: 'boar' },
            { label: Wording.categories.piglet, value: 'piglet' },
            { label: Wording.categories.fattening, value: 'fattening' },
          ]}
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value as typeof formData.category })}
        />

        <TextField
          label="Race"
          value={formData.breed || ''}
          onChangeText={(text) => setFormData({ ...formData, breed: text.trim() || null })}
          placeholder="Ex: Large White"
          maxLength={100}
        />

        <DatePicker
          label="Date de naissance"
          value={formData.birth_date}
          onChange={(date) => setFormData({ ...formData, birth_date: date ? toISODateString(date) : null })}
          maximumDate={new Date()}
          helperText="Sélectionnez la date de naissance de l'animal"
        />

        <TextField
          label="Poids (kg)"
          value={formData.weight?.toString() || ''}
          onChangeText={(text) => {
            const trimmed = text.trim()
            if (trimmed === '') {
              setFormData({ ...formData, weight: null })
            } else {
              const num = parseFloat(trimmed)
              if (!isNaN(num) && num >= 0 && num <= 1000) {
                setFormData({ ...formData, weight: num })
              }
            }
          }}
          keyboardType="decimal-pad"
          placeholder="Ex: 150"
        />

        <TextField
          label="Notes"
          value={formData.notes || ''}
          onChangeText={(text) => setFormData({ ...formData, notes: text.trim() || null })}
          placeholder="Notes supplémentaires..."
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <PrimaryButton
          title={loading ? 'Enregistrement...' : 'Enregistrer'}
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  form: {
    padding: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  photoSection: {
    marginBottom: spacing.xl,
  },
  photoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...elevation.sm,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoPlaceholderText: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  photoPlaceholderLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
})
