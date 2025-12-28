import { Tabs, Redirect } from 'expo-router'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { colors, spacing, typography } from '../../lib/designTokens'
import { Home, PiggyBank, Plus, FileText, Brain } from 'lucide-react-native'
import { useState } from 'react'
import { ActionsModal } from '../../components/ActionsModal'

function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const iconSize = 24
  const iconColor = focused ? colors.primary : color

  switch (name) {
    case 'index':
      return <Home size={iconSize} color={iconColor} />
    case 'livestock':
      return <PiggyBank size={iconSize} color={iconColor} />
    case 'add':
      return <Plus size={iconSize} color={iconColor} />
    case 'reports':
      return <FileText size={iconSize} color={iconColor} />
    case 'ai-assistant':
      return <Brain size={iconSize} color={iconColor} />
    default:
      return null
  }
}

export default function TabsLayout() {
  const { user } = useAuthContext()
  const [actionsModalVisible, setActionsModalVisible] = useState(false)

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
            height: 60,
            paddingBottom: spacing.sm,
            paddingTop: spacing.sm,
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
            tabBarIcon: ({ color, focused }) => <TabIcon name="index" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="livestock/index"
          options={{
            title: 'Animaux',
            tabBarIcon: ({ color, focused }) => <TabIcon name="livestock" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="livestock/add"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => <TabIcon name="add" color={color} focused={focused} />,
            tabBarButton: (props) => {
              const { delayLongPress, ...restProps } = props
              return (
                <TouchableOpacity
                  {...restProps}
                  style={[styles.fabButton, restProps.style]}
                  onPress={() => setActionsModalVisible(true)}
                >
                  <Plus size={28} color="#fff" />
                </TouchableOpacity>
              )
            },
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
            tabBarIcon: ({ color, focused }) => <TabIcon name="ai-assistant" color={color} focused={focused} />,
          }}
        />
        {/* Cacher les autres routes du tab bar */}
        <Tabs.Screen
          name="livestock/[id]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="health/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="health/add"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="health/[id]"
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
          name="reproduction/add"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="reproduction/[id]"
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
          name="feeding/add-stock"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="costs/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="costs/add"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="costs/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <ActionsModal visible={actionsModalVisible} onClose={() => setActionsModalVisible(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
