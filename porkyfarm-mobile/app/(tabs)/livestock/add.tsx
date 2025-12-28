import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { animalsService, mapCategoryToSex, type AnimalInsert } from '../../../services/animals'
import { requestMediaLibraryPermission, requestCameraPermission } from '../../../lib/permissions'

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
    status: 'active',
    notes: null,
    photo_url: null,
  })
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const router = useRouter()

  const handlePickImage = async () => {
    const permission = await requestMediaLibraryPermission()
    if (!permission.granted) {
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      console.error('Error picking image:', err)
      Alert.alert('Erreur', 'Impossible de charger la photo')
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
      console.error('Error taking photo:', err)
      Alert.alert('Erreur', 'Impossible de prendre la photo')
      setUploadingPhoto(false)
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setFormData({ ...formData, photo_url: null })
  }

  const handleSubmit = async () => {
    if (!formData.tag_number) {
      Alert.alert('Erreur', 'Le numéro d\'identification est obligatoire')
      return
    }

    if (!formData.category) {
      Alert.alert('Erreur', 'La catégorie est obligatoire')
      return
    }

    setLoading(true)
    try {
      // Mapper category vers sex et préparer weight_history
      const sex = mapCategoryToSex(formData.category)
      const weightHistory = formData.weight
        ? [{ date: new Date().toISOString().split('T')[0], weight: formData.weight }]
        : null

      // Créer l'objet AnimalInsert avec les bonnes colonnes
      const animalData: AnimalInsert = {
        tag_number: formData.tag_number,
        birth_date: formData.birth_date || null,
        sex,
        breed: formData.breed || null,
        status: formData.status || 'active',
        weight_history: weightHistory,
        photo_url: formData.photo_url || null,
        notes: formData.notes || null,
      }

      const { data, error } = await animalsService.create(animalData)
      if (error) {
        console.error('Error creating animal:', error)
        Alert.alert(
          'Erreur',
          error.message || 'Impossible d\'enregistrer l\'animal. Vérifiez votre connexion ou réessayez.'
        )
      } else {
        Alert.alert('Succès', 'Animal ajouté avec succès', [
          { text: 'OK', onPress: () => router.back() },
        ])
      }
    } catch (err: any) {
      console.error('Uncaught error creating animal:', err)
      Alert.alert(
        'Erreur',
        err?.message || 'Une erreur est survenue lors de l\'ajout de l\'animal. Vérifiez votre connexion ou réessayez.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajouter un animal</Text>
      </View>

      <View style={styles.form}>
        {/* Photo */}
        <Text style={styles.label}>Photo de l'animal</Text>
        <View style={styles.photoSection}>
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
                <Text style={styles.removePhotoText}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
              <Text style={styles.photoPlaceholderLabel}>Aucune photo</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={[styles.photoButton, uploadingPhoto && styles.photoButtonDisabled]}
              onPress={handlePickImage}
              disabled={uploadingPhoto}
            >
              <Text style={styles.photoButtonText}>📁 Galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoButton, uploadingPhoto && styles.photoButtonDisabled]}
              onPress={handleTakePhoto}
              disabled={uploadingPhoto}
            >
              <Text style={styles.photoButtonText}>📷 Prendre photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Numéro d'identification *</Text>
        <TextInput
          style={styles.input}
          value={formData.tag_number}
          onChangeText={(text) => setFormData({ ...formData, tag_number: text })}
          placeholder="Ex: TRUIE-001"
        />

        <Text style={styles.label}>Nom (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={formData.name || ''}
          onChangeText={(text) => setFormData({ ...formData, name: text || null })}
          placeholder="Ex: Bella"
        />

        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.categoryContainer}>
          {(['sow', 'boar', 'piglet', 'fattening'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, formData.category === cat && styles.categoryButtonActive]}
              onPress={() => setFormData({ ...formData, category: cat })}
            >
              <Text
                style={[styles.categoryButtonText, formData.category === cat && styles.categoryButtonTextActive]}
              >
                {cat === 'sow' ? 'Truie' : cat === 'boar' ? 'Verrat' : cat === 'piglet' ? 'Porcelet' : 'Porc d\'engraissement'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Race</Text>
        <TextInput
          style={styles.input}
          value={formData.breed || ''}
          onChangeText={(text) => setFormData({ ...formData, breed: text || null })}
          placeholder="Ex: Large White"
        />

        <Text style={styles.label}>Date de naissance</Text>
        <TextInput
          style={styles.input}
          value={formData.birth_date || ''}
          onChangeText={(text) => setFormData({ ...formData, birth_date: text || null })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Poids (kg)</Text>
        <TextInput
          style={styles.input}
          value={formData.weight?.toString() || ''}
          onChangeText={(text) =>
            setFormData({ ...formData, weight: text ? parseFloat(text) : null })
          }
          keyboardType="numeric"
          placeholder="Ex: 150"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes || ''}
          onChangeText={(text) => setFormData({ ...formData, notes: text || null })}
          placeholder="Notes supplémentaires..."
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#2d6a4f',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPlaceholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  photoPlaceholderLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonDisabled: {
    opacity: 0.5,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
