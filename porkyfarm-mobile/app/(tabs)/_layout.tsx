import { Tabs, Redirect } from 'expo-router'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { colors, spacing, typography, radius, shadows } from '../../lib/designTokens'
import { Home, List, Plus, BarChart3, Brain } from 'lucide-react-native'
import { ActionsModal } from '../../components/ActionsModal'

// Icon component avec Lucide (style UX Pilot)
function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const iconSize = 24
  const iconColor = focused ? colors.primary : colors.mutedForeground

  switch (name) {
    case 'home':
      return <Home size={iconSize} color={iconColor} />
    case 'livestock':
      return <List size={iconSize} color={iconColor} />
    case 'reports':
      return <BarChart3 size={iconSize} color={iconColor} />
    default:
      return <Home size={iconSize} color={iconColor} />
  }
}

export default function TabsLayout() {
  const { user, loading } = useAuthContext()
  const [actionsModalVisible, setActionsModalVisible] = useState(false)

  if (loading) {
    return null // Or a loading screen
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <>
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
      {/* Alias pour animaux */}
      <Tabs.Screen
        name="animals/index"
        options={{
          href: null, // Masquer, redirige vers livestock/index
        }}
      />
      {/* Bouton central "Actions rapides" - ouvre modal */}
      <Tabs.Screen
        name="livestock/add"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centralButton, focused && styles.centralButtonFocused]}>
              <Plus size={28} color="#ffffff" />
            </View>
          ),
          tabBarLabel: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => setActionsModalVisible(true)}
              style={props.style}
            />
          ),
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
        name="reports/index"
        options={{
          title: 'Rapports',
          tabBarIcon: ({ color, focused }) => <TabIcon name="reports" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'Assistant IA',
          tabBarIcon: ({ color, focused }) => <Brain size={24} color={focused ? colors.primary : colors.mutedForeground} />,
        }}
      />
      {/* Alias pour ai-assistant/index */}
      <Tabs.Screen
        name="ai-assistant/index"
        options={{
          href: null, // Masquer, redirige vers ai-assistant
        }}
      />
      {/* Masquer les routes dynamiques et add de la tab bar */}
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
        name="costs/index"
        options={{
          href: null, // Masquer de la tab bar (remplacé par reports)
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Masquer de la tab bar (pas dans MVP)
        }}
      />
    </Tabs>
    <ActionsModal visible={actionsModalVisible} onClose={() => setActionsModalVisible(false)} />
    </>
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
