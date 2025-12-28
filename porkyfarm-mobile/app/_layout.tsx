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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      checkOnboarding()
    } else if (!authLoading && !user) {
      setCheckingOnboarding(false)
    }
  }, [user, authLoading])

  const checkOnboarding = async () => {
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

      const { hasCompleted, error } = await Promise.race([
        onboardingPromise,
        timeoutPromise,
      ]) as any

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (error) {
        console.error('[OnboardingGuard] Error checking onboarding:', error)
        setOnboardingError(error as Error)
        setNeedsOnboarding(false) // En cas d'erreur, on laisse passer
      } else {
        setNeedsOnboarding(!hasCompleted)
      }
    } catch (err: any) {
      console.error('[OnboardingGuard] Exception checking onboarding:', err)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setOnboardingError(err instanceof Error ? err : new Error('Erreur lors de la vérification'))
      setNeedsOnboarding(false)
    } finally {
      setCheckingOnboarding(false)
    }
  }

  const handleRetry = async () => {
    if (authError) {
      await retryAuth()
    } else if (onboardingError) {
      await checkOnboarding()
    }
  }

  // État d'erreur (auth ou onboarding)
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
  if (needsOnboarding && user) {
    return <Redirect href="/onboarding" />
  }

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
          </Stack>
        </OnboardingGuard>
      </AuthProvider>
    </ErrorBoundary>
  )
}
