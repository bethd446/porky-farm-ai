import { useState } from 'react'
import { View, Text, StyleSheet, Alert, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenContainer, ScreenHeader, PrimaryButton } from '../../components/ui'
import { supabase } from '../../services/supabase/client'
import { colors, spacing, typography, radius } from '../../lib/designTokens'
import { elevation } from '../../lib/design/elevation'
import { Bell, Info, LogOut, Smartphone } from 'lucide-react-native'

export default function SettingsScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              await supabase.auth.signOut()
              router.replace('/(auth)/login')
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Erreur', 'Impossible de se déconnecter')
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
      <ScreenHeader title="Paramètres" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={colors.mutedForeground} />
              <Text style={styles.settingLabel}>Activer les notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        {/* Section Application */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Smartphone size={20} color={colors.mutedForeground} />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Info size={20} color={colors.mutedForeground} />
              <Text style={styles.settingLabel}>SDK Expo</Text>
            </View>
            <Text style={styles.settingValue}>54</Text>
          </View>
        </View>

        {/* Section Déconnexion */}
        <View style={styles.section}>
          <PrimaryButton
            title="Se déconnecter"
            onPress={handleSignOut}
            disabled={loading}
            loading={loading}
            style={{ backgroundColor: colors.error }}
          />
        </View>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.base,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...elevation.xs,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  settingLabel: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
  },
  settingValue: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
})

