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
} from "lucide-react"
import { Button } from "@/components/ui/button"

function getWeatherInfo(code: number) {
  if (code === 0) return { icon: Sun, description: "Ensoleille", color: "from-amber-400 to-orange-500" }
  if (code <= 3) return { icon: Cloud, description: "Nuageux", color: "from-gray-400 to-gray-500" }
  if (code <= 49) return { icon: CloudFog, description: "Brouillard", color: "from-gray-300 to-gray-400" }
  if (code <= 69) return { icon: CloudRain, description: "Pluie", color: "from-blue-400 to-blue-600" }
  if (code <= 79) return { icon: CloudSnow, description: "Neige", color: "from-blue-200 to-blue-300" }
  if (code <= 99) return { icon: CloudLightning, description: "Orage", color: "from-purple-500 to-purple-700" }
  return { icon: Sun, description: "Ensoleille", color: "from-amber-400 to-orange-500" }
}

function getWeatherIcon(code: number) {
  return getWeatherInfo(code).icon
}

const DEFAULT_LOCATION = { lat: 5.359952, lon: -4.008256, name: "Abidjan, Cote d'Ivoire" }

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  hourly: { time: string; temp: number; weatherCode: number }[]
  location: string
}

export const DashboardWeather = memo(function DashboardWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWeather = useCallback(async (latitude: number, longitude: number, locationName: string) => {
    try {
      setLoading(true)

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=1`,
      )

      if (!response.ok) throw new Error("Erreur API meteo")

      const data = await response.json()

      const currentHour = new Date().getHours()
      const hourlyData = []
      for (let i = 0; i < 5; i++) {
        const hourIndex = currentHour + i * 3
        if (hourIndex < 24) {
          hourlyData.push({
            time: `${hourIndex.toString().padStart(2, "0")}h`,
            temp: Math.round(data.hourly.temperature_2m[hourIndex]),
            weatherCode: data.hourly.weather_code[hourIndex],
          })
        }
      }

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        hourly: hourlyData,
        location: locationName,
      })
    } catch (err) {
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
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=fr`,
          )
          if (geoResponse.ok) {
            const geoData = await geoResponse.json()
            locationName =
              geoData.address?.city || geoData.address?.town || geoData.address?.village || "Votre position"
          }
        } catch {
          // Ignore geocoding error
        }
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
    const interval = setInterval(requestLocation, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [requestLocation])

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null
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

            <div className="mt-6 flex justify-between">
              {weather.hourly.map((hour, i) => {
                const HourIcon = getWeatherIcon(hour.weatherCode)
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{hour.time}</span>
                    <HourIcon className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">{hour.temp}°</span>
                  </div>
                )
              })}
            </div>

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
