import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { gestationsService, type Gestation } from '../../../services/gestations'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { LoadingSkeleton, AnimalCardSkeleton } from '../../../components/LoadingSkeleton'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { useToast } from '../../../hooks/useToast'
import { Toast } from '../../../components/Toast'
import { Baby, Plus, ChevronRight } from 'lucide-react-native'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useListData } from '../../../hooks/useFocusRefresh'

// Couleurs selon schéma Supabase V2.0: 'en_cours', 'terminee', 'avortee'
const getStatusColor = (status: string) => {
  switch (status) {
    case 'en_cours':
      return colors.info
    case 'terminee':
      return colors.success
    case 'avortee':
      return colors.error
    default:
      return colors.mutedForeground
  }
}

// Labels selon schéma Supabase V2.0
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    en_cours: 'En gestation',
    terminee: 'Terminée',
    avortee: 'Avortée',
  }
  return labels[status] || status
}

export default function ReproductionScreen() {
  const router = useRouter()
  const { toast, showError, hideToast } = useToast()
  const { gestationsVersion } = useRefresh()

  const {
    data: gestations,
    loading,
    error,
    refreshing,
    refresh: onRefresh,
  } = useListData(() => gestationsService.getAll(), [gestationsVersion])

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDaysRemaining = (expectedDate: string | null) => {
    if (!expectedDate) return null
    const today = new Date()
    const expected = new Date(expectedDate)
    const diff = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reproduction</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <AnimalCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    )
  }

  if (error && gestations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reproduction</Text>
        </View>
        <ErrorState
          title="Erreur de chargement"
          message={error || 'Impossible de charger les gestations'}
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
          <Baby size={24} color={colors.primary} />
          <Text style={styles.title}>Reproduction</Text>
        </View>
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.buttonPrimary]}
          onPress={() => router.push('/(tabs)/reproduction/add')}
        >
          <Plus size={18} color="#ffffff" />
          <Text style={commonStyles.buttonText}>Nouvelle saillie</Text>
        </TouchableOpacity>
      </View>

      {gestations.length === 0 ? (
        <EmptyState
          emoji="🐷"
          title="Aucune gestation enregistrée"
          description="Enregistrez une saillie pour suivre les gestations de vos truies et recevoir des alertes pour les mises-bas à venir."
          actionLabel="Enregistrer une saillie"
          onAction={() => router.push('/(tabs)/reproduction/add')}
        />
      ) : (
        <FlatList
          data={gestations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const daysRemaining = getDaysRemaining(item.expected_farrowing_date)
            return (
              <TouchableOpacity
                style={[commonStyles.card, styles.gestationCard, elevation.sm]}
                onPress={() => router.push(`/(tabs)/reproduction/${item.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.gestationHeader}>
                  <View style={styles.gestationInfo}>
                    <Text style={styles.gestationSow}>
                      {item.sow_name || item.sow_identifier || 'Truie inconnue'}
                    </Text>
                    {item.boar_name && (
                      <Text style={styles.gestationBoar}>Verrat: {item.boar_name}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>

                <View style={styles.gestationDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Saillie:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.mating_date)}</Text>
                  </View>
                  {item.expected_farrowing_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mise-bas prévue:</Text>
                      <View style={styles.detailValueContainer}>
                        <Text style={styles.detailValue}>{formatDate(item.expected_farrowing_date)}</Text>
                        {daysRemaining !== null && daysRemaining > 0 && (
                          <View style={styles.daysBadge}>
                            <Text style={styles.daysText}>
                              {daysRemaining === 1 ? 'Demain' : `${daysRemaining} jours`}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  {item.piglets_born_alive !== null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Porcelets nés:</Text>
                      <Text style={[styles.detailValue, { color: colors.success }]}>
                        {item.piglets_born_alive}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.gestationFooter}>
                  <ChevronRight size={20} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>
            )
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}

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
  gestationCard: {
    marginBottom: spacing.base,
    minHeight: 120,
  },
  gestationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  gestationInfo: {
    flex: 1,
  },
  gestationSow: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  gestationBoar: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  statusText: {
    color: '#ffffff',
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  gestationDetails: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  detailValue: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  daysBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  daysText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  gestationFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
