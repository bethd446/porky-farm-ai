"use client"

import { useState, useEffect, useCallback } from "react"

interface WeatherData {
  temperature: number
  humidity: number
  description: string
  icon: string
  city: string
  windSpeed: number
  feelsLike: number
  uvIndex?: number
}

interface UseWeatherOptions {
  defaultCity?: string
  defaultLat?: number
  defaultLon?: number
}

export function useWeather(options: UseWeatherOptions = {}) {
  const { defaultCity = "Abidjan", defaultLat = 5.36, defaultLon = -4.01 } = options

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false)

  const fetchWeather = useCallback(
    async (lat: number, lon: number, isDefault = false) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&timezone=auto`,
        )

        if (!response.ok) throw new Error("Weather API error")

        const data = await response.json()
        const current = data.current

        const weatherCodes: Record<number, { description: string; icon: string }> = {
          0: { description: "Ensoleillé", icon: "sun" },
          1: { description: "Peu nuageux", icon: "cloud-sun" },
          2: { description: "Partiellement nuageux", icon: "cloud-sun" },
          3: { description: "Nuageux", icon: "cloud" },
          45: { description: "Brouillard", icon: "cloud-fog" },
          48: { description: "Brouillard givrant", icon: "cloud-fog" },
          51: { description: "Bruine légère", icon: "cloud-drizzle" },
          53: { description: "Bruine", icon: "cloud-drizzle" },
          55: { description: "Bruine dense", icon: "cloud-drizzle" },
          61: { description: "Pluie légère", icon: "cloud-rain" },
          63: { description: "Pluie", icon: "cloud-rain" },
          65: { description: "Pluie forte", icon: "cloud-rain" },
          80: { description: "Averses", icon: "cloud-rain" },
          95: { description: "Orage", icon: "cloud-lightning" },
        }

        const weatherInfo = weatherCodes[current.weather_code] || {
          description: "Variable",
          icon: "cloud",
        }

        setWeather({
          temperature: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          description: weatherInfo.description,
          icon: weatherInfo.icon,
          city: isDefault ? defaultCity : "Votre position",
          windSpeed: Math.round(current.wind_speed_10m),
          feelsLike: Math.round(current.apparent_temperature),
        })

        setUsingDefaultLocation(isDefault)
        setError(null)
      } catch (err) {
        console.error("Error fetching weather:", err)
        setError("Impossible de récupérer la météo")

        // Set fallback data
        setWeather({
          temperature: 28,
          humidity: 75,
          description: "Partiellement nuageux",
          icon: "cloud-sun",
          city: defaultCity,
          windSpeed: 12,
          feelsLike: 30,
        })
        setUsingDefaultLocation(true)
      } finally {
        setLoading(false)
      }
    },
    [defaultCity],
  )

  const getLocation = useCallback(() => {
    setLoading(true)

    if (!navigator.geolocation) {
      fetchWeather(defaultLat, defaultLon, true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude, false)
      },
      () => {
        fetchWeather(defaultLat, defaultLon, true)
      },
      { timeout: 5000, enableHighAccuracy: false },
    )
  }, [fetchWeather, defaultLat, defaultLon])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  return {
    weather,
    loading,
    error,
    usingDefaultLocation,
    refresh: getLocation,
  }
}
