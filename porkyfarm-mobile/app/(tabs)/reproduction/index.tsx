import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { gestationsService, type Gestation } from '../../../services/gestations'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pregnant':
      return '#3b82f6'
    case 'farrowed':
      return '#22c55e'
    case 'weaning':
      return '#eab308'
    case 'completed':
      return '#6b7280'
    case 'aborted':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pregnant: 'En gestation',
    farrowed: 'Mise-bas',
    weaning: 'Sevrage',
    completed: 'Terminée',
    aborted: 'Avortée',
  }
  return labels[status] || status
}

export default function ReproductionScreen() {
  const [gestations, setGestations] = useState<Gestation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadGestations()
  }, [])

  const loadGestations = async () => {
    setLoading(true)
    const { data, error } = await gestationsService.getAll()
    if (error) {
      console.error('Error loading gestations:', error)
      // Ne pas afficher d'alerte si c'est juste une liste vide
      if (error.message && !error.message.includes('does not exist')) {
        console.warn('Erreur chargement gestations:', error.message)
      }
    }
    setGestations(data || [])
    setLoading(false)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getDaysRemaining = (expectedDate: string | null) => {
    if (!expectedDate) return null
    const today = new Date()
    const expected = new Date(expectedDate)
    const diff = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
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
        <Text style={styles.title}>Reproduction</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/reproduction/add')}
        >
          <Text style={styles.addButtonText}>+ Nouvelle saillie</Text>
        </TouchableOpacity>
      </View>

      {gestations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucune gestation enregistrée</Text>
          <Text style={styles.emptySubtext}>Enregistrez une saillie pour suivre les gestations de vos truies</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/reproduction/add')}
          >
            <Text style={styles.addButtonText}>Enregistrer une saillie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gestations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const daysRemaining = getDaysRemaining(item.expected_farrowing_date)
            return (
              <TouchableOpacity
                style={styles.gestationCard}
                onPress={() => {
                  // TODO: Implémenter l'écran de détail reproduction/[id]
                  Alert.alert('Détail de la gestation', `Truie: ${item.sow_name || item.sow_identifier || 'Inconnue'}\nDate de saillie: ${formatDate(item.mating_date)}\nMise-bas prévue: ${formatDate(item.expected_farrowing_date)}`)
                }}
              >
                <View style={styles.gestationHeader}>
                  <View>
                    <Text style={styles.gestationSow}>
                      Truie: {item.sow_name || item.sow_identifier || 'Inconnue'}
                    </Text>
                    {item.boar_name && (
                      <Text style={styles.gestationBoar}>Verrat: {item.boar_name}</Text>
                    )}
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
                  >
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>
                <View style={styles.gestationInfo}>
                  <Text style={styles.gestationDate}>Saillie: {formatDate(item.mating_date)}</Text>
                  {item.expected_farrowing_date && (
                    <Text style={styles.gestationDate}>
                      Mise-bas prévue: {formatDate(item.expected_farrowing_date)}
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <Text style={styles.daysRemaining}> ({daysRemaining} jours)</Text>
                      )}
                    </Text>
                  )}
                  {item.piglets_born_alive !== null && (
                    <Text style={styles.gestationPiglets}>
                      Porcelets nés: {item.piglets_born_alive}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )
          }}
          refreshing={loading}
          onRefresh={loadGestations}
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
  gestationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gestationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gestationSow: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  gestationBoar: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gestationInfo: {
    marginTop: 8,
  },
  gestationDate: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  daysRemaining: {
    fontWeight: '600',
    color: '#2d6a4f',
  },
  gestationPiglets: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
})
