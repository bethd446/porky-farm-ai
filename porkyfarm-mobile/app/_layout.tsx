import { Stack, Redirect } from 'expo-router'
import { AuthProvider, useAuthContext } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useEffect, useState, ReactNode, useRef, useCallback } from 'react'
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

  // Fonction checkOnboarding (pas de useCallback pour éviter dépendances circulaires)
  const checkOnboarding = async () => {
    // Protection contre appels multiples
    if (isCheckingRef.current) {
      console.log('[OnboardingGuard] checkOnboarding déjà en cours, ignoré')
      return
    }

    if (!user) {
      console.log('[OnboardingGuard] Pas d\'utilisateur, skip onboarding check')
      setCheckingOnboarding(false)
      setHasTriedOnboardingCheck(true)
      isCheckingRef.current = false
      return
    }

    isCheckingRef.current = true
    setCheckingOnboarding(true)
    setOnboardingError(null)

    try {
      // Timeout de 8 secondes pour la vérification onboarding
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout: La vérification prend trop de temps'))
        }, 8000)
      })

      const onboardingPromise = onboardingService.checkOnboardingStatus()

      const result = await Promise.race([
        onboardingPromise,
        timeoutPromise,
      ]) as { hasCompleted: boolean; error: Error | null }

      // Nettoyage timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (result.error) {
        console.error('[OnboardingGuard] Error checking onboarding:', result.error)
        setOnboardingError(result.error)
        setNeedsOnboarding(false) // En cas d'erreur, on laisse passer vers l'app
      } else {
        console.log('[OnboardingGuard] Onboarding status:', result.hasCompleted ? 'completed' : 'not completed')
        setNeedsOnboarding(!result.hasCompleted)
      }
    } catch (err: any) {
      console.error('[OnboardingGuard] Exception checking onboarding:', err)
      // Nettoyage timeout en cas d'exception
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      const error = err instanceof Error ? err : new Error('Erreur lors de la vérification')
      setOnboardingError(error)
      setNeedsOnboarding(false) // En cas d'erreur, on laisse passer
    } finally {
      setCheckingOnboarding(false)
      setHasTriedOnboardingCheck(true) // IMPORTANT: Marquer comme essayé pour éviter boucles
      isCheckingRef.current = false
    }
  }

  // Effect pour déclencher le check onboarding
  useEffect(() => {
    // Ne vérifier que si :
    // - Auth n'est plus en chargement
    // - User est défini
    // - On n'a pas déjà essayé
    if (!authLoading && user && !hasTriedOnboardingCheck && !isCheckingRef.current) {
      console.log('[OnboardingGuard] Déclenchement checkOnboarding')
      checkOnboarding()
    } else if (!authLoading && !user) {
      // Pas d'utilisateur = pas besoin de vérifier onboarding
      console.log('[OnboardingGuard] Pas d\'utilisateur, reset flags')
      setCheckingOnboarding(false)
      setHasTriedOnboardingCheck(false) // Reset pour prochaine connexion
      setNeedsOnboarding(false)
      setOnboardingError(null)
      isCheckingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, hasTriedOnboardingCheck]) // checkOnboarding retiré des deps pour éviter boucles

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
      console.log('[OnboardingGuard] Retry auth')
      setHasTriedOnboardingCheck(false) // Reset pour permettre nouveau check après auth
      setOnboardingError(null)
      isCheckingRef.current = false
      await retryAuth()
    } else if (onboardingError) {
      console.log('[OnboardingGuard] Retry onboarding check')
      setHasTriedOnboardingCheck(false) // Reset pour permettre nouveau check
      setOnboardingError(null)
      isCheckingRef.current = false
      await checkOnboarding()
    }
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

  // Redirection vers onboarding si nécessaire
  // Conditions strictes : user défini + needsOnboarding + pas d'erreur + pas en chargement
  if (needsOnboarding && user && !onboardingError && !authError) {
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
