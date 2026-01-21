/**
 * ScreenWrapper - Wrapper uniforme pour tous les écrans
 * ======================================================
 * Gère loading, error, empty states et refresh
 */

import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  Text,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { EmptyState } from '../EmptyState'
import { ErrorState } from './ErrorState'

interface ScreenWrapperProps {
  children: React.ReactNode
  loading?: boolean
  refreshing?: boolean
  error?: string | null
  isEmpty?: boolean
  onRefresh?: () => void
  emptyIcon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap
  emptyEmoji?: string
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: React.ReactNode
  scrollable?: boolean
  style?: ViewStyle
  contentStyle?: ViewStyle
  showHeader?: boolean
}

export function ScreenWrapper({
  children,
  loading = false,
  refreshing = false,
  error = null,
  isEmpty = false,
  onRefresh,
  emptyIcon = 'file-tray-outline',
  emptyEmoji,
  emptyTitle = 'Aucune donnée',
  emptyMessage = 'Aucun élément à afficher',
  emptyAction,
  scrollable = true,
  style,
  contentStyle,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets()

  // État de chargement initial
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>Chargement...</Text>
        </View>
      </View>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ErrorState
          title="Erreur"
          message={error}
          onRetry={onRefresh}
        />
      </View>
    )
  }

  // État vide
  if (isEmpty) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState
          icon={emptyIcon}
          emoji={emptyEmoji}
          title={emptyTitle}
          description={emptyMessage}
        >
          {emptyAction}
        </EmptyState>
      </View>
    )
  }

  // Contenu normal
  if (scrollable) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
              colors={['#10B981']}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
})

export default ScreenWrapper

