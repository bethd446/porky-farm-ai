/**
 * Ecran Detail Cas de Sante
 * =========================
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useTheme } from '../../../contexts/ThemeContext'
import { useRefresh } from '../../../contexts/RefreshContext'
import { useToast } from '../../../hooks/useToast'
import { healthCasesService, type HealthCase } from '../../../services/healthCases'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { elevation } from '../../../lib/design/elevation'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingScreen } from '../../../components/ui/LoadingScreen'
import {
  Stethoscope,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
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

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Faible', color: '#10B981' },
  medium: { label: 'Moyenne', color: '#F59E0B' },
  high: { label: 'Haute', color: '#F97316' },
  critical: { label: 'Critique', color: '#EF4444' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ongoing: { label: 'En cours', color: '#F59E0B', icon: Clock },
  resolved: { label: 'Resolu', color: '#10B981', icon: CheckCircle },
  chronic: { label: 'Chronique', color: '#8B5CF6', icon: AlertTriangle },
  scheduled: { label: 'Planifie', color: '#3B82F6', icon: Calendar },
}

export default function HealthDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors: themeColors } = useTheme()
  const { refreshHealthCases } = useRefresh()
  const { showSuccess, showError } = useToast()

  const [healthCase, setHealthCase] = useState<HealthCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHealthCase = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await healthCasesService.getById(id)

      if (fetchError) {
        throw fetchError
      }

      if (!data) {
        throw new Error('Cas de sante non trouve')
      }

      setHealthCase(data)
    } catch (err) {
      console.error('[HealthDetail] Error loading health case:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadHealthCase()
  }, [loadHealthCase])

  // Suppression
  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce cas',
      `Êtes-vous sûr de vouloir supprimer "${healthCase?.title || 'ce cas de santé'}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await healthCasesService.delete(healthCase!.id)
              if (error) throw error
              refreshHealthCases() // Refresh temps réel
              showSuccess('Cas de santé supprimé')
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

  if (error || !healthCase) {
    return (
      <ErrorState
        message={error || 'Cas de sante non trouve'}
        onRetry={loadHealthCase}
      />
    )
  }

  const severityConfig = SEVERITY_CONFIG[healthCase.severity || 'medium'] || SEVERITY_CONFIG.medium
  const statusConfig = STATUS_CONFIG[healthCase.status || 'ongoing'] || STATUS_CONFIG.ongoing
  const StatusIcon = statusConfig.icon

  return (
    <>
      <Stack.Screen
        options={{
          title: healthCase.title ?? undefined,
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
          <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
            <Stethoscope size={32} color={colors.error} />
          </View>

          <Text style={[styles.title, { color: themeColors.text }]}>
            {healthCase.title}
          </Text>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: severityConfig.color + '20' }]}>
              <AlertTriangle size={14} color={severityConfig.color} />
              <Text style={[styles.badgeText, { color: severityConfig.color }]}>
                {severityConfig.label}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: statusConfig.color + '20' }]}>
              <StatusIcon size={14} color={statusConfig.color} />
              <Text style={[styles.badgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Animal concerne */}
        {(healthCase.animal_name || healthCase.animal_identifier) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Animal concerne
            </Text>
            <View style={[styles.infoCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
              <View style={styles.animalRow}>
                <Text style={styles.animalEmoji}>🐷</Text>
                <Text style={[styles.animalName, { color: themeColors.text }]}>
                  {healthCase.animal_name || healthCase.animal_identifier}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {healthCase.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Description
            </Text>
            <View style={[styles.infoCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
              <Text style={[styles.descriptionText, { color: themeColors.text }]}>
                {healthCase.description}
              </Text>
            </View>
          </View>
        )}

        {/* Traitement */}
        {healthCase.treatment && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Traitement
            </Text>
            <View style={[styles.infoCard, { backgroundColor: themeColors.surface }, elevation.sm]}>
              <Text style={[styles.descriptionText, { color: themeColors.text }]}>
                {healthCase.treatment}
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
            {healthCase.start_date && (
              <InfoRow
                icon={Calendar}
                label="Date de debut"
                value={new Date(healthCase.start_date).toLocaleDateString('fr-FR')}
                themeColors={themeColors}
              />
            )}
            {healthCase.vet_consulted && (
              <InfoRow
                icon={User}
                label="Veterinaire consulte"
                value="Oui"
                themeColors={themeColors}
              />
            )}
            {healthCase.vet_visit_date && (
              <InfoRow
                icon={Calendar}
                label="Visite veto"
                value={new Date(healthCase.vet_visit_date).toLocaleDateString('fr-FR')}
                themeColors={themeColors}
                isLast
              />
            )}
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
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
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
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  animalEmoji: {
    fontSize: 32,
  },
  animalName: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
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
  bottomSpacer: {
    height: 100,
  },
})
