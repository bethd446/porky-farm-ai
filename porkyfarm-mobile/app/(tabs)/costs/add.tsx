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

const CATEGORIES: { value: CostCategory; label: string; icon: string }[] = [
  { value: 'pig_purchase', label: 'Achat sujet', icon: '🐷' },
  { value: 'feed', label: 'Aliment', icon: '🌾' },
  { value: 'vitamins', label: 'Vitamines', icon: '💊' },
  { value: 'medication', label: 'Médicament', icon: '💉' },
  { value: 'transport', label: 'Transport', icon: '🚚' },
  { value: 'veterinary', label: 'Vétérinaire', icon: '🏥' },
  { value: 'labor', label: 'Main d\'œuvre', icon: '👷' },
  { value: 'misc', label: 'Divers', icon: '📋' },
  { value: 'sale', label: 'Vente', icon: '💰' },
  { value: 'subsidy', label: 'Subvention', icon: '🎁' },
  { value: 'other', label: 'Autre', icon: '📝' },
]

export default function AddCostScreen() {
  const router = useRouter()
  const { isOnline } = useSyncQueue()
  const [formData, setFormData] = useState<CostEntryInsert>({
    type: 'expense',
    category: 'misc',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    // Validation
    if (!formData.category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie')
      return
    }
    if (formData.amount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être supérieur à 0')
      return
    }
    if (!formData.transaction_date) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date')
      return
    }

    setLoading(true)
    try {
      if (!isOnline) {
        // Mode offline : enregistrer dans la queue
        await offlineQueue.enqueue({
          type: 'CREATE_COST_ENTRY',
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
          // Si erreur réseau, essayer d'enregistrer dans la queue
          if (error.message?.includes('réseau') || error.message?.includes('network')) {
            await offlineQueue.enqueue({
              type: 'CREATE_COST_ENTRY',
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
          Alert.alert(
            'Succès',
            formData.type === 'expense'
              ? 'Dépense enregistrée avec succès'
              : 'Entrée enregistrée avec succès',
            [{ text: 'OK', onPress: () => router.back() }],
          )
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
        {/* Type : Dépense / Entrée */}
        <Text style={styles.label}>Type *</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.type === 'expense' && styles.typeButtonActive,
            ]}
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
            style={[
              styles.typeButton,
              formData.type === 'income' && styles.typeButtonActive,
            ]}
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
              return cat.value !== 'sale' && cat.value !== 'subsidy'
            } else {
              return cat.value === 'sale' || cat.value === 'subsidy' || cat.value === 'other'
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
          value={formData.amount > 0 ? formData.amount.toString() : ''}
          onChangeText={(text) => {
            const num = parseFloat(text) || 0
            setFormData({ ...formData, amount: num })
          }}
          placeholder="0"
          keyboardType="numeric"
        />

        {/* Date */}
        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity
          style={commonStyles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {new Date(formData.transaction_date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
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
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Description optionnelle"
          multiline
          numberOfLines={3}
        />

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[commonStyles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
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
            <ActivityIndicator color="#ffffff" />
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
    padding: spacing.base,
    paddingTop: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  form: {
    padding: spacing.base,
    gap: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: spacing.base,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.mutedForeground,
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    width: '30%',
    padding: spacing.base,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.foreground,
    textAlign: 'center',
  },
  categoryLabelActive: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
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
    marginTop: spacing.lg,
  },
})

