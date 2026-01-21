/**
 * SaveAccountCard - Carte pour sauvegarder le compte anonyme
 * Affichee dans le profil pour les utilisateurs anonymes
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useAuthContext } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { logger } from '../lib/logger'
import * as Haptics from 'expo-haptics'
import { Shield, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react-native'

export function SaveAccountCard() {
  const { isAnonymous, linkEmail, email: linkedEmail } = useAuthContext()
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Ne pas afficher si deja connecte avec email
  if (!isAnonymous && linkedEmail) {
    return null
  }

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSaveAccount = async () => {
    if (!isValidEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.')
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)

    const { error } = await linkEmail(email)

    if (error) {
      logger.error('[SaveAccountCard] Link email error:', error)
      Alert.alert(
        'Erreur',
        'Impossible de lier l\'email. Verifiez votre connexion.',
        [{ text: 'OK' }]
      )
      setLoading(false)
      return
    }

    setEmailSent(true)
    setLoading(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  // Email envoye - afficher confirmation
  if (emailSent) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.card, { backgroundColor: colors.successLight }]}
      >
        <View style={styles.successRow}>
          <CheckCircle size={24} color={colors.success} />
          <View style={styles.successContent}>
            <Text style={[styles.successTitle, { color: colors.success }]}>
              Email envoye !
            </Text>
            <Text style={[styles.successText, { color: colors.textSecondary }]}>
              Cliquez sur le lien dans l'email pour securiser votre compte.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setEmailSent(false)}
          style={({ pressed }) => [
            styles.retryLink,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>
            Renvoyer le lien
          </Text>
        </Pressable>
      </Animated.View>
    )
  }

  return (
    <Animated.View
      entering={FadeIn}
      style={[styles.card, { backgroundColor: colors.warningLight }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.warning + '30' }]}>
          <AlertTriangle size={20} color={colors.warning} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>
            Securisez vos donnees
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Liez un email pour ne rien perdre
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Mail size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="votre@email.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
      </View>

      {/* Button */}
      <Pressable
        onPress={handleSaveAccount}
        disabled={loading || !email.trim()}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          (!email.trim() || loading) && styles.buttonDisabled,
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Shield size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Sauvegarder mon compte</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>

      {/* Info */}
      <Text style={[styles.infoText, { color: colors.textMuted }]}>
        Un lien de confirmation sera envoye a votre email.
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Success state
  successRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    lineHeight: 20,
  },
  retryLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
})
