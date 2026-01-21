import { useState } from 'react'
import { View, Text, StyleSheet, Alert, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthContext } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../services/supabase/client'
import { ScreenContainer, ScreenHeader, PrimaryButton, SecondaryButton } from '../../components/ui'
import { ScalePress } from '../../components/animations'
import { SaveAccountCard } from '../../components/SaveAccountCard'
import { spacing, typography, radius } from '../../lib/designTokens'
import { User, Settings, Mail, Moon, Sun, UserCheck } from 'lucide-react-native'

export default function ProfileScreen() {
  const { user, isAnonymous, email, signOut } = useAuthContext()
  const { colors, isDark, toggleTheme, mode, setMode } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    const message = isAnonymous
      ? 'Attention : vos donnees seront perdues si vous n\'avez pas sauvegarde votre compte avec un email.'
      : 'Etes-vous sur de vouloir vous deconnecter ?'

    Alert.alert(
      'Deconnexion',
      message,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Deconnexion',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              await signOut()
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Erreur', 'Impossible de se deconnecter')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title="Profil" showBack onBack={() => router.back()} />

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primarySurface }]}>
            {isAnonymous ? (
              <User size={48} color={colors.primary} />
            ) : (
              <UserCheck size={48} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {email?.split('@')[0] || 'Utilisateur'}
          </Text>
          {isAnonymous ? (
            <View style={[styles.anonymousBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.anonymousBadgeText, { color: colors.warning }]}>
                Compte non sauvegarde
              </Text>
            </View>
          ) : (
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{email}</Text>
          )}
        </View>

        {/* SaveAccountCard for anonymous users */}
        <SaveAccountCard />

        {/* Info Section */}
        <View style={styles.section}>
          <View style={[styles.infoRow, { backgroundColor: colors.surface }]}>
            <Mail size={20} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.email || 'Non disponible'}
            </Text>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apparence</Text>

          <View style={[styles.themeRow, { backgroundColor: colors.surface }]}>
            {isDark ? (
              <Moon size={20} color={colors.primary} />
            ) : (
              <Sun size={20} color={colors.warning} />
            )}
            <Text style={[styles.themeLabel, { color: colors.text }]}>Mode sombre</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : colors.surface}
            />
          </View>

          {/* Theme Options */}
          <View style={styles.themeOptions}>
            {(['light', 'dark', 'system'] as const).map((themeMode) => (
              <ScalePress
                key={themeMode}
                onPress={() => setMode(themeMode)}
              >
                <View
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    mode === themeMode && { borderColor: colors.primary, backgroundColor: colors.primarySurface },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: mode === themeMode ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {themeMode === 'light' ? 'Clair' : themeMode === 'dark' ? 'Sombre' : 'Systeme'}
                  </Text>
                </View>
              </ScalePress>
            ))}
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <SecondaryButton
            title="Parametres"
            onPress={() => router.push('/profile/settings')}
            style={styles.actionButton}
          />
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <PrimaryButton
            title="Se deconnecter"
            onPress={handleSignOut}
            disabled={loading}
            loading={loading}
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
          />
        </View>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userName: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.body,
  },
  anonymousBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  anonymousBadgeText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: typography.fontSize.body,
    marginLeft: spacing.base,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  themeLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.base,
    flex: 1,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
})
