import { Tabs, Redirect } from 'expo-router'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { Home, List, Plus, BarChart3, User } from 'lucide-react-native'

// Icon component avec Lucide (style UX Pilot)
function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const iconSize = 24
  const iconColor = focused ? colors.primary : colors.mutedForeground

  switch (name) {
    case 'home':
      return <Home size={iconSize} color={iconColor} />
    case 'livestock':
      return <List size={iconSize} color={iconColor} />
    case 'add':
      return null // Géré séparément pour le bouton central
    case 'reports':
      return <BarChart3 size={iconSize} color={iconColor} />
    case 'profile':
      return <User size={iconSize} color={iconColor} />
    default:
      return <Home size={iconSize} color={iconColor} />
  }
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: spacing.base,
          paddingTop: spacing.sm,
          ...shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.caption,
          fontWeight: typography.fontWeight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="livestock/index"
        options={{
          title: 'Animaux',
          tabBarIcon: ({ color, focused }) => <TabIcon name="livestock" color={color} focused={focused} />,
        }}
      />
      {/* Bouton central "Ajouter" - style UX Pilot */}
      <Tabs.Screen
        name="livestock/add"
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centralButton, focused && styles.centralButtonFocused]}>
              <Plus size={28} color="#ffffff" />
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <Tabs.Screen
        name="costs/index"
        options={{
          title: 'Rapports',
          tabBarIcon: ({ color, focused }) => <TabIcon name="reports" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => <TabIcon name="profile" color={color} focused={focused} />,
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
      <Tabs.Screen
        name="costs/add"
        options={{
          href: null, // Masquer de la tab bar
        }}
      />
      {/* Masquer les autres routes de la tab bar */}
      <Tabs.Screen
        name="health/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reproduction/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="feeding/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  centralButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.base,
    ...shadows.lg,
  },
  centralButtonFocused: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 1.05 }],
  },
})
