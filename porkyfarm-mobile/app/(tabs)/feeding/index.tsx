import { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { feedingService, type FeedStock } from '../../../services/feeding'

export default function FeedingScreen() {
  const [stock, setStock] = useState<FeedStock[]>([])
  const [loading, setLoading] = useState(true)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorWeight, setCalculatorWeight] = useState('')
  const [calculatorCategory, setCalculatorCategory] = useState('fattening')
  const [calculatorResult, setCalculatorResult] = useState<{ dailyRation: number; weeklyRation: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadStock()
  }, [])

  const loadStock = async () => {
    setLoading(true)
    const { data, error } = await feedingService.getStock()
    if (error) {
      console.error('Error loading stock:', error)
      // Ne pas afficher d'alerte si c'est juste une liste vide
      if (error.message && !error.message.includes('does not exist')) {
        Alert.alert('Erreur', 'Impossible de charger le stock')
      }
    } else {
      setStock(data || [])
    }
    setLoading(false)
  }

  const handleCalculate = async () => {
    const weight = parseFloat(calculatorWeight)
    if (!weight || weight <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un poids valide')
      return
    }

    const result = await feedingService.calculateRation(weight, calculatorCategory)
    setCalculatorResult(result)
  }

  const totalStock = stock.reduce((sum, item) => sum + item.quantity_kg, 0)

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alimentation</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/feeding/add-stock')}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Stock Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stock d'aliments</Text>
          </View>
          <View style={styles.totalStock}>
            <Text style={styles.totalStockLabel}>Total en stock:</Text>
            <Text style={styles.totalStockValue}>{totalStock.toFixed(2)} kg</Text>
          </View>

          {stock.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun aliment en stock</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/feeding/add-stock')}
              >
                <Text style={styles.addButtonText}>Ajouter du stock</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={stock}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <Text style={styles.stockType}>{item.feed_type}</Text>
                    <Text style={styles.stockQuantity}>{item.quantity_kg.toFixed(2)} kg</Text>
                  </View>
                  {item.supplier && <Text style={styles.stockSupplier}>Fournisseur: {item.supplier}</Text>}
                  {item.expiry_date && (
                    <Text style={styles.stockExpiry}>
                      Expire: {new Date(item.expiry_date).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Calculator Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.calculatorToggle}
            onPress={() => setShowCalculator(!showCalculator)}
          >
            <Text style={styles.calculatorToggleText}>
              {showCalculator ? '▼' : '▶'} Calculateur de ration
            </Text>
          </TouchableOpacity>

          {showCalculator && (
            <View style={styles.calculator}>
              <Text style={styles.label}>Poids de l'animal (kg)</Text>
              <TextInput
                style={styles.input}
                value={calculatorWeight}
                onChangeText={setCalculatorWeight}
                keyboardType="numeric"
                placeholder="Ex: 150"
              />

              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.categoryContainer}>
                {(['sow', 'boar', 'piglet', 'fattening'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryButton, calculatorCategory === cat && styles.categoryButtonActive]}
                    onPress={() => setCalculatorCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        calculatorCategory === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat === 'sow' ? 'Truie' : cat === 'boar' ? 'Verrat' : cat === 'piglet' ? 'Porcelet' : 'Porc'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
                <Text style={styles.calculateButtonText}>Calculer</Text>
              </TouchableOpacity>

              {calculatorResult && (
                <View style={styles.result}>
                  <Text style={styles.resultTitle}>Ration recommandée:</Text>
                  <Text style={styles.resultValue}>
                    {calculatorResult.dailyRation} kg/jour
                  </Text>
                  <Text style={styles.resultValue}>
                    {calculatorResult.weeklyRation} kg/semaine
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  totalStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  totalStockLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
  },
  totalStockValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  stockCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  stockQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  stockSupplier: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  stockExpiry: {
    fontSize: 14,
    color: '#f59e0b',
  },
  calculatorToggle: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calculatorToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  calculator: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
  calculateButton: {
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 4,
  },
})
