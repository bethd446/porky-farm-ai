/**
 * Plus - Menu des fonctionnalités supplémentaires
 * ================================================
 * Accès au profil, rapports, tâches et paramètres
 * Design unifié avec MenuListItem
 *
 * Migrated from Moti to React Native Animated
 */

import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthContext } from '../../../contexts/AuthContext'
import { MenuListItem } from '../../../components/ui/MenuListItem'
import { colors } from '../../../constants/theme'
import { useSlideIn, useCombinedAnimation } from '@/hooks/useAnimations'

interface MenuItem {
  id: string
  label: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
  route: string
}

const menuItems: MenuItem[] = [
  {
    id: 'rapports',
    label: 'Rapports',
    description: 'Statistiques et analyses',
    icon: 'bar-chart',
    color: colors.primary[500],
    route: '/(tabs)/reports',
  },
  {
    id: 'taches',
    label: 'Tâches',
    description: 'Liste des tâches à effectuer',
    icon: 'checkbox',
    color: colors.feature.tasks,
    route: '/(tabs)/plus/taches',
  },
  {
    id: 'couts',
    label: 'Coûts & Dépenses',
    description: 'Suivi des dépenses',
    icon: 'wallet',
    color: colors.feature.costs,
    route: '/(tabs)/costs',
  },
  {
    id: 'sante',
    label: 'Santé',
    description: 'Suivi sanitaire du cheptel',
    icon: 'medkit',
    color: colors.feature.health,
    route: '/(tabs)/health',
  },
  {
    id: 'reproduction',
    label: 'Reproduction',
    description: 'Gestations et saillies',
    icon: 'heart',
    color: colors.feature.reproduction,
    route: '/(tabs)/reproduction',
  },
  {
    id: 'parametres',
    label: 'Paramètres',
    description: 'Configuration de l\'app',
    icon: 'settings',
    color: colors.gray[500],
    route: '/profile/settings',
  },
]

// ═══════════════════════════════════════════════════════════════
// Animated Header Component
// ═══════════════════════════════════════════════════════════════
function AnimatedHeader() {
  const { slideIn, animatedStyle } = useSlideIn('top', 20, 400, 0)

  useEffect(() => {
    slideIn()
  }, [slideIn])

  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <Text style={styles.title}>Plus</Text>
      <Text style={styles.subtitle}>Toutes les fonctionnalités</Text>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════════
// Animated User Card Component
// ═══════════════════════════════════════════════════════════════
function AnimatedUserCard({
  email,
  userEmail,
  onPress
}: {
  email?: string | null
  userEmail?: string | null
  onPress: () => void
}) {
  const { animateIn, animatedStyle } = useCombinedAnimation({
    fade: true,
    scale: true,
    duration: 400,
    delay: 50,
  })

  useEffect(() => {
    animateIn()
  }, [animateIn])

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.userCard,
          pressed && styles.userCardPressed
        ]}
        onPress={onPress}
      >
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={28} color="#FFF" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {email?.split('@')[0] || 'Utilisateur'}
          </Text>
          <Text style={styles.userEmail}>{email || userEmail}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════════
// Animated Logout Section Component
// ═══════════════════════════════════════════════════════════════
function AnimatedLogoutSection({ onLogout }: { onLogout: () => void }) {
  const { slideIn, animatedStyle } = useSlideIn('bottom', 20, 300, 400)

  useEffect(() => {
    slideIn()
  }, [slideIn])

  return (
    <Animated.View style={[styles.logoutSection, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed
        ]}
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Screen Component
// ═══════════════════════════════════════════════════════════════
export default function PlusScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, email, signOut } = useAuthContext()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <AnimatedHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <AnimatedUserCard
          email={email}
          userEmail={user?.email}
          onPress={() => router.push('/profile')}
        />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Fonctionnalités</Text>
          {menuItems.map((item, index) => (
            <MenuListItem
              key={item.id}
              title={item.label}
              subtitle={item.description}
              icon={item.icon}
              iconColor={item.color}
              onPress={() => router.push(item.route as any)}
              delay={100 + index * 40}
            />
          ))}
        </View>

        {/* Logout Button */}
        <AnimatedLogoutSection onLogout={handleLogout} />

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PorkyFarm v2.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardPressed: {
    backgroundColor: '#F3F4F6',
    transform: [{ scale: 0.98 }],
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 13,
    color: '#D1D5DB',
  },
})
