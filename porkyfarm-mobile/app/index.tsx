import { Redirect } from 'expo-router'
import { useAuthContext } from '../contexts/AuthContext'

export default function Index() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return null
  }

  if (user) {
    return <Redirect href="/(tabs)" />
  }

  return <Redirect href="/(auth)/login" />
}

