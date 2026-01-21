/**
 * TabsLayout - Navigation principale avec 5 onglets
 * ==================================================
 * Accueil | Cheptel | + | Aliment | Plus
 */

import { Tabs, Redirect } from 'expo-router'
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthContext } from '../../contexts/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { ActionsModal } from '../../components/ActionsModal'
import { LinearGradient } from 'expo-linear-gradient'

// Composant FAB central avec gradient
function FABButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.fabWrapper}
    >
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabGradient}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default function TabsLayout() {
  const { user } = useAuthContext()
  const [actionsModalVisible, setActionsModalVisible] = useState(false)
  const insets = useSafeAreaInsets()

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  const tabBarHeight = 65 + Math.max(insets.bottom, 8)

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            height: tabBarHeight,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
              },
              android: {
                elevation: 8,
              },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        {/* ========== ONGLETS VISIBLES ========== */}

        {/* 1. Accueil */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* 2. Cheptel */}
        <Tabs.Screen
          name="livestock/index"
          options={{
            title: 'Cheptel',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'paw' : 'paw-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* 3. FAB Central (+) */}
        <Tabs.Screen
          name="livestock/add"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: () => (
              <View style={styles.fabContainer}>
                <FABButton onPress={() => setActionsModalVisible(true)} />
              </View>
            ),
          }}
        />

        {/* 4. Alimentation (dossier avec _layout.tsx = navigateur imbriqué) */}
        <Tabs.Screen
          name="alimentation"
          options={{
            title: 'Aliment',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'leaf' : 'leaf-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* 5. Plus (Menu) */}
        <Tabs.Screen
          name="plus/index"
          options={{
            title: 'Plus',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* ========== ROUTES CACHÉES (avec header) ========== */}

        {/* Livestock - Detail avec header pour edit/delete */}
        <Tabs.Screen name="livestock/[id]" options={{ href: null, headerShown: true }} />

        {/* Health */}
        <Tabs.Screen name="health/index" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="health/add" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="health/[id]" options={{ href: null, headerShown: true }} />

        {/* Reproduction */}
        <Tabs.Screen name="reproduction/index" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="reproduction/add" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="reproduction/[id]" options={{ href: null, headerShown: true }} />

        {/* Feeding (legacy) */}
        <Tabs.Screen name="feeding/index" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="feeding/add-stock" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="feeding/formulate" options={{ href: null, headerShown: true }} />

        {/* Note: Les sous-routes alimentation sont gérées par alimentation/_layout.tsx */}

        {/* Costs */}
        <Tabs.Screen name="costs/index" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="costs/add" options={{ href: null, headerShown: true }} />
        <Tabs.Screen name="costs/[id]" options={{ href: null, headerShown: true }} />

        {/* Reports */}
        <Tabs.Screen name="reports/index" options={{ href: null, headerShown: true }} />

        {/* Plus (sous-routes) */}
        <Tabs.Screen name="plus/taches" options={{ href: null, headerShown: true }} />

        {/* IA - Masqué (ancienne route) */}
        <Tabs.Screen name="ai-assistant" options={{ href: null }} />
      </Tabs>

      <ActionsModal visible={actionsModalVisible} onClose={() => setActionsModalVisible(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -24,
  },
  fabWrapper: {
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
