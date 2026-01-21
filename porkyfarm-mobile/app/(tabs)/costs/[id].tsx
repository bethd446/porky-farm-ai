/**
 * Ecran Detail Transaction (Cout/Revenu)
 * ======================================
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useTheme } from '../../../contexts/ThemeContext'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useToast } from '../../../hooks/useToast'
import { costsService, type CostEntry, type CostCategory } from '../../../services/costs'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingScreen } from '../../../components/ui/LoadingScreen'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Tag,
  ArrowLeft,
  ShoppingCart,
  Utensils,
  Stethoscope,
  Wrench,
  Users,
  MoreHorizontal,
  Trash2,
} from 'lucide-react-native'

// Types for theme colors from ThemeContext
interface ThemeColors {
  text: string
  textSecondary: string
  background: string
  surface: string
  border: string
  primary: string
}

// Props for the InfoRow component
interface InfoRowProps {
  icon: React.ComponentType<{ size: number; color: string }>
  label: string
  value: string | number
  themeColors: ThemeColors
  isLast?: boolean
}

// Schéma V2.0: catégories en français
const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  vente: { label: 'Vente', icon: ShoppingCart, color: '#10B981' },
  alimentation: { label: 'Alimentation', icon: Utensils, color: '#F59E0B' },
  veterinaire: { label: 'Vétérinaire', icon: Stethoscope, color: '#EF4444' },
  equipement: { label: 'Équipement', icon: Wrench, color: '#3B82F6' },
  main_oeuvre: { label: 'Main d\'œuvre', icon: Users, color: '#8B5CF6' },
  transport: { label: 'Transport', icon: MoreHorizontal, color: '#06B6D4' },
  autre: { label: 'Autre', icon: MoreHorizontal, color: '#6B7280' },
}

const TYPE_CONFIG = {
  income: { label: 'Revenu', color: '#10B981', icon: TrendingUp },
  expense: { label: 'Depense', color: '#EF4444', icon: TrendingDown },
}

export default function CostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors: themeColors } = useTheme()
  const { refreshCosts } = useRefresh()
  const { showSuccess, showError } = useToast()

  const [transaction, setTransaction] = useState<CostEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransaction = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await costsService.getById(id)

      if (fetchError) {
        throw fetchError
      }

      if (!data) {
        throw new Error('Transaction non trouvee')
      }

      setTransaction(data)
    } catch (err) {
      console.error('[CostDetail] Error loading transaction:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadTransaction()
  }, [loadTransaction])

  // Suppression
  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette transaction',
      `Êtes-vous sûr de vouloir supprimer "${transaction?.description || 'cette transaction'}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await costsService.delete(transaction!.id)
              if (error) throw error
              refreshCosts() // Refresh temps réel
              showSuccess('Transaction supprimée')
              router.back()
            } catch (err) {
              showError('Erreur lors de la suppression')
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return <LoadingScreen message="Chargement..." />
  }

  if (error || !transaction) {
    return (
      <ErrorState
        message={error || 'Transaction non trouvee'}
        onRetry={loadTransaction}
      />
    )
  }

  const typeConfig = TYPE_CONFIG[transaction.type]
  const categoryConfig = CATEGORY_CONFIG[transaction.category] || CATEGORY_CONFIG.autre
  const TypeIcon = typeConfig.icon
  const CategoryIcon = categoryConfig.icon

  // Formater le montant
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(transaction.amount)

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detail transaction',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={22} color={themeColors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={22} color={colors.error} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec montant */}
        <View style={styles.headerSection}>
          <View style={[styles.iconCircle, { backgroundColor: typeConfig.color + '20' }]}>
            <Wallet size={32} color={typeConfig.color} />
          </View>

          {/* Montant */}
          <View style={styles.amountContainer}>
            <Text style={[styles.amountSign, { color: typeConfig.color }]}>
              {transaction.type === 'income' ? '+' : '-'}
            </Text>
            <Text style={[styles.amountValue, { color: typeConfig.color }]}>
              {formattedAmount}
            </Text>
            <Text style={[styles.amountCurrency, { color: typeConfig.color }]}>
              FCFA
            </Text>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: typeConfig.color + '20' }]}>
              <TypeIcon size={14} color={typeConfig.color} />
              <Text style={[styles.badgeText, { color: typeConfig.color }]}>
                {typeConfig.label}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: categoryConfig.color + '20' }]}>
              <CategoryIcon size={14} color={categoryConfig.color} />
              <Text style={[styles.badgeText, { color: categoryConfig.color }]}>
                {categoryConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {transaction.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Description
            </Text>
            <View style={[styles.infoCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
              <Text style={[styles.descriptionText, { color: themeColors.text }]}>
                {transaction.description}
              </Text>
            </View>
          </View>
        )}

        {/* Informations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Informations
          </Text>
          <View style={[styles.infoCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
            <InfoRow
              icon={Calendar}
              label="Date"
              value={new Date(transaction.cost_date || transaction.transaction_date || new Date()).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              themeColors={themeColors}
            />
            <InfoRow
              icon={Tag}
              label="Categorie"
              value={categoryConfig.label}
              themeColors={themeColors}
            />
            <InfoRow
              icon={FileText}
              label="Type"
              value={typeConfig.label}
              themeColors={themeColors}
              isLast
            />
          </View>
        </View>

        {/* Resume financier */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Resume
          </Text>
          <View style={[styles.summaryCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryIconContainer, { backgroundColor: typeConfig.color + '15' }]}>
                <TypeIcon size={24} color={typeConfig.color} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
                  {transaction.type === 'income' ? 'Montant percu' : 'Montant depense'}
                </Text>
                <Text style={[styles.summaryValue, { color: typeConfig.color }]}>
                  {formattedAmount} FCFA
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  )
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, themeColors, isLast = false }) => {
  return (
    <View style={[styles.infoRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColors.border }]}>
      <View style={styles.infoRowLeft}>
        <Icon size={18} color={themeColors.textSecondary} />
        <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: themeColors.text }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSize.body,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  amountSign: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    marginRight: 4,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
  },
  amountCurrency: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  infoCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  descriptionText: {
    fontSize: typography.fontSize.body,
    lineHeight: 22,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.body,
  },
  infoValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  summaryCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.fontSize.bodySmall,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
  },
  bottomSpacer: {
    height: 100,
  },
})
