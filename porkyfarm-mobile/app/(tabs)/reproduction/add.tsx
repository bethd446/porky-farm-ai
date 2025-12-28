import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { gestationsService, type GestationInsert, calculateExpectedFarrowingDate } from '../../../services/gestations'
import { animalsService, type Animal } from '../../../services/animals'
import { offlineQueue } from '../../../lib/offlineQueue'
import { useSyncQueue } from '../../../hooks/useSyncQueue'

export default function AddGestationScreen() {
  const [formData, setFormData] = useState<GestationInsert>({
    sow_id: '',
    boar_id: null,
    mating_date: new Date().toISOString().split('T')[0],
    status: 'pregnant',
  })
  const [sows, setSows] = useState<Animal[]>([])
  const [boars, setBoars] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAnimals, setLoadingAnimals] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    setLoadingAnimals(true)
    const { data } = await animalsService.getAll()
    const allAnimals = data || []
    setSows(allAnimals.filter((a) => a.category === 'sow'))
    setBoars(allAnimals.filter((a) => a.category === 'boar'))
    setLoadingAnimals(false)
  }

  const handleSubmit = async () => {
    if (!formData.sow_id || !formData.mating_date) {
      Alert.alert('Erreur', 'Veuillez sélectionner une truie et une date de saillie')
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
        Alert.alert('Erreur', error.message || 'Erreur lors de la création')
      } else {
        Alert.alert('Succès', 'Gestation enregistrée avec succès', [
          { text: 'OK', onPress: () => router.back() },
        ])
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
        <Text style={styles.title}>Nouvelle saillie</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Truie *</Text>
        {sows.length === 0 ? (
          <Text style={styles.hint}>Aucune truie disponible. Ajoutez d'abord une truie dans le cheptel.</Text>
        ) : (
          <View style={styles.animalSelector}>
            {sows.map((sow) => (
              <TouchableOpacity
                key={sow.id}
                style={[styles.animalOption, formData.sow_id === sow.id && styles.animalOptionSelected]}
                onPress={() => setFormData({ ...formData, sow_id: sow.id })}
              >
                <Text style={[styles.animalOptionText, formData.sow_id === sow.id && styles.animalOptionTextSelected]}>
                  {sow.name || sow.identifier}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Verrat (optionnel)</Text>
        <View style={styles.animalSelector}>
          <TouchableOpacity
            style={[styles.animalOption, !formData.boar_id && styles.animalOptionSelected]}
            onPress={() => setFormData({ ...formData, boar_id: null })}
          >
            <Text style={[styles.animalOptionText, !formData.boar_id && styles.animalOptionTextSelected]}>
              Aucun
            </Text>
          </TouchableOpacity>
          {boars.map((boar) => (
            <TouchableOpacity
              key={boar.id}
              style={[styles.animalOption, formData.boar_id === boar.id && styles.animalOptionSelected]}
              onPress={() => setFormData({ ...formData, boar_id: boar.id })}
            >
              <Text style={[styles.animalOptionText, formData.boar_id === boar.id && styles.animalOptionTextSelected]}>
                {boar.name || boar.identifier}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date de saillie *</Text>
        <TextInput
          style={styles.input}
          value={formData.mating_date}
          onChangeText={(text) => setFormData({ ...formData, mating_date: text })}
          placeholder="YYYY-MM-DD"
        />
        <Text style={styles.hint}>La date de mise-bas sera calculée automatiquement (114 jours)</Text>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes || ''}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Notes supplémentaires..."
          multiline
          numberOfLines={3}
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  animalSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
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
