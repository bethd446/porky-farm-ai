import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { healthCasesService, type HealthCase } from '../../../services/healthCases'
import { colors, spacing, typography, radius, commonStyles } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { LoadingSkeleton, AnimalCardSkeleton } from '../../../components/LoadingSkeleton'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { useToast } from '../../../hooks/useToast'
import { Toast } from '../../../components/Toast'
import { Heart, Plus, ChevronRight } from 'lucide-react-native'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useListData } from '../../../hooks/useFocusRefresh'

const getSeverityColor = (severity: string | null) => {
  switch (severity) {
    case 'critical':
      return colors.error
    case 'high':
      return colors.error
    case 'medium':
      return colors.warning
    case 'low':
      return colors.success
    default:
      return colors.mutedForeground
  }
}

// Status selon schéma V2.0: 'active', 'ongoing', 'resolved', 'chronic'
const getStatusLabel = (status: string | null) => {
  const labels: Record<string, string> = {
    active: 'Actif',
    ongoing: 'En cours',
    resolved: 'Résolu',
    chronic: 'Chronique',
  }
  return labels[status || ''] || status || 'Inconnu'
}

const getSeverityLabel = (severity: string | null) => {
  const labels: Record<string, string> = {
    critical: 'Critique',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Faible',
  }
  return labels[severity || ''] || 'Non définie'
}

export default function HealthScreen() {
  const router = useRouter()
  const { toast, showError, hideToast } = useToast()
  const { healthCasesVersion } = useRefresh()

  const {
    data: cases,
    loading,
    error,
    refreshing,
    refresh: onRefresh,
  } = useListData(() => healthCasesService.getAll(), [healthCasesVersion])

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Suivi Sanitaire</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <AnimalCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    )
  }

  if (error && cases.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Suivi Sanitaire</Text>
        </View>
        <ErrorState
          title="Erreur de chargement"
          message={error || 'Impossible de charger les cas de santé'}
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
          <Heart size={24} color={colors.primary} />
          <Text style={styles.title}>Suivi Sanitaire</Text>
        </View>
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.buttonPrimary]}
          onPress={() => router.push('/(tabs)/health/add')}
        >
          <Plus size={18} color="#ffffff" />
          <Text style={commonStyles.buttonText}>Nouveau cas</Text>
        </TouchableOpacity>
      </View>

      {cases.length === 0 ? (
        <EmptyState
          icon="medical"
          title="Aucun cas de santé enregistré"
          description="Commencez par ajouter un cas de santé pour suivre la santé de vos animaux et recevoir des alertes importantes."
          actionLabel="Ajouter un cas"
          onAction={() => router.push('/(tabs)/health/add')}
        />
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[commonStyles.card, styles.caseCard, elevation.sm]}
              onPress={() => router.push(`/(tabs)/health/${item.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.caseHeader}>
                <View style={styles.caseTitleContainer}>
                  <Text style={styles.caseTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.caseAnimal}>
                    {item.animal_name || item.animal_identifier || 'Animal inconnu'}
                  </Text>
                </View>
                {item.severity && (
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(item.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>{getSeverityLabel(item.severity)}</Text>
                  </View>
                )}
              </View>

              {item.description && (
                <Text style={styles.caseDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.caseFooter}>
                <View style={styles.caseFooterLeft}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.status === 'resolved'
                            ? colors.successLight
                            : item.status === 'ongoing' || item.status === 'active'
                              ? colors.warningLight
                              : item.status === 'chronic'
                                ? colors.errorLight
                                : colors.infoLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            item.status === 'resolved'
                              ? colors.success
                              : item.status === 'ongoing' || item.status === 'active'
                                ? colors.warning
                                : item.status === 'chronic'
                                  ? colors.error
                                  : colors.info,
                        },
                      ]}
                    >
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                  {item.start_date && (
                    <Text style={styles.caseDate}>
                      {new Date(item.start_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  )}
                </View>
                <ChevronRight size={20} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>
          )}
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
  caseCard: {
    marginBottom: spacing.base,
    minHeight: 100,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  caseTitleContainer: {
    flex: 1,
  },
  caseTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  caseAnimal: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  severityText: {
    color: '#ffffff',
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  caseDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.foreground,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.bodySmall * typography.lineHeight.normal,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  caseFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
  },
  caseDate: {
    fontSize: typography.fontSize.caption,
    color: colors.mutedForeground,
  },
})
