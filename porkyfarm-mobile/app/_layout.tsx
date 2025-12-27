import { Stack } from 'expo-router'
import { AuthProvider } from '../contexts/AuthContext'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="debug/supabase-test" options={{ title: 'Test Supabase' }} />
      </Stack>
    </AuthProvider>
  )
}
