import { Stack, Redirect } from 'expo-router'
import { AuthProvider, useAuthContext } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useEffect, useState, ReactNode } from 'react'
import { onboardingService } from '../services/onboarding'
import { ActivityIndicator, View } from 'react-native'
import { colors } from '../lib/designTokens'

function OnboardingGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuthContext()
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      checkOnboarding()
    } else if (!authLoading && !user) {
      setCheckingOnboarding(false)
    }
  }, [user, authLoading])

  const checkOnboarding = async () => {
    try {
      const { hasCompleted, error } = await onboardingService.checkOnboardingStatus()
      if (error) {
        console.error('Error checking onboarding:', error)
        setNeedsOnboarding(false) // En cas d'erreur, on laisse passer
      } else {
        setNeedsOnboarding(!hasCompleted)
      }
    } catch (err) {
      console.error('Error checking onboarding:', err)
      setNeedsOnboarding(false)
    } finally {
      setCheckingOnboarding(false)
    }
  }

  if (authLoading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

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
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="debug/supabase-test" options={{ title: 'Test Supabase' }} />
          </Stack>
        </OnboardingGuard>
      </AuthProvider>
    </ErrorBoundary>
  )
}
