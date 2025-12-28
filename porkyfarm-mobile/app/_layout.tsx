import { Stack, Redirect } from 'expo-router'
import { AuthProvider, useAuthContext } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useEffect, useState, ReactNode, useRef } from 'react'
import { onboardingService } from '../services/onboarding'
import { ActivityIndicator, View, Text } from 'react-native'
import { colors, spacing, typography } from '../lib/designTokens'
import { ErrorState } from '../components/ErrorState'

function OnboardingGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, error: authError, retryAuth } = useAuthContext()
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [onboardingError, setOnboardingError] = useState<Error | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [hasTriedOnboardingCheck, setHasTriedOnboardingCheck] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCheckingRef = useRef(false) // Protection contre appels multiples

  // Fonction checkOnboarding avec toutes les protections
  const checkOnboarding = async () => {
    // Protection contre appels multiples
    if (isCheckingRef.current) {
      return
    }

    if (!user) {
      setCheckingOnboarding(false)
      setHasTriedOnboardingCheck(true)
      isCheckingRef.current = false
      return
    }

    isCheckingRef.current = true
    setCheckingOnboarding(true)
    setOnboardingError(null)

    try {
      // Timeout de 8 secondes
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout: La vérification prend trop de temps'))
        }, 8000)
      })

      const onboardingPromise = onboardingService.checkOnboardingStatus()

      const result = await Promise.race([
        onboardingPromise,
        timeoutPromise,
      ]) as { hasCompleted: boolean; error?: Error | null }

      // Nettoyage timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (result.error) {
        // Si erreur : on laisse passer l'utilisateur vers l'app (ne pas bloquer)
        setOnboardingError(result.error)
        setNeedsOnboarding(false)
      } else {
        // Si succès : setNeedsOnboarding selon hasCompleted
        setNeedsOnboarding(!result.hasCompleted)
      }
    } catch (err: any) {
      // Nettoyage timeout en cas d'exception
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      const error = err instanceof Error ? err : new Error('Erreur lors de la vérification')
      setOnboardingError(error)
      setNeedsOnboarding(false) // En cas d'erreur, on laisse passer
    } finally {
      // IMPORTANT: Toujours reset dans finally
      isCheckingRef.current = false
      setCheckingOnboarding(false)
      setHasTriedOnboardingCheck(true) // Clé pour ne plus relancer
    }
  }

  // Effect pour déclencher le check onboarding
  useEffect(() => {
    // Déclencher une seule fois quand toutes les conditions sont remplies
    if (!authLoading && user && !hasTriedOnboardingCheck && !isCheckingRef.current) {
      checkOnboarding()
    } else if (!authLoading && !user) {
      // Pas d'utilisateur : reset des états
      setCheckingOnboarding(false)
      setNeedsOnboarding(false)
      setHasTriedOnboardingCheck(true) // Marquer comme essayé pour éviter re-tentative
      setOnboardingError(null)
      isCheckingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, hasTriedOnboardingCheck])

  // Nettoyage timeout au unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  const handleRetry = async () => {
    if (authError) {
      // Pour authError, on peut réessayer l'auth
      setOnboardingError(null)
      isCheckingRef.current = false
      // Ne pas remettre hasTriedOnboardingCheck à false ici
      await retryAuth()
    } else if (onboardingError) {
      // Pour onboardingError, on peut réessayer le check
      // MAIS on ne remet PAS hasTriedOnboardingCheck à false pour éviter boucles
      setOnboardingError(null)
      isCheckingRef.current = false
      // Réessayer directement sans reset hasTriedOnboardingCheck
      await checkOnboarding()
    }
  }

  // État de chargement
  if (authLoading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.base, fontSize: typography.fontSize.body, color: colors.mutedForeground }}>
          Chargement...
        </Text>
      </View>
    )
  }

  // État d'erreur (auth ou onboarding) - seulement si pas en chargement
  if ((authError || onboardingError) && !authLoading && !checkingOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ErrorState
          title="Erreur de chargement"
          message="Impossible de charger les données. Vérifiez votre connexion et réessayez."
          onRetry={handleRetry}
          retryLabel="Réessayer"
        />
      </View>
    )
  }

  // Redirection vers onboarding si nécessaire
  if (needsOnboarding && user) {
    return <Redirect href="/onboarding" />
  }

  // Sinon, afficher les enfants (app normale)
  return <>{children}</>
}

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={null}>
      <AuthProvider>
        <OnboardingGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="profile/index" options={{ headerShown: false }} />
            <Stack.Screen name="debug/supabase-test" options={{ title: 'Test Supabase' }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </OnboardingGuard>
      </AuthProvider>
    </ErrorBoundary>
  )
}
