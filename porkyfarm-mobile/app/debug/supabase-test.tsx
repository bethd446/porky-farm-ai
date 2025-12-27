import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { supabase } from '../../services/supabase/client'
import { animalsService } from '../../services/animals'

export default function SupabaseTestScreen() {
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<{
    connection: { success: boolean; message: string }
    auth: { success: boolean; message: string; userId?: string }
    query: { success: boolean; message: string; count?: number }
  } | null>(null)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setLoading(true)
    const results = {
      connection: { success: false, message: '' },
      auth: { success: false, message: '' },
      query: { success: false, message: '' },
    }

    // Test 1: Vérifier les variables d'environnement
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      results.connection = {
        success: false,
        message: '❌ Variables EXPO_PUBLIC_SUPABASE_* non définies dans .env.local',
      }
      setTestResults(results)
      setLoading(false)
      return
    }

    results.connection = {
      success: true,
      message: `✅ Variables configurées\nURL: ${supabaseUrl.substring(0, 30)}...`,
    }

    // Test 2: Vérifier l'authentification
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        results.auth = {
          success: false,
          message: `⚠️ Non authentifié: ${authError?.message || 'Aucun utilisateur connecté'}\nConnectez-vous pour tester les requêtes.`,
        }
      } else {
        results.auth = {
          success: true,
          message: `✅ Authentifié\nUser ID: ${user.id.substring(0, 8)}...`,
          userId: user.id,
        }
      }
    } catch (err) {
      results.auth = {
        success: false,
        message: `❌ Erreur auth: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      }
    }

    // Test 3: Requête sur la table pigs (si authentifié)
    if (results.auth.success) {
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
          message: `❌ Exception: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
        }
      }
    } else {
      results.query = {
        success: false,
        message: '⏭️ Test ignoré (non authentifié)',
      }
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Supabase</Text>
        <Text style={styles.subtitle}>Validation de la configuration</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Exécution des tests...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Test Connection */}
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>1. Variables d'environnement</Text>
            <Text
              style={[
                styles.testMessage,
                testResults?.connection.success ? styles.success : styles.error,
              ]}
            >
              {testResults?.connection.message}
            </Text>
          </View>

          {/* Test Auth */}
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>2. Authentification</Text>
            <Text
              style={[styles.testMessage, testResults?.auth.success ? styles.success : styles.warning]}
            >
              {testResults?.auth.message}
            </Text>
          </View>

          {/* Test Query */}
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>3. Requête Supabase (table pigs)</Text>
            <Text
              style={[
                styles.testMessage,
                testResults?.query.success ? styles.success : styles.error,
              ]}
            >
              {testResults?.query.message}
            </Text>
            {testResults?.query.count !== undefined && testResults.query.count > 0 && (
              <Text style={styles.countText}>Nombre d'animaux: {testResults.query.count}</Text>
            )}
          </View>

          {/* Bouton Re-test */}
          <TouchableOpacity style={styles.button} onPress={runTests}>
            <Text style={styles.buttonText}>🔄 Relancer les tests</Text>
          </TouchableOpacity>

          {/* Instructions */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ Instructions</Text>
            <Text style={styles.infoText}>
              • Si "Non authentifié", connectez-vous d'abord dans l'app{'\n'}
              • Si erreur de requête, vérifiez que RLS est configuré sur Supabase{'\n'}
              • Les variables doivent être dans .env.local (pas commitées)
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  testCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  testMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  success: {
    color: '#22c55e',
  },
  error: {
    color: '#ef4444',
  },
  warning: {
    color: '#f59e0b',
  },
  countText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0369a1',
  },
  infoText: {
    fontSize: 14,
    color: '#075985',
    lineHeight: 20,
  },
})

