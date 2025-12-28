import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { healthCasesService, type HealthCase } from '../../../services/healthCases'

const getSeverityColor = (severity: string | null) => {
  switch (severity) {
    case 'critical':
      return '#dc2626'
    case 'high':
      return '#ef4444'
    case 'medium':
      return '#f59e0b'
    case 'low':
      return '#22c55e'
    default:
      return '#6b7280'
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ongoing: 'En cours',
    resolved: 'Résolu',
    scheduled: 'Planifié',
    chronic: 'Chronique',
  }
  return labels[status] || status
}

export default function HealthScreen() {
  const [cases, setCases] = useState<HealthCase[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    const { data, error } = await healthCasesService.getAll()
    if (error) {
      console.error('Error loading health cases:', error)
      // Ne pas afficher d'alerte si c'est juste une liste vide
      if (error.message && !error.message.includes('does not exist')) {
        Alert.alert('Erreur', `Impossible de charger les cas de santé: ${error.message}`)
      }
    }
    setCases(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suivi Sanitaire</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/health/add')}>
          <Text style={styles.addButtonText}>+ Nouveau cas</Text>
        </TouchableOpacity>
      </View>

      {cases.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucun cas de santé enregistré</Text>
          <Text style={styles.emptySubtext}>Commencez par ajouter un cas de santé pour suivre la santé de vos animaux</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/health/add')}>
            <Text style={styles.addButtonText}>Ajouter un cas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.caseCard}
              onPress={() => {
                // TODO: Implémenter l'écran de détail health/[id]
                Alert.alert('Détail du cas', `Cas: ${item.title}\nAnimal: ${item.pig_name || item.pig_identifier || 'Inconnu'}\nDescription: ${item.description || 'Aucune'}`)
              }}
            >
              <View style={styles.caseHeader}>
                <Text style={styles.caseTitle}>{item.issue}</Text>
                <View
                  style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}
                >
                  <Text style={styles.priorityText}>
                    {item.priority === 'high' ? 'Haute' : item.priority === 'medium' ? 'Moyenne' : 'Faible'}
                  </Text>
                </View>
              </View>
              <Text style={styles.caseAnimal}>
                {item.animal_name || 'Animal inconnu'}
              </Text>
              <Text style={styles.caseDescription} numberOfLines={2}>
                {item.description || 'Aucune description'}
              </Text>
              <View style={styles.caseFooter}>
                <Text style={styles.caseStatus}>{getStatusLabel(item.status)}</Text>
                <Text style={styles.caseDate}>
                  {item.start_date ? new Date(item.start_date).toLocaleDateString('fr-FR') : 'Date inconnue'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          refreshing={loading}
          onRefresh={loadCases}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContent: {
    padding: 16,
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  caseAnimal: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  caseDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  caseStatus: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  caseDate: {
    fontSize: 12,
    color: '#6b7280',
  },
})
