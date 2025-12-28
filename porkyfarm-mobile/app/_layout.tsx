import { Stack } from 'expo-router'
import { AuthProvider } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={null}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          <Stack.Screen name="debug/supabase-test" options={{ title: 'Test Supabase' }} />
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  )
}
