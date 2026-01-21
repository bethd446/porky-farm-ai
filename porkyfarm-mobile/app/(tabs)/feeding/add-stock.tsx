import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { feedingService, type FeedStockInsert } from '../../../services/feeding'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { useToast } from '../../../hooks/useToast'
import { Toast } from '../../../components/Toast'
import { Package } from 'lucide-react-native'
import { DatePicker, LoadingInline } from '../../../components/ui'
import { getTodayISO, toISODateString } from '../../../lib/dateUtils'
import { useRefresh } from '../../../contexts/RefreshContext'

export default function AddStockScreen() {
  const [formData, setFormData] = useState<FeedStockInsert>({
    feed_type: '',
    quantity_kg: 0,
    supplier: '',
    purchase_date: getTodayISO(),
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const { refreshFeedStock } = useRefresh()

  const handleSubmit = async () => {
    if (!formData.feed_type || !formData.quantity_kg || formData.quantity_kg <= 0) {
      showError('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const { error } = await feedingService.addStock(formData)
      if (error) {
        showError(error.message || 'Erreur lors de l\'ajout')
      } else {
        showSuccess('Aliment ajouté au stock avec succès')
        refreshFeedStock()
        setTimeout(() => router.back(), 1500)
      }
    } catch (err: any) {
      showError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Package size={24} color={colors.primary} />
          <Text style={styles.title}>Ajouter au stock</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Type d'aliment *</Text>
        <TextInput
          style={[commonStyles.input, styles.input]}
          value={formData.feed_type}
          onChangeText={(text) => setFormData({ ...formData, feed_type: text })}
          placeholder="Ex: Aliment complet, Maïs, Soja..."
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={styles.label}>Quantité (kg) *</Text>
        <TextInput
          style={[commonStyles.input, styles.input]}
          value={formData.quantity_kg.toString()}
          onChangeText={(text) => setFormData({ ...formData, quantity_kg: parseFloat(text) || 0 })}
          keyboardType="numeric"
          placeholder="Ex: 100"
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={styles.label}>Prix unitaire (FCFA/kg, optionnel)</Text>
        <TextInput
          style={[commonStyles.input, styles.input]}
          value={formData.unit_price?.toString() || ''}
          onChangeText={(text) => setFormData({ ...formData, unit_price: parseFloat(text) || null })}
          keyboardType="numeric"
          placeholder="Ex: 500"
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={styles.label}>Fournisseur (optionnel)</Text>
        <TextInput
          style={[commonStyles.input, styles.input]}
          value={formData.supplier || ''}
          onChangeText={(text) => setFormData({ ...formData, supplier: text })}
          placeholder="Nom du fournisseur"
          placeholderTextColor={colors.mutedForeground}
        />

        <DatePicker
          label="Date d'achat"
          value={formData.purchase_date}
          onChange={(date) => setFormData({ ...formData, purchase_date: date ? toISODateString(date) : getTodayISO() })}
          maximumDate={new Date()}
          helperText="Date à laquelle l'aliment a été acheté"
        />

        <DatePicker
          label="Date d'expiration (optionnel)"
          value={formData.expiry_date || null}
          onChange={(date) => setFormData({ ...formData, expiry_date: date ? toISODateString(date) : undefined })}
          minimumDate={new Date()}
          helperText="Date d'expiration de l'aliment si applicable"
        />

        <TouchableOpacity
          style={[
            commonStyles.button,
            commonStyles.buttonPrimary,
            styles.submitButton,
            loading && styles.submitButtonDisabled,
            elevation.md,
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <LoadingInline size="small" color="#ffffff" />
          ) : (
            <Text style={commonStyles.buttonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
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
    paddingTop: spacing['4xl'],
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  form: {
    padding: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  input: {
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing['2xl'],
    marginBottom: spacing['4xl'],
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
})
