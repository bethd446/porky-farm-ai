import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { supabase } from '../services/supabase/client'

// URL API backend - utiliser 127.0.0.1 pour iOS simulator, localhost pour Android/Web
const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (envUrl) {
    // Si l'URL contient localhost et qu'on est sur iOS, remplacer par 127.0.0.1
    if (envUrl.includes('localhost') && Platform.OS === 'ios') {
      return envUrl.replace('localhost', '127.0.0.1')
    }
    return envUrl
  }
  // Fallback : utiliser 127.0.0.1 pour iOS, localhost pour le reste
  return Platform.OS === 'ios' ? 'http://127.0.0.1:3000' : 'http://localhost:3000'
}

const API_URL = getApiUrl()

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  icon: string
  location?: string
}

const DEFAULT_LOCATION = { lat: 5.359952, lon: -4.008256, name: 'Abidjan, Côte d\'Ivoire' }

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(DEFAULT_LOCATION)

  const fetchWeather = async (lat: number, lon: number, locationName: string) => {
    try {
      setLoading(true)

      // Récupérer le token de session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      // Appel au backend
      const response = await fetch(`${API_URL}/api/weather?lat=${lat}&lon=${lon}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur API météo')
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setWeather({
        ...result.data,
        location: locationName,
      })
    } catch (err) {
      console.error('[Weather Widget] Error:', err)
      // Fallback to default location on error
      if (locationName !== DEFAULT_LOCATION.name) {
        fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Pour l'instant, utiliser la localisation par défaut (Abidjan)
    // TODO: Ajouter expo-location pour la géolocalisation native
    fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name)
  }, [])

  if (loading && !weather) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Météo</Text>
        </View>
        <View style={styles.content}>
          <ActivityIndicator size="small" color="#2d6a4f" />
        </View>
      </View>
    )
  }

  if (!weather) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Météo du jour</Text>
        <Text style={styles.location}>{weather.location}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.temperatureRow}>
          <Text style={styles.icon}>{weather.icon}</Text>
          <View>
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
          </View>
        </View>
        <View style={styles.details}>
          <Text style={styles.detailText}>💨 {weather.windSpeed} km/h</Text>
          <Text style={styles.detailText}>💧 {weather.humidity}%</Text>
        </View>
        {weather.temperature > 35 && (
          <View style={styles.alert}>
            <Text style={styles.alertText}>⚠️ Alerte chaleur: Augmentez la ventilation</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
  },
  content: {
    gap: 8,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 32,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  condition: {
    fontSize: 14,
    color: '#6b7280',
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  alert: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  alertText: {
    fontSize: 12,
    color: '#dc2626',
  },
})

