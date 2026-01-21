/**
 * Historique des Distributions
 * ============================
 * Suivi des distributions d'aliments
 * (Version placeholder - a developper)
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, History, TrendingUp, BarChart3, Construction } from 'lucide-react-native'
import { colors, spacing, typography, radius } from '../../../lib/designTokens'
import { premiumGradients, premiumShadows } from '../../../lib/premiumStyles'

export default function HistoryScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Historique</Text>
          <Text style={styles.headerSubtitle}>Statistiques et distributions</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Coming soon card */}
        <View style={styles.comingSoonCard}>
          <LinearGradient
            colors={
              (premiumGradients.primary?.icon && Array.isArray(premiumGradients.primary.icon) && premiumGradients.primary.icon.length >= 2)
                ? premiumGradients.primary.icon
                : ['#2D6A4F', '#52B788'] // Valeur par défaut sécurisée
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Construction size={32} color="#FFF" />
          </LinearGradient>
          <Text style={styles.comingSoonTitle}>Fonctionnalite a venir</Text>
          <Text style={styles.comingSoonText}>
            L'historique permettra de suivre toutes les distributions d'aliments,
            analyser la consommation et generer des rapports detailles.
          </Text>
        </View>

        {/* Preview of features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalites prevues</Text>

          <View style={styles.featureCard}>
            <History size={20} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Journal des distributions</Text>
              <Text style={styles.featureText}>
                Enregistrer chaque distribution avec date, quantite et animaux
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <TrendingUp size={20} color={colors.success} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Evolution de la consommation</Text>
              <Text style={styles.featureText}>
                Graphiques de suivi de la consommation dans le temps
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <BarChart3 size={20} color={colors.info} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Rapports mensuels</Text>
              <Text style={styles.featureText}>
                Statistiques et couts par periode
              </Text>
            </View>
          </View>
        </View>

        {/* Stats preview placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apercu (donnees de demonstration)</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0 kg</Text>
              <Text style={styles.statLabel}>Distribue ce mois</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0 FCFA</Text>
              <Text style={styles.statLabel}>Cout total</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  comingSoonCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...premiumShadows.card.soft,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  comingSoonTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  comingSoonText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...premiumShadows.card.soft,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text,
  },
  featureText: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...premiumShadows.card.soft,
  },
  statValue: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
})
