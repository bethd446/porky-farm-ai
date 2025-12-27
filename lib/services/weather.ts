/**
 * Service météo utilisant OpenWeatherMap API
 * Backend uniquement - jamais exposé côté client
 */

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

export interface WeatherData {
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

export interface WeatherError {
  error: string
  code?: string
}

/**
 * Récupère les données météo pour une localisation donnée
 * @param lat Latitude
 * @param lon Longitude
 * @returns Données météo normalisées ou erreur
 */
export async function getWeatherForFarm(
  lat: number,
  lon: number,
): Promise<{ data: WeatherData | null; error: WeatherError | null }> {
  if (!OPENWEATHER_API_KEY) {
    return {
      data: null,
      error: {
        error: 'Service météo non configuré. Veuillez ajouter OPENWEATHER_API_KEY.',
        code: 'CONFIG_MISSING',
      },
    }
  }

  try {
    // Appel à OpenWeatherMap Current Weather API
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`

    const currentResponse = await fetch(currentUrl, {
      next: { revalidate: 300 }, // Cache 5 minutes
    })

    if (!currentResponse.ok) {
      const errorData = await currentResponse.json().catch(() => ({}))
      return {
        data: null,
        error: {
          error: errorData.message || 'Erreur lors de la récupération des données météo',
          code: `HTTP_${currentResponse.status}`,
        },
      }
    }

    const currentData = await currentResponse.json()

    // Récupérer les alertes météo (One Call 3.0 - optionnel)
    let alerts: WeatherData['alerts'] = []
    try {
      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&exclude=minutely,daily&units=metric&lang=fr`
      const oneCallResponse = await fetch(oneCallUrl, {
        next: { revalidate: 300 },
      })

      if (oneCallResponse.ok) {
        const oneCallData = await oneCallResponse.json()
        if (oneCallData.alerts && Array.isArray(oneCallData.alerts)) {
          alerts = oneCallData.alerts.map((alert: any) => ({
            event: alert.event,
            description: alert.description,
            severity: alert.severity || 'moderate',
          }))
        }
      }
    } catch {
      // Ignore les erreurs One Call (optionnel)
    }

    // Normaliser les données
    const weatherData: WeatherData = {
      temperature: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      windSpeed: Math.round((currentData.wind?.speed || 0) * 3.6), // m/s to km/h
      condition: currentData.weather[0]?.description || 'Inconnu',
      icon: getWeatherIcon(currentData.weather[0]?.id || 800),
      alerts: alerts.length > 0 ? alerts : undefined,
      location: currentData.name,
    }

    return { data: weatherData, error: null }
  } catch (err) {
    console.error('[Weather Service] Error:', err)
    return {
      data: null,
      error: {
        error: err instanceof Error ? err.message : 'Erreur inconnue lors de la récupération météo',
        code: 'NETWORK_ERROR',
      },
    }
  }
}

/**
 * Convertit le code météo OpenWeatherMap en icône
 */
function getWeatherIcon(code: number): string {
  // Codes OpenWeatherMap: https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) return '⛈️' // Thunderstorm
  if (code >= 300 && code < 400) return '🌧️' // Drizzle
  if (code >= 500 && code < 600) return '🌧️' // Rain
  if (code >= 600 && code < 700) return '❄️' // Snow
  if (code >= 700 && code < 800) return '🌫️' // Atmosphere
  if (code === 800) return '☀️' // Clear
  if (code === 801) return '🌤️' // Few clouds
  if (code >= 802 && code < 805) return '⛅' // Scattered/Broken clouds
  if (code === 805) return '☁️' // Overcast
  return '☀️'
}

/**
 * Vérifie si le service météo est configuré
 */
export function isWeatherConfigured(): boolean {
  return !!OPENWEATHER_API_KEY
}

