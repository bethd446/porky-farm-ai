/**
 * Ecran Detail Gestation
 * ======================
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useTheme } from '../../../contexts/ThemeContext'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useToast } from '../../../hooks/useToast'
import { gestationsService, type Gestation } from '../../../services/gestations'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingScreen } from '../../../components/ui/LoadingScreen'
import {
  Baby,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowLeft,
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

// Schéma V2.0: 'en_cours', 'terminee', 'avortee'
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  en_cours: { label: 'En gestation', color: '#EC4899', icon: Clock },
  terminee: { label: 'Terminée', color: '#10B981', icon: CheckCircle },
  avortee: { label: 'Avortée', color: '#EF4444', icon: AlertCircle },
}

export default function ReproductionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors: themeColors } = useTheme()
  const { refreshGestations } = useRefresh()
  const { showSuccess, showError } = useToast()

  const [gestation, setGestation] = useState<Gestation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGestation = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await gestationsService.getById(id)

      if (fetchError) {
        throw fetchError
      }

      if (!data) {
        throw new Error('Gestation non trouvee')
      }

      setGestation(data)
    } catch (err) {
      console.error('[ReproductionDetail] Error loading gestation:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadGestation()
  }, [loadGestation])

  // Suppression
  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette gestation',
      `Êtes-vous sûr de vouloir supprimer cette gestation ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await gestationsService.delete(gestation!.id)
              if (error) throw error
              refreshGestations() // Refresh temps réel
              showSuccess('Gestation supprimée')
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

  if (error || !gestation) {
    return (
      <ErrorState
        message={error || 'Gestation non trouvee'}
        onRetry={loadGestation}
      />
    )
  }

  const statusConfig = STATUS_CONFIG[gestation.status] || STATUS_CONFIG.en_cours
  const StatusIcon = statusConfig.icon

  // Calculer les jours restants (schéma V2.0: 'en_cours')
  let daysRemaining: number | null = null
  if (gestation.expected_farrowing_date && gestation.status === 'en_cours') {
    const expected = new Date(gestation.expected_farrowing_date)
    const today = new Date()
    daysRemaining = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detail gestation',
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
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={[styles.iconCircle, { backgroundColor: '#EC4899' + '20' }]}>
            <Baby size={32} color="#EC4899" />
          </View>

          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <StatusIcon size={16} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {/* Countdown */}
          {daysRemaining !== null && daysRemaining > 0 && (
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownNumber, { color: themeColors.text }]}>
                {daysRemaining}
              </Text>
              <Text style={[styles.countdownLabel, { color: themeColors.textSecondary }]}>
                jours restants
              </Text>
            </View>
          )}
        </View>

        {/* Parents */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Parents
          </Text>
          <View style={[styles.parentsCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
            {/* Truie */}
            <View style={styles.parentRow}>
              <View style={[styles.parentIcon, { backgroundColor: '#EC4899' + '20' }]}>
                <Text style={styles.parentEmoji}>🐷</Text>
              </View>
              <View style={styles.parentInfo}>
                <Text style={[styles.parentLabel, { color: themeColors.textSecondary }]}>
                  Truie
                </Text>
                <Text style={[styles.parentName, { color: themeColors.text }]}>
                  {gestation.sow_name || gestation.sow_identifier || 'Non renseignee'}
                </Text>
              </View>
            </View>

            <View style={[styles.parentDivider, { backgroundColor: themeColors.border }]} />

            {/* Verrat */}
            <View style={styles.parentRow}>
              <View style={[styles.parentIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                <Text style={styles.parentEmoji}>🐗</Text>
              </View>
              <View style={styles.parentInfo}>
                <Text style={[styles.parentLabel, { color: themeColors.textSecondary }]}>
                  Verrat
                </Text>
                <Text style={[styles.parentName, { color: themeColors.text }]}>
                  {gestation.boar_name || gestation.boar_identifier || 'Non renseigne'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Dates importantes
          </Text>
          <View style={[styles.infoCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
            <InfoRow
              icon={Calendar}
              label="Date de saillie"
              value={new Date(gestation.mating_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              themeColors={themeColors}
            />
            {gestation.expected_farrowing_date && (
              <InfoRow
                icon={Clock}
                label="Mise bas prevue"
                value={new Date(gestation.expected_farrowing_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                themeColors={themeColors}
              />
            )}
            {gestation.actual_farrowing_date && (
              <InfoRow
                icon={CheckCircle}
                label="Mise bas effective"
                value={new Date(gestation.actual_farrowing_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                themeColors={themeColors}
                isLast
              />
            )}
          </View>
        </View>

        {/* Porcelets */}
        {(gestation.piglets_born_alive !== null || gestation.piglets_stillborn !== null) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Porcelets
            </Text>
            <View style={styles.pigletsGrid}>
              {gestation.piglets_born_alive !== null && (
                <View style={[styles.pigletCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
                  <Text style={styles.pigletEmoji}>🐽</Text>
                  <Text style={[styles.pigletNumber, { color: '#10B981' }]}>
                    {gestation.piglets_born_alive}
                  </Text>
                  <Text style={[styles.pigletLabel, { color: themeColors.textSecondary }]}>
                    Nes vivants
                  </Text>
                </View>
              )}
              {gestation.piglets_stillborn !== null && (
                <View style={[styles.pigletCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
                  <Text style={styles.pigletEmoji}>😔</Text>
                  <Text style={[styles.pigletNumber, { color: '#6B7280' }]}>
                    {gestation.piglets_stillborn}
                  </Text>
                  <Text style={[styles.pigletLabel, { color: themeColors.textSecondary }]}>
                    Mort-nes
                  </Text>
                </View>
              )}
              {gestation.piglets_weaned !== null && (
                <View style={[styles.pigletCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
                  <Text style={styles.pigletEmoji}>🎉</Text>
                  <Text style={[styles.pigletNumber, { color: '#8B5CF6' }]}>
                    {gestation.piglets_weaned}
                  </Text>
                  <Text style={[styles.pigletLabel, { color: themeColors.textSecondary }]}>
                    Sevres
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {gestation.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Notes
            </Text>
            <View style={[styles.notesCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
              <Text style={[styles.notesText, { color: themeColors.text }]}>
                {gestation.notes}
              </Text>
            </View>
          </View>
        )}

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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
  },
  countdownLabel: {
    fontSize: typography.fontSize.body,
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
  parentsCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  parentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentEmoji: {
    fontSize: 24,
  },
  parentInfo: {
    flex: 1,
  },
  parentLabel: {
    fontSize: typography.fontSize.bodySmall,
    marginBottom: 2,
  },
  parentName: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
  },
  parentDivider: {
    height: 1,
    marginHorizontal: spacing.lg,
  },
  infoCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
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
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  pigletsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pigletCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  pigletEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  pigletNumber: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
  },
  pigletLabel: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
  },
  notesCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  notesText: {
    fontSize: typography.fontSize.body,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 100,
  },
})
