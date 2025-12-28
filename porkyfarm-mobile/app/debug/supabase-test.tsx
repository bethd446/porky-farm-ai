import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { animalsService } from '../../services/animals'
import { supabase } from '../../services/supabase/client'
import { colors, spacing, typography, radius } from '../../lib/designTokens'

interface TestResult {
  success: boolean
  message: string
}

export default function SupabaseTestScreen() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    connection?: TestResult
    auth?: TestResult & { userId?: string }
    query?: TestResult & { count?: number }
  }>({})

  const runTests = async () => {
    setLoading(true)
    setResults({})

    // Test 1: Connexion Supabase
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1)
      results.connection = {
        success: !error,
        message: error ? `❌ Erreur connexion: ${error.message}` : '✅ Connexion Supabase OK',
      }
    } catch (err) {
      results.connection = {
        success: false,
        message: `❌ Exception connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      }
    }

    // Test 2: Authentification
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        results.auth = {
          success: false,
          message: `⚠️ Non authentifié: ${authError?.message || 'Aucun utilisateur connecté'}\nConnectez-vous pour tester les requêtes.`,
        }
      } else {
        results.auth = {
          success: true,
          message: `✅ Authentifié\nUser ID: ${authUser.id.substring(0, 8)}...`,
          userId: authUser.id,
        }
      }
    } catch (err) {
      results.auth = {
        success: false,
        message: `❌ Erreur auth: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      }
    }

    // Test 3: Requête sur la table pigs (si authentifié)
    if (results.auth?.success) {
      try {
        const { data, error } = await animalsService.getAll()

        if (error) {
          results.query = {
            success: false,
            message: `❌ Erreur requête: ${error.message}`,
          }
        } else {
          const count = data?.length || 0
          results.query = {
            success: true,
            message: count > 0 ? `✅ ${count} animal(s) trouvé(s)` : '✅ Aucun animal (table vide mais connexion OK)',
            count,
          }
        }
      } catch (err) {
        results.query = {
          success: false,
          message: `❌ Exception requête: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
        }
      }
    }

    setResults({ ...results })
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Supabase</Text>
        <Text style={styles.subtitle}>Vérification de la connexion et des requêtes</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={runTests} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Lancer les tests</Text>
        )}
      </TouchableOpacity>

      {results.connection && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>1. Connexion Supabase</Text>
          <Text style={[styles.resultMessage, results.connection.success && styles.resultSuccess]}>
            {results.connection.message}
          </Text>
        </View>
      )}

      {results.auth && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>2. Authentification</Text>
          <Text style={[styles.resultMessage, results.auth.success && styles.resultSuccess]}>
            {results.auth.message}
          </Text>
        </View>
      )}

      {results.query && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>3. Requête Table (pigs)</Text>
          <Text style={[styles.resultMessage, results.query.success && styles.resultSuccess]}>
            {results.query.message}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    color: colors.mutedForeground,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    margin: spacing.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  resultCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    margin: spacing.lg,
    marginTop: 0,
  },
  resultTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  resultMessage: {
    fontSize: typography.fontSize.body,
    color: colors.error,
    fontFamily: 'monospace',
  },
  resultSuccess: {
    color: colors.success,
  },
})
