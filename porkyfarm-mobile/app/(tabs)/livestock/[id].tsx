import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { animalsService, type Animal, mapSexToCategory } from '../../../services/animals'
import { animalToUI } from '../../../lib/animalHelpers'

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadAnimal()
    }
  }, [id])

  const loadAnimal = async () => {
    if (!id) return
    setLoading(true)
    const { data, error } = await animalsService.getById(id)
    if (error) {
      console.error('Error loading animal:', error)
    } else {
      setAnimal(data)
    }
    setLoading(false)
  }

  const getCategoryLabel = (sex: string) => {
    const category = mapSexToCategory(sex)
    const labels: Record<string, string> = {
      sow: 'Truie',
      boar: 'Verrat',
      piglet: 'Porcelet',
      fattening: 'Porc',
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!animal) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Animal non trouvé</Text>
      </View>
    )
  }

  const animalUI = animalToUI(animal)
  // Extraire le poids le plus récent
  let currentWeight: number | null = null
  if (animal.weight_history && Array.isArray(animal.weight_history) && animal.weight_history.length > 0) {
    const sorted = [...animal.weight_history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    currentWeight = sorted[0]?.weight || null
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{animalUI.name || animalUI.identifier}</Text>
        <Text style={styles.subtitle}>{getCategoryLabel(animal.sex)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <InfoRow label="Identifiant" value={animal.tag_number} />
          <InfoRow label="Race" value={animal.breed || 'Non renseigné'} />
          <InfoRow label="Date de naissance" value={animal.birth_date || 'Non renseigné'} />
          <InfoRow label="Poids" value={currentWeight ? `${currentWeight} kg` : 'Non renseigné'} />
          <InfoRow label="Statut" value={animal.status} />
        </View>

        {animal.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{animal.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
})
