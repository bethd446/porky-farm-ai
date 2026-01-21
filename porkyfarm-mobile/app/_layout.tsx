import { Stack } from 'expo-router'
import * as Sentry from '@sentry/react-native'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { RefreshProvider } from '../contexts/RefreshContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ToastProvider } from '../components/ToastProvider'
import { OnboardingGuard } from '../lib/onboarding/guards/OnboardingGuard'

// Initialisation Sentry (une seule fois au démarrage)
Sentry.init({
  dsn: 'https://b40aa221a561510f5ecc76979abccfee@o4510515944357888.ingest.de.sentry.io/4510619713994832',
  sendDefaultPii: true,
  enableNative: true,
  enableAutoSessionTracking: true,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
})

function RootLayout() {
  return (
    <ErrorBoundary fallback={null}>
      <ThemeProvider>
        <AuthProvider>
          <RefreshProvider>
            <ToastProvider>
              <OnboardingGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="debug/supabase-test" options={{ title: 'Test Supabase' }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
              </Stack>
              </OnboardingGuard>
            </ToastProvider>
          </RefreshProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

// Wrap avec Sentry pour capturer les erreurs React
export default Sentry.wrap(RootLayout)
