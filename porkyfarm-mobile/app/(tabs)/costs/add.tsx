/**
 * Écran formulaire ajout dépense/entrée
 */

import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { costsService, type CostEntryInsert, type CostCategory } from '../../../services/costs'
import { offlineQueue } from '../../../lib/offlineQueue'
import { useSyncQueue } from '../../../hooks/useSyncQueue'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'

// Catégories alignées sur le schéma Supabase : 'sale','feed','veterinary','equipment','labor','other'
// Mapping des catégories UI vers DB
const CATEGORIES: { value: CostCategory; label: string; icon: string }[] = [
  { value: 'feed', label: 'Aliment', icon: '🌾' },
  { value: 'veterinary', label: 'Vétérinaire', icon: '🏥' },
  { value: 'equipment', label: 'Équipement', icon: '🔧' },
  { value: 'labor', label: 'Main d\'œuvre', icon: '👷' },
  { value: 'sale', label: 'Vente', icon: '💰' },
  { value: 'other', label: 'Autre', icon: '📝' },
]

export default function AddCostScreen() {
  const router = useRouter()
  const { isOnline } = useSyncQueue()
  const [formData, setFormData] = useState<CostEntryInsert>({
    type: 'expense',
    category: 'other',
    amount: 0,
    description: null,
    transaction_date: new Date().toISOString().split('T')[0],
    notes: null,
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie')
      return
    }

    if (formData.amount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être supérieur à 0')
      return
    }

    setLoading(true)
    try {
      if (!isOnline) {
        // Mode offline : enregistrer dans la queue
        await offlineQueue.enqueue({
          type: 'CREATE_COST',
          payload: formData,
          endpoint: '/api/costs',
          method: 'POST',
        })

        Alert.alert(
          'Enregistré hors ligne',
          'Votre transaction sera synchronisée automatiquement dès que la connexion sera rétablie.',
          [{ text: 'OK', onPress: () => router.back() }],
        )
      } else {
        // Mode online : envoi direct
        const { error } = await costsService.create(formData)

        if (error) {
          if (error.message?.includes('réseau') || error.message?.includes('network')) {
            await offlineQueue.enqueue({
              type: 'CREATE_COST',
              payload: formData,
              endpoint: '/api/costs',
              method: 'POST',
            })

            Alert.alert(
              'Enregistré hors ligne',
              'Erreur de connexion. Votre transaction sera synchronisée dès que possible.',
              [{ text: 'OK', onPress: () => router.back() }],
            )
          } else {
            Alert.alert('Erreur', error.message || 'Erreur lors de la création')
          }
        } else {
          Alert.alert('Succès', 'Transaction enregistrée avec succès', [
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {formData.type === 'expense' ? 'Nouvelle dépense' : 'Nouvelle entrée'}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Type */}
        <Text style={styles.label}>Type *</Text>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeButton, formData.type === 'expense' && styles.typeButtonActive]}
            onPress={() => setFormData({ ...formData, type: 'expense' })}
          >
            <Text
              style={[
                styles.typeButtonText,
                formData.type === 'expense' && styles.typeButtonTextActive,
              ]}
            >
              Dépense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, formData.type === 'income' && styles.typeButtonActive]}
            onPress={() => setFormData({ ...formData, type: 'income' })}
          >
            <Text
              style={[
                styles.typeButtonText,
                formData.type === 'income' && styles.typeButtonTextActive,
              ]}
            >
              Entrée
            </Text>
          </TouchableOpacity>
        </View>

        {/* Catégorie */}
        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.filter((cat) => {
            // Filtrer selon le type
            if (formData.type === 'expense') {
              return cat.value !== 'sale' // Les dépenses ne peuvent pas être 'sale'
            } else {
              return cat.value === 'sale' || cat.value === 'other' // Les entrées sont 'sale' ou 'other'
            }
          }).map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryButton,
                formData.category === cat.value && styles.categoryButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, category: cat.value })}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  formData.category === cat.value && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Montant */}
        <Text style={styles.label}>Montant (FCFA) *</Text>
        <TextInput
          style={commonStyles.input}
          value={formData.amount.toString()}
          onChangeText={(text) => {
            const num = parseFloat(text) || 0
            setFormData({ ...formData, amount: num })
          }}
          keyboardType="numeric"
          placeholder="0"
        />

        {/* Date */}
        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity
          style={commonStyles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formData.transaction_date}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.transaction_date)}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false)
              if (date) {
                setFormData({
                  ...formData,
                  transaction_date: date.toISOString().split('T')[0],
                })
              }
            }}
          />
        )}

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[commonStyles.input, styles.textArea]}
          value={formData.description || ''}
          onChangeText={(text) => setFormData({ ...formData, description: text || null })}
          placeholder="Description optionnelle"
          multiline
          numberOfLines={3}
        />

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[commonStyles.input, styles.textArea]}
          value={formData.notes || ''}
          onChangeText={(text) => setFormData({ ...formData, notes: text || null })}
          placeholder="Notes optionnelles"
          multiline
          numberOfLines={2}
        />

        {/* Bouton Enregistrer */}
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.buttonPrimary, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={commonStyles.buttonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    backgroundColor: colors.card,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  form: {
    padding: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryButton: {
    width: '30%',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.foreground,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  dateText: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
})
