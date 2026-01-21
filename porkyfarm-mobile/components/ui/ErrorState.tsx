/**
 * ErrorState - Composant d'état d'erreur
 * =======================================
 * Affiche un message d'erreur avec option de réessayer
 */

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
  retryLabel?: string
  icon?: keyof typeof Ionicons.glyphMap
  compact?: boolean
}

export type { ErrorStateProps }

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erreur de chargement',
  message = 'Une erreur est survenue',
  onRetry,
  showRetry = true,
  retryLabel = 'Réessayer',
  icon = 'warning',
  compact = false,
}) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={icon} size={24} color="#F59E0B" />
        <Text style={styles.compactMessage}>{message}</Text>
        {showRetry && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactButton}>
            <Ionicons name="refresh" size={18} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color="#F59E0B" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Ionicons name="refresh" size={20} color="#FFF" />
          <Text style={styles.buttonText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    margin: 16,
    gap: 12,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  compactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ErrorState
