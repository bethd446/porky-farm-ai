"use client"

import { useState, useEffect } from "react"
import { Sun, Cloud, CloudRain, MapPin, Loader2 } from "lucide-react"

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  location: string
  loading: boolean
  error: string | null
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 28,
    condition: "sunny",
    humidity: 65,
    location: "Abidjan, CI",
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Obtenir la géolocalisation
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000, // 5 minutes
          })
        })

        const { latitude, longitude } = position.coords

        // Appeler l'API météo (OpenWeatherMap - gratuit)
        // Note: Vous devrez créer un compte gratuit sur openweathermap.org
        const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || ""
        
        if (!API_KEY) {
          // Fallback si pas d'API key
          setWeather({
            temp: 28,
            condition: "sunny",
            humidity: 65,
            location: "Abidjan, CI",
            loading: false,
            error: null,
          })
          return
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=fr`
        )

        if (!response.ok) {
          throw new Error("Erreur API météo")
        }

        const data = await response.json()

        // Déterminer la condition météo
        let condition = "sunny"
        const main = data.weather[0]?.main?.toLowerCase() || ""
        if (main.includes("rain") || main.includes("drizzle")) {
          condition = "rainy"
        } else if (main.includes("cloud")) {
          condition = "cloudy"
        }

        // Obtenir le nom de la ville
        const cityName = data.name || "Localisation"
        const country = data.sys?.country || "CI"

        setWeather({
          temp: Math.round(data.main.temp),
          condition,
          humidity: data.main.humidity,
          location: `${cityName}, ${country}`,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Erreur météo:", error)
        // Fallback avec données par défaut
        setWeather({
          temp: 28,
          condition: "sunny",
          humidity: 65,
          location: "Abidjan, CI",
          loading: false,
          error: "Impossible de charger la météo",
        })
      }
    }

    fetchWeather()
  }, [])

  const getWeatherIcon = () => {
    if (weather.loading) {
      return <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
    }
    switch (weather.condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-amber-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      default:
        return <Sun className="h-5 w-5 text-amber-500" />
    }
  }

  return (
    <div className="hidden items-center gap-2 rounded-full bg-muted px-4 py-2 lg:flex">
      {getWeatherIcon()}
      <span className="text-sm font-medium">
        {weather.loading ? "..." : `${weather.temp}°C`}
      </span>
      <div className="h-4 w-px bg-border" />
      <MapPin className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{weather.location}</span>
    </div>
  )
}

