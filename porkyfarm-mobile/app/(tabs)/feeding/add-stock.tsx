import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { feedingService, type FeedStockInsert } from '../../../services/feeding'

export default function AddStockScreen() {
  const [formData, setFormData] = useState<FeedStockInsert>({
    feed_type: '',
    quantity_kg: 0,
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!formData.feed_type || !formData.quantity_kg || formData.quantity_kg <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const { error } = await feedingService.addStock(formData)
      if (error) {
        Alert.alert('Erreur', error.message || 'Erreur lors de l\'ajout')
      } else {
        Alert.alert('Succès', 'Aliment ajouté au stock', [
          { text: 'OK', onPress: () => router.back() },
        ])
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajouter au stock</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Type d'aliment *</Text>
        <TextInput
          style={styles.input}
          value={formData.feed_type}
          onChangeText={(text) => setFormData({ ...formData, feed_type: text })}
          placeholder="Ex: Aliment complet, Maïs, Soja..."
        />

        <Text style={styles.label}>Quantité (kg) *</Text>
        <TextInput
          style={styles.input}
          value={formData.quantity_kg.toString()}
          onChangeText={(text) => setFormData({ ...formData, quantity_kg: parseFloat(text) || 0 })}
          keyboardType="numeric"
          placeholder="Ex: 100"
        />

        <Text style={styles.label}>Prix unitaire (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={formData.unit_price?.toString() || ''}
          onChangeText={(text) => setFormData({ ...formData, unit_price: parseFloat(text) || null })}
          keyboardType="numeric"
          placeholder="Ex: 500"
        />

        <Text style={styles.label}>Fournisseur (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={formData.supplier || ''}
          onChangeText={(text) => setFormData({ ...formData, supplier: text })}
          placeholder="Nom du fournisseur"
        />

        <Text style={styles.label}>Date d'achat</Text>
        <TextInput
          style={styles.input}
          value={formData.purchase_date || ''}
          onChangeText={(text) => setFormData({ ...formData, purchase_date: text })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Date d'expiration (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={formData.expiry_date || ''}
          onChangeText={(text) => setFormData({ ...formData, expiry_date: text || null })}
          placeholder="YYYY-MM-DD"
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
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
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

