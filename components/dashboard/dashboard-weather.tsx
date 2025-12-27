"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Loader2,
  CloudFog,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const DEFAULT_LOCATION = { lat: 5.359952, lon: -4.008256, name: "Abidjan, Cote d'Ivoire" }

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  icon: string
  alerts?: Array<{
    event: string
    description: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
  }>
  location?: string
}

function getWeatherInfo(condition: string) {
  const lower = condition.toLowerCase()
  if (lower.includes('soleil') || lower.includes('clear')) {
    return { icon: Sun, description: "Ensoleillé", color: "from-amber-400 to-orange-500" }
  }
  if (lower.includes('nuage') || lower.includes('cloud')) {
    return { icon: Cloud, description: "Nuageux", color: "from-gray-400 to-gray-500" }
  }
  if (lower.includes('brouillard') || lower.includes('fog')) {
    return { icon: CloudFog, description: "Brouillard", color: "from-gray-300 to-gray-400" }
  }
  if (lower.includes('pluie') || lower.includes('rain')) {
    return { icon: CloudRain, description: "Pluie", color: "from-blue-400 to-blue-600" }
  }
  if (lower.includes('neige') || lower.includes('snow')) {
    return { icon: CloudSnow, description: "Neige", color: "from-blue-200 to-blue-300" }
  }
  if (lower.includes('orage') || lower.includes('thunder')) {
    return { icon: CloudLightning, description: "Orage", color: "from-purple-500 to-purple-700" }
  }
  return { icon: Sun, description: "Ensoleillé", color: "from-amber-400 to-orange-500" }
}

export const DashboardWeather = memo(function DashboardWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(DEFAULT_LOCATION)

  const fetchWeather = useCallback(async (latitude: number, longitude: number, locationName: string) => {
    try {
      setLoading(true)

      // Appel au backend au lieu d'OpenWeather directement
      const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)

      if (!response.ok) {
        throw new Error("Erreur API meteo")
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
      console.error('[Weather] Error:', err)
      // Fallback to default location on error
      if (locationName !== DEFAULT_LOCATION.name) {
        fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let locationName = "Votre position"
        try {
          // Utiliser le backend pour le géocodage inverse
          const geoResponse = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            }),
          })

          if (geoResponse.ok) {
            const geoResult = await geoResponse.json()
            if (geoResult.data) {
              locationName = geoResult.data.address || locationName
            }
          }
        } catch {
          // Ignore geocoding error
        }
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude, name: locationName })
        fetchWeather(position.coords.latitude, position.coords.longitude, locationName)
      },
      () => {
        fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name)
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
    )
  }, [fetchWeather])

  useEffect(() => {
    requestLocation()
    const interval = setInterval(requestLocation, 60 * 60 * 1000) // Refresh every hour
    return () => clearInterval(interval)
  }, [requestLocation])

  const weatherInfo = weather ? getWeatherInfo(weather.condition) : null
  const WeatherIcon = weatherInfo?.icon || Sun

  if (loading && !weather) {
    return (
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Meteo du jour</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-soft overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Meteo du jour</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={requestLocation} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {weather && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{weather.location}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {weather && (
          <>
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl bg-gradient-to-br ${weatherInfo?.color} p-4`}>
                <WeatherIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold text-foreground">{weather.temperature}°C</div>
                <div className="text-sm text-muted-foreground">{weatherInfo?.description}</div>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wind className="h-4 w-4" />
                {weather.windSpeed} km/h
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplets className="h-4 w-4" />
                {weather.humidity}%
              </div>
            </div>

            {weather.alerts && weather.alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                {weather.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 text-sm ${
                      alert.severity === 'extreme' || alert.severity === 'severe'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>{alert.event}:</strong> {alert.description.substring(0, 150)}
                        {alert.description.length > 150 && '...'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {weather.temperature > 35 && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <strong>Alerte chaleur :</strong> Augmentez la ventilation et l'eau.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
})
