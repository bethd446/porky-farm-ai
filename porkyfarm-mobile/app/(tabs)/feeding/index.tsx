import { useState, useMemo } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { feedingService, type FeedStock, type FeedCategory } from '../../../services/feeding'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { LoadingSkeleton, AnimalCardSkeleton } from '../../../components/LoadingSkeleton'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { useToast } from '../../../hooks/useToast'
import { Toast } from '../../../components/Toast'
import { Package, Plus, AlertTriangle, Calculator, FlaskConical } from 'lucide-react-native'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useListData } from '../../../hooks/useFocusRefresh'

const LOW_STOCK_THRESHOLD = 50 // kg

export default function FeedingScreen() {
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorWeight, setCalculatorWeight] = useState('')
  const [calculatorCategory, setCalculatorCategory] = useState<FeedCategory>('fattening')
  const [calculatorResult, setCalculatorResult] = useState<{ dailyRation: number; weeklyRation: number } | null>(null)
  const router = useRouter()
  const { toast, showError, hideToast } = useToast()
  const { feedStockVersion } = useRefresh()

  const {
    data: stock,
    loading,
    error,
    refreshing,
    refresh: onRefresh,
  } = useListData(() => feedingService.getStock(), [feedStockVersion])

  const handleCalculate = async () => {
    const weight = parseFloat(calculatorWeight)
    if (!weight || weight <= 0) {
      showError('Veuillez entrer un poids valide')
      return
    }

    const result = await feedingService.calculateRation(weight, calculatorCategory)
    setCalculatorResult(result)
  }

  const totalStock = useMemo(() => stock.reduce((sum, item) => sum + item.quantity_kg, 0), [stock])
  const lowStockItems = useMemo(
    () => stock.filter((item) => item.quantity_kg < LOW_STOCK_THRESHOLD),
    [stock]
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Alimentation</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <AnimalCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    )
  }

  if (error && stock.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Alimentation</Text>
        </View>
        <ErrorState
          title="Erreur de chargement"
          message={error || 'Impossible de charger le stock'}
          onRetry={onRefresh}
          retryLabel="Réessayer"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Package size={24} color={colors.primary} />
          <Text style={styles.title}>Alimentation</Text>
        </View>
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.buttonPrimary]}
          onPress={() => router.push('/(tabs)/feeding/add-stock')}
        >
          <Plus size={18} color="#ffffff" />
          <Text style={commonStyles.buttonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stock Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stock d'aliments</Text>
          </View>

          <View style={[styles.totalStockCard, elevation.sm]}>
            <Text style={styles.totalStockLabel}>Total en stock</Text>
            <Text style={styles.totalStockValue}>{totalStock.toFixed(2)} kg</Text>
          </View>

          {/* Bouton Fabrication Aliment */}
          <TouchableOpacity
            style={[styles.formulateButton, elevation.sm]}
            onPress={() => router.push('/(tabs)/feeding/formulate')}
            activeOpacity={0.8}
          >
            <View style={styles.formulateIconContainer}>
              <FlaskConical size={22} color="#FFFFFF" />
            </View>
            <View style={styles.formulateContent}>
              <Text style={styles.formulateTitle}>Fabrication d'aliment</Text>
              <Text style={styles.formulateSubtitle}>Creez vos formules personnalisees</Text>
            </View>
          </TouchableOpacity>

          {lowStockItems.length > 0 && (
            <View style={[styles.alertCard, elevation.xs]}>
              <AlertTriangle size={20} color={colors.warning} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Stock faible</Text>
                <Text style={styles.alertText}>
                  {lowStockItems.length} aliment{lowStockItems.length > 1 ? 's' : ''} sous le seuil de {LOW_STOCK_THRESHOLD} kg
                </Text>
              </View>
            </View>
          )}

          {stock.length === 0 ? (
            <EmptyState
              emoji="🌾"
              title="Aucun aliment en stock"
              description="Commencez par ajouter vos premiers aliments pour suivre votre stock et éviter les ruptures."
              actionLabel="Ajouter du stock"
              onAction={() => router.push('/(tabs)/feeding/add-stock')}
            />
          ) : (
            <View style={styles.stockList}>
              {stock.map((item) => {
                const isLowStock = item.quantity_kg < LOW_STOCK_THRESHOLD
                return (
                  <View
                    key={item.id}
                    style={[
                      commonStyles.card,
                      styles.stockCard,
                      elevation.sm,
                      isLowStock && styles.stockCardLow,
                    ]}
                  >
                    <View style={styles.stockHeader}>
                      <View style={styles.stockInfo}>
                        <Text style={styles.stockType}>{item.feed_type}</Text>
                        {isLowStock && (
                          <View style={styles.lowStockBadge}>
                            <AlertTriangle size={12} color={colors.warning} />
                            <Text style={styles.lowStockText}>Stock faible</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stockQuantity,
                          isLowStock && { color: colors.warning },
                        ]}
                      >
                        {item.quantity_kg.toFixed(2)} kg
                      </Text>
                    </View>
                    {item.supplier && (
                      <Text style={styles.stockSupplier}>Fournisseur: {item.supplier}</Text>
                    )}
                    {item.expiry_date && (
                      <Text style={styles.stockExpiry}>
                        Expire: {new Date(item.expiry_date).toLocaleDateString('fr-FR')}
                      </Text>
                    )}
                    {item.unit_price && (
                      <Text style={styles.stockPrice}>
                        Prix: {item.unit_price.toLocaleString('fr-FR')} FCFA/kg
                      </Text>
                    )}
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* Calculator Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[commonStyles.card, styles.calculatorToggle, elevation.xs]}
            onPress={() => setShowCalculator((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={styles.calculatorToggleContent}>
              <Calculator size={20} color={colors.primary} />
              <Text style={styles.calculatorToggleText}>Calculateur de ration</Text>
            </View>
            <Text style={styles.calculatorToggleIcon}>{showCalculator ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showCalculator && (
            <View style={[commonStyles.card, styles.calculator, elevation.sm]}>
              <Text style={styles.label}>Poids de l'animal (kg)</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={calculatorWeight}
                onChangeText={setCalculatorWeight}
                keyboardType="numeric"
                placeholder="Ex: 150"
                placeholderTextColor={colors.mutedForeground}
              />

              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.categoryContainer}>
                {(['sow', 'boar', 'piglet', 'fattening'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      calculatorCategory === cat && styles.categoryButtonActive,
                      elevation.xs,
                    ]}
                    onPress={() => setCalculatorCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        calculatorCategory === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat === 'sow'
                        ? 'Truie'
                        : cat === 'boar'
                          ? 'Verrat'
                          : cat === 'piglet'
                            ? 'Porcelet'
                            : 'Porc'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  commonStyles.button,
                  commonStyles.buttonPrimary,
                  styles.calculateButton,
                  elevation.md,
                ]}
                onPress={handleCalculate}
                activeOpacity={0.8}
              >
                <Text style={commonStyles.buttonText}>Calculer</Text>
              </TouchableOpacity>

              {calculatorResult && (
                <View style={[styles.result, elevation.xs]}>
                  <Text style={styles.resultTitle}>Ration recommandée</Text>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Quotidienne:</Text>
                    <Text style={styles.resultValue}>
                      {calculatorResult.dailyRation} kg/jour
                    </Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Hebdomadaire:</Text>
                    <Text style={styles.resultValue}>
                      {calculatorResult.weeklyRation} kg/semaine
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.base,
  },
  section: {
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  totalStockCard: {
    backgroundColor: colors.infoLight,
    padding: spacing.base,
    borderRadius: radius.lg,
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  totalStockLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.info,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  totalStockValue: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.info,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: spacing.base,
    borderRadius: radius.md,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
    marginBottom: spacing.xs / 2,
  },
  alertText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.warning,
  },
  stockList: {
    gap: spacing.base,
  },
  stockCard: {
    marginBottom: spacing.base,
  },
  stockCardLow: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stockInfo: {
    flex: 1,
  },
  stockType: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  lowStockText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
    color: colors.warning,
  },
  stockQuantity: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  stockSupplier: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  stockExpiry: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  stockPrice: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  calculatorToggle: {
    marginBottom: spacing.base,
  },
  calculatorToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  calculatorToggleText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
  },
  calculatorToggleIcon: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  calculator: {
    marginTop: spacing.sm,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  calculateButton: {
    marginTop: spacing.base,
  },
  result: {
    marginTop: spacing.base,
    padding: spacing.base,
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
  },
  resultTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.info,
    marginBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resultLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.info,
  },
  resultValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.info,
  },
  formulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.base,
    borderRadius: radius.lg,
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  formulateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formulateContent: {
    flex: 1,
  },
  formulateTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  formulateSubtitle: {
    fontSize: typography.fontSize.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
})
