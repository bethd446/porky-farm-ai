import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { healthCasesService, type HealthCaseInsert } from '../../../services/healthCases'
import { animalsService, type Animal } from '../../../services/animals'
import { animalToUI } from '../../../lib/animalHelpers'
import { offlineQueue } from '../../../lib/offlineQueue'
import { useSyncQueue } from '../../../hooks/useSyncQueue'

export default function AddHealthCaseScreen() {
  const [formData, setFormData] = useState<HealthCaseInsert>({
    pig_id: '',
    title: '',
    description: '',
    severity: 'medium',
    status: 'ongoing',
    start_date: new Date().toISOString().split('T')[0],
  })
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAnimals, setLoadingAnimals] = useState(true)
  const router = useRouter()
  const { isOnline, pendingCount } = useSyncQueue()

  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    setLoadingAnimals(true)
    const { data } = await animalsService.getAll()
    setAnimals(data || [])
    setLoadingAnimals(false)
  }

  const handleSubmit = async () => {
    if (!formData.pig_id || !formData.title || !formData.description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      if (!isOnline) {
        // Mode offline : enregistrer dans la queue
        await offlineQueue.enqueue({
          type: 'CREATE_HEALTH_CASE',
          payload: formData,
          endpoint: '/api/health-cases',
          method: 'POST',
        })

        Alert.alert(
          'Enregistré hors ligne',
          'Votre cas de santé sera synchronisé automatiquement dès que la connexion sera rétablie.',
          [{ text: 'OK', onPress: () => router.back() }],
        )
      } else {
        // Mode online : envoi direct
        const { error } = await healthCasesService.create(formData)

        if (error) {
          // Si erreur réseau, essayer d'enregistrer dans la queue
          if (error.message?.includes('réseau') || error.message?.includes('network')) {
            await offlineQueue.enqueue({
              type: 'CREATE_HEALTH_CASE',
              payload: formData,
              endpoint: '/api/health-cases',
              method: 'POST',
            })

            Alert.alert(
              'Enregistré hors ligne',
              'Erreur de connexion. Votre cas sera synchronisé dès que possible.',
              [{ text: 'OK', onPress: () => router.back() }],
            )
          } else {
            Alert.alert('Erreur', error.message || 'Erreur lors de la création')
          }
        } else {
          Alert.alert('Succès', 'Cas de santé créé avec succès', [
            { text: 'OK', onPress: () => router.back() },
          ])
        }
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loadingAnimals) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouveau cas de santé</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Animal *</Text>
        <View style={styles.animalSelector}>
          {animals.length === 0 ? (
            <Text style={styles.emptyAnimalsText}>Aucun animal disponible. Ajoutez d'abord un animal.</Text>
          ) : (
            animals.map((animal) => {
              const animalUI = animalToUI(animal)
              return (
                <TouchableOpacity
                  key={animal.id}
                  style={[styles.animalOption, formData.pig_id === animal.id && styles.animalOptionSelected]}
                  onPress={() => setFormData({ ...formData, pig_id: animal.id })}
                >
                  <Text style={[styles.animalOptionText, formData.pig_id === animal.id && styles.animalOptionTextSelected]}>
                    {animalUI.name || animalUI.identifier}
                  </Text>
                </TouchableOpacity>
              )
            })
          )}
        </View>

        <Text style={styles.label}>Titre du cas *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="Ex: Fièvre, Toux..."
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description || ''}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Détails du cas..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Sévérité</Text>
        <View style={styles.priorityContainer}>
          {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
            <TouchableOpacity
              key={severity}
              style={[styles.priorityButton, formData.severity === severity && styles.priorityButtonActive]}
              onPress={() => setFormData({ ...formData, severity })}
            >
              <Text
                style={[
                  styles.priorityButtonText,
                  formData.severity === severity && styles.priorityButtonTextActive,
                ]}
              >
                {severity === 'low' ? 'Faible' : severity === 'medium' ? 'Moyenne' : severity === 'high' ? 'Haute' : 'Critique'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date de début</Text>
        <TextInput
          style={styles.input}
          value={formData.start_date || ''}
          onChangeText={(text) => setFormData({ ...formData, start_date: text })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Traitement (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.treatment || ''}
          onChangeText={(text) => setFormData({ ...formData, treatment: text })}
          placeholder="Détails du traitement..."
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Vétérinaire (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={formData.veterinarian || ''}
          onChangeText={(text) => setFormData({ ...formData, veterinarian: text })}
          placeholder="Nom du vétérinaire"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  animalSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyAnimalsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 12,
  },
  animalOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  animalOptionSelected: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  animalOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  animalOptionTextSelected: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  priorityButtonActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  priorityButtonTextActive: {
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
