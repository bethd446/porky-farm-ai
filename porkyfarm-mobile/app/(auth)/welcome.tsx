/**
 * Welcome Screen - Demarrage PorkyFarm
 * Connexion ou création de compte
 */

import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { router } from 'expo-router'
import { useTheme } from '../../contexts/ThemeContext'
import * as Haptics from 'expo-haptics'
import { Mail, PiggyBank, Stethoscope, BarChart3, ShieldCheck, UserPlus } from 'lucide-react-native'

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme()

  const handleExistingAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push('/(auth)/login')
  }

  const features = [
    { icon: PiggyBank, text: 'Suivez votre cheptel', delay: 0 },
    { icon: Stethoscope, text: 'Gérez la santé animale', delay: 50 },
    { icon: BarChart3, text: 'Analysez vos performances', delay: 100 },
    { icon: ShieldCheck, text: 'Données sécurisées', delay: 150 },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? [colors.primarySurface, colors.background] : [colors.primarySurface, colors.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Logo & Titre */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
          <Text style={styles.logoEmoji}>🐷</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>PorkyFarm</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Gérez votre élevage porcin{'\n'}simplement et efficacement
        </Text>
      </Animated.View>

      {/* Features */}
      <View style={styles.features}>
        {features.map((feature, index) => (
          <Animated.View
            key={feature.text}
            entering={FadeInDown.delay(200 + feature.delay).springify()}
            style={styles.featureItem}
          >
            <View style={[styles.featureIcon, { backgroundColor: colors.primarySurface }]}>
              <feature.icon size={20} color={colors.primary} />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Boutons */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.buttons}>
        {/* Bouton Principal - Créer un compte */}
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <UserPlus size={22} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Créer un compte</Text>
          </LinearGradient>
        </Pressable>

        {/* Bouton Secondaire - J'ai déjà un compte */}
        <Pressable
          onPress={handleExistingAccount}
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: colors.surfaceElevated },
            pressed && styles.buttonPressed,
          ]}
        >
          <Mail size={20} color={colors.primary} />
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
            J'ai déjà un compte
          </Text>
        </Pressable>
      </Animated.View>

      {/* Info sécurité */}
      <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.infoContainer}>
        <ShieldCheck size={16} color={colors.textMuted} />
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          Vos données sont sécurisées et synchronisées{'\n'}
          sur tous vos appareils.
        </Text>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttons: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    paddingTop: 24,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
})
