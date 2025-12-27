import { Tabs, Redirect } from 'expo-router'
import { Text } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'

// Simple icon component (à remplacer par des vraies icônes plus tard)
function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    pig: '🐷',
    health: '🏥',
    baby: '👶',
    calculator: '📊',
    ai: '🤖',
  }
  return <Text style={{ color, fontSize: 20 }}>{icons[name] || '📱'}</Text>
}

export default function TabsLayout() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return null // Or a loading screen
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="livestock/index"
        options={{
          title: 'Cheptel',
          tabBarIcon: ({ color }) => <TabIcon name="pig" color={color} />,
        }}
      />
      <Tabs.Screen
        name="health/index"
        options={{
          title: 'Santé',
          tabBarIcon: ({ color }) => <TabIcon name="health" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reproduction/index"
        options={{
          title: 'Reproduction',
          tabBarIcon: ({ color }) => <TabIcon name="baby" color={color} />,
        }}
      />
      <Tabs.Screen
        name="feeding/index"
        options={{
          title: 'Alimentation',
          tabBarIcon: ({ color }) => <TabIcon name="calculator" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'IA',
          tabBarIcon: ({ color }) => <TabIcon name="ai" color={color} />,
        }}
      />
      {/* Masquer les routes dynamiques et add de la tab bar */}
      <Tabs.Screen
        name="livestock/[id]"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
      <Tabs.Screen
        name="livestock/add"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
      <Tabs.Screen
        name="health/add"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
      <Tabs.Screen
        name="reproduction/add"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
      <Tabs.Screen
        name="feeding/add-stock"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
      {/* Masquer les routes de détail dynamiques si elles n'existent pas encore */}
      <Tabs.Screen
        name="health/[id]"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
      <Tabs.Screen
        name="reproduction/[id]"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
    </Tabs>
  )
}
