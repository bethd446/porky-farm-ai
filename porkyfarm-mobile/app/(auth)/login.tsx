/**
 * Login Screen - Connexion Magic Link
 * Pour les utilisateurs ayant deja un compte
 */

import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { router } from 'expo-router'
import { useAuthContext } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { logger } from '../../lib/logger'
import * as Haptics from 'expo-haptics'
import { ArrowLeft, Mail, Send, CheckCircle, Sparkles } from 'lucide-react-native'
import { LoadingInline } from '../../components/ui'

export default function LoginScreen() {
  const { signInWithEmail, loading } = useAuthContext()
  const { colors, isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSendLink = async () => {
    if (!isValidEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.')
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsSending(true)

    const { error } = await signInWithEmail(email)

    if (error) {
      logger.error('[Login] Login error:', error)
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer le lien. Verifiez votre connexion.',
        [{ text: 'OK' }]
      )
      setIsSending(false)
      return
    }

    setEmailSent(true)
    setIsSending(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  // Ecran de confirmation apres envoi
  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDark ? [colors.primarySurface, colors.background] : [colors.primarySurface, colors.background]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View entering={FadeInDown.springify()} style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
            <CheckCircle size={48} color={colors.success} />
          </View>

          <Text style={[styles.successTitle, { color: colors.text }]}>
            Email envoye !
          </Text>

          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Un lien de connexion a ete envoye a{'\n'}
            <Text style={{ fontWeight: '600', color: colors.primary }}>{email}</Text>
          </Text>

          <View style={[styles.tipBox, { backgroundColor: colors.surface }]}>
            <Sparkles size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Consultez votre boite mail et cliquez sur le lien pour vous connecter automatiquement.
            </Text>
          </View>

          <Pressable
            onPress={() => setEmailSent(false)}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.surfaceElevated },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.retryButtonText, { color: colors.primary }]}>
              Renvoyer le lien
            </Text>
          </Pressable>

          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backLink,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ArrowLeft size={18} color={colors.textMuted} />
            <Text style={[styles.backLinkText, { color: colors.textMuted }]}>
              Retour a l'accueil
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? [colors.primarySurface, colors.background] : [colors.primarySurface, colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header avec bouton retour */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface },
              pressed && styles.buttonPressed,
            ]}
          >
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* Titre */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.titleSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
            <Mail size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Connexion
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Entrez votre email pour recevoir{'\n'}un lien de connexion magique
          </Text>
        </Animated.View>

        {/* Formulaire */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Mail size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isSending && !loading}
            />
          </View>

          <Pressable
            onPress={handleSendLink}
            disabled={isSending || loading || !email.trim()}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              (!email.trim() || isSending || loading) && styles.buttonDisabled,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              {isSending || loading ? (
                <LoadingInline size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Envoyer le lien</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Lien vers inscription */}
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.linkSection}>
          <Text style={[styles.linkText, { color: colors.textMuted }]}>
            Pas encore de compte ?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.link, { color: colors.primary }]}>
              S'inscrire
            </Text>
          </Pressable>
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.infoSection}>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Pas de mot de passe a retenir !{'\n'}
            Connectez-vous en un clic depuis votre email.
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 16,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  submitButtonText: {
    fontSize: 17,
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
  linkSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  linkText: {
    fontSize: 15,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Success screen
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 15,
  },
})
