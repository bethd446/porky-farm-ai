import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { animalsService, type Animal, mapSexToCategory } from '../../../services/animals'
import { animalToUI, type AnimalUI } from '../../../lib/animalHelpers'

export default function LivestockScreen() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    setLoading(true)
    const { data, error } = await animalsService.getAll()
    if (error) {
      console.error('Error loading animals:', error)
    } else {
      setAnimals(data || [])
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Cheptel</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/livestock/add')}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {animals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucun animal enregistré</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/livestock/add')}
          >
            <Text style={styles.addButtonText}>Ajouter mon premier animal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const animalUI = animalToUI(item)
            return (
              <TouchableOpacity
                style={styles.animalCard}
                onPress={() => router.push(`/(tabs)/livestock/${item.id}`)}
              >
                <Text style={styles.animalName}>{animalUI.name || animalUI.identifier}</Text>
                <Text style={styles.animalInfo}>
                  {getCategoryLabel(item.sex)} • {item.status}
                </Text>
              </TouchableOpacity>
            )
          }}
          refreshing={loading}
          onRefresh={loadAnimals}
        />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  animalCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  animalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  animalInfo: {
    fontSize: 14,
    color: '#666',
  },
})
