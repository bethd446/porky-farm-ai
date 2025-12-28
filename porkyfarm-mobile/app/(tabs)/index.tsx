import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import { animalsService } from '../../services/animals'
import { healthCasesService } from '../../services/healthCases'
import { gestationsService } from '../../services/gestations'
import { feedingService } from '../../services/feeding'
// Temporairement désactivé : WeatherWidget nécessite une route backend stable
// import { WeatherWidget } from '../../components/WeatherWidget'
import type { Animal } from '../../services/animals'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export default function DashboardScreen() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalAnimals: 0,
    truies: 0,
    verrats: 0,
    porcelets: 0,
    porcs: 0,
    gestationsActives: 0,
    casSanteActifs: 0,
    totalStock: 0,
    loading: true,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Charger les animaux
      const { data: animals } = await animalsService.getAll()
      const animalsList = animals || []
      const activeAnimals = animalsList.filter((a) => a.status === 'active' || a.status === 'sick' || a.status === 'pregnant' || a.status === 'nursing')

      // Charger les cas de santé
      const { data: healthCases } = await healthCasesService.getAll()
      const casesList = healthCases || []
      const activeCases = casesList.filter((c) => c.status === 'active' || c.status === 'monitoring')

      // Charger les gestations
      const { data: gestations } = await gestationsService.getAll()
      const gestationsList = gestations || []
      const activeGestations = gestationsList.filter(
        (g) => g.status === 'pregnant' || g.status === 'farrowed' || g.status === 'weaning'
      )

      // Charger le stock
      const { data: stock } = await feedingService.getStock()
      const stockList = stock || []

      setStats({
        totalAnimals: activeAnimals.length,
        truies: activeAnimals.filter((a) => a.category === 'sow').length,
        verrats: activeAnimals.filter((a) => a.category === 'boar').length,
        porcelets: activeAnimals.filter((a) => a.category === 'piglet').length,
        porcs: activeAnimals.filter((a) => a.category === 'fattening').length,
        gestationsActives: activeGestations.length,
        casSanteActifs: activeCases.length,
        totalStock: stockList.reduce((sum, item) => sum + item.quantity_kg, 0),
        loading: false,
      })
    } catch (err) {
      console.error('Error loading stats:', err)
      setStats((prev) => ({ ...prev, loading: false }))
    }
  }

  const firstName = user?.email?.split('@')[0] || 'Éleveur'

  if (stats.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {firstName} !</Text>
        <Text style={styles.subtitle}>
          {stats.totalAnimals > 0
            ? `Votre élevage compte ${stats.totalAnimals} animal${stats.totalAnimals > 1 ? 'aux' : ''}`
            : 'Commencez par ajouter vos animaux pour suivre votre élevage'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Widget Météo - Temporairement désactivé en attente de stabilisation backend */}
        {/* <WeatherWidget /> */}

        {/* Stats Grid - Vue d'ensemble chiffrée */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardPrimary]}
            onPress={() => router.push('/(tabs)/livestock')}
          >
            <Text style={styles.statValue}>{stats.totalAnimals}</Text>
            <Text style={styles.statLabel}>Vos animaux</Text>
            <Text style={styles.statChange}>
              {stats.totalAnimals === 0 ? 'Aucun animal' : `${stats.truies} truies, ${stats.verrats} verrats`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardReproduction]}
            onPress={() => router.push('/(tabs)/reproduction')}
          >
            <Text style={styles.statValue}>{stats.gestationsActives}</Text>
            <Text style={styles.statLabel}>Gestations en cours</Text>
            <Text style={styles.statChange}>
              {stats.gestationsActives === 0 ? 'Aucune gestation' : `Sur ${stats.truies} truie(s)`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, stats.casSanteActifs === 0 ? styles.statCardSuccess : styles.statCardWarning]}
            onPress={() => router.push('/(tabs)/health')}
          >
            <Text style={styles.statValue}>{stats.casSanteActifs}</Text>
            <Text style={styles.statLabel}>Problèmes de santé</Text>
            <Text style={[styles.statChange, stats.casSanteActifs > 0 && styles.statChangeWarning]}>
              {stats.casSanteActifs === 0 ? 'Tout va bien' : 'À surveiller'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardSuccess]}
            onPress={() => router.push('/(tabs)/feeding')}
          >
            <Text style={styles.statValue}>{stats.totalStock.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Stock d'aliments</Text>
            <Text style={styles.statChange}>Total en kg</Text>
          </TouchableOpacity>
        </View>

        {/* Répartition par catégorie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition par catégorie</Text>
          <View style={styles.categoryCard}>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Truies</Text>
              <Text style={styles.categoryValue}>{stats.truies}</Text>
            </View>
            <View style={styles.categoryDivider} />
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Verrats</Text>
              <Text style={styles.categoryValue}>{stats.verrats}</Text>
            </View>
            <View style={styles.categoryDivider} />
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Porcelets</Text>
              <Text style={styles.categoryValue}>{stats.porcelets}</Text>
            </View>
            <View style={styles.categoryDivider} />
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Porcs d'engraissement</Text>
              <Text style={styles.categoryValue}>{stats.porcs}</Text>
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/livestock/add')}
            >
              <Text style={styles.actionButtonText}>+ Animal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/health/add')}
            >
              <Text style={styles.actionButtonText}>+ Cas santé</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/reproduction/add')}
            >
              <Text style={styles.actionButtonText}>+ Saillie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/feeding/add-stock')}
            >
              <Text style={styles.actionButtonText}>+ Stock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#2d6a4f',
  },
  statCardReproduction: {
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  statChangeWarning: {
    color: '#f59e0b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  categoryLabel: {
    fontSize: 16,
    color: '#374151',
  },
  categoryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
