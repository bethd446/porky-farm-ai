/**
 * Liste des Formules d'Aliments
 * =============================
 * Affiche les formules sauvegardees avec leurs details
 */

import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ArrowLeft,
  Plus,
  FlaskConical,
  Star,
  Trash2,
  ChevronRight,
  TrendingUp,
  Zap,
  Wheat,
} from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../../../../lib/designTokens'
import { premiumGradients, premiumShadows } from '../../../../lib/premiumStyles'
import {
  feedFormulationService,
  FeedFormula,
  NUTRITIONAL_TARGETS,
} from '../../../../services/feedFormulation'
import { useListData } from '../../../../hooks/useFocusRefresh'
import { useRefresh } from '../../../../contexts/RefreshContext'

// ======================
// COMPOSANTS LOCAUX
// ======================

interface FormulaCardProps {
  formula: FeedFormula
  onPress: () => void
  onDelete: () => void
}

function FormulaCard({ formula, onPress, onDelete }: FormulaCardProps) {
  const targetInfo = NUTRITIONAL_TARGETS[formula.target_category]

  const handleDelete = () => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer la formule "${formula.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onDelete },
      ]
    )
  }

  // Verification si les valeurs sont dans les objectifs
  const proteinOk = formula.calculated_protein_pct !== null &&
    formula.calculated_protein_pct >= targetInfo.protein.min &&
    formula.calculated_protein_pct <= targetInfo.protein.max

  const energyOk = formula.calculated_energy_kcal !== null &&
    formula.calculated_energy_kcal >= targetInfo.energy.min &&
    formula.calculated_energy_kcal <= targetInfo.energy.max

  return (
    <TouchableOpacity
      style={[styles.formulaCard, premiumShadows.card.soft]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={
            (premiumGradients.info?.icon && Array.isArray(premiumGradients.info.icon) && premiumGradients.info.icon.length >= 2)
              ? premiumGradients.info.icon
              : ['#457B9D', '#6B9AC4'] // Valeur par défaut sécurisée
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardIcon}
        >
          <FlaskConical size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.cardTitleContainer}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{formula.name}</Text>
            {formula.is_favorite && (
              <Star size={16} color={colors.warning} fill={colors.warning} />
            )}
          </View>
          <Text style={styles.cardCategory}>{targetInfo.label}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      {formula.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {formula.description}
        </Text>
      )}

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <View style={[styles.statIndicator, proteinOk ? styles.statOk : styles.statWarning]} />
          <View>
            <Text style={styles.statLabel}>Proteines</Text>
            <Text style={styles.statValue}>
              {formula.calculated_protein_pct?.toFixed(1)}%
            </Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIndicator, energyOk ? styles.statOk : styles.statWarning]} />
          <View>
            <Text style={styles.statLabel}>Energie</Text>
            <Text style={styles.statValue}>
              {formula.calculated_energy_kcal?.toFixed(0)} kcal
            </Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <Zap size={14} color={colors.primary} />
          <View>
            <Text style={styles.statLabel}>Cout</Text>
            <Text style={[styles.statValue, styles.statValuePrimary]}>
              {formula.total_cost_per_kg} FCFA/kg
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          Creee le {new Date(formula.created_at).toLocaleDateString('fr-FR')}
        </Text>
        <ChevronRight size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  )
}

// ======================
// COMPOSANT PRINCIPAL
// ======================

export default function FormulasListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { feedStockVersion, refreshFeedStock } = useRefresh()

  const [refreshing, setRefreshing] = useState(false)

  const {
    data: formulas,
    loading,
    refresh,
  } = useListData(() => feedFormulationService.getFormulas(), [feedStockVersion])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const handleDelete = async (id: string) => {
    const { error } = await feedFormulationService.deleteFormula(id)
    if (error) {
      Alert.alert('Erreur', error.message)
    } else {
      refreshFeedStock()
    }
  }

  const renderItem = ({ item }: { item: FeedFormula }) => (
    <FormulaCard
      formula={item}
      onPress={() => router.push(`/alimentation/formulas/${item.id}`)}
      onDelete={() => handleDelete(item.id)}
    />
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mes formules</Text>
          <Text style={styles.headerSubtitle}>
            {formulas.length} formule{formulas.length > 1 ? 's' : ''} sauvegardee{formulas.length > 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/alimentation/formulas/create')}
        >
          <LinearGradient
            colors={
              (premiumGradients.success?.button && Array.isArray(premiumGradients.success.button) && premiumGradients.success.button.length >= 2)
                ? premiumGradients.success.button
                : ['#40916C', '#52B788'] // Valeur par défaut sécurisée
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Plus size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={formulas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FlaskConical size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucune formule</Text>
            <Text style={styles.emptySubtitle}>
              Creez votre premiere formule d'aliment equilibre
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/alimentation/formulas/create')}
            >
              <Text style={styles.emptyButtonText}>Creer une formule</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    ...Platform.select({
      ios: premiumShadows.button.default,
      android: premiumShadows.button.default,
    }),
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  formulaCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
    flex: 1,
  },
  cardCategory: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },
  cardDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statOk: {
    backgroundColor: colors.success,
  },
  statWarning: {
    backgroundColor: colors.warning,
  },
  statLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
  },
  statValuePrimary: {
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardDate: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: '#FFF',
  },
})
