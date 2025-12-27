/**
 * Service de géocodage utilisant Mapbox Geocoding API
 * Backend uniquement - jamais exposé côté client
 */

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN

export interface GeocodeResult {
  lat: number
  lon: number
  address: string
  placeName?: string
}

export interface GeocodeError {
  error: string
  code?: string
}

/**
 * Convertit une adresse textuelle en coordonnées GPS
 * @param address Adresse à géocoder
 * @returns Coordonnées et adresse formatée ou erreur
 */
export async function geocodeAddress(
  address: string,
): Promise<{ data: GeocodeResult | null; error: GeocodeError | null }> {
  if (!MAPBOX_ACCESS_TOKEN) {
    return {
      data: null,
      error: {
        error: 'Service de géocodage non configuré. Veuillez ajouter MAPBOX_ACCESS_TOKEN.',
        code: 'CONFIG_MISSING',
      },
    }
  }

  if (!address || address.trim().length === 0) {
    return {
      data: null,
      error: {
        error: 'Adresse requise',
        code: 'INVALID_INPUT',
      },
    }
  }

  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&language=fr`

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache 1 heure
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        error: {
          error: errorData.message || 'Erreur lors du géocodage',
          code: `HTTP_${response.status}`,
        },
      }
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return {
        data: null,
        error: {
          error: 'Adresse introuvable',
          code: 'NOT_FOUND',
        },
      }
    }

    const feature = data.features[0]
    const [lon, lat] = feature.center

    const result: GeocodeResult = {
      lat,
      lon,
      address: feature.place_name || address,
      placeName: feature.text || feature.place_name,
    }

    return { data: result, error: null }
  } catch (err) {
    console.error('[Geocoding Service] Error:', err)
    return {
      data: null,
      error: {
        error: err instanceof Error ? err.message : 'Erreur inconnue lors du géocodage',
        code: 'NETWORK_ERROR',
      },
    }
  }
}

/**
 * Convertit des coordonnées GPS en adresse (géocodage inverse)
 * @param lat Latitude
 * @param lon Longitude
 * @returns Adresse formatée ou erreur
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{ data: GeocodeResult | null; error: GeocodeError | null }> {
  if (!MAPBOX_ACCESS_TOKEN) {
    return {
      data: null,
      error: {
        error: 'Service de géocodage non configuré. Veuillez ajouter MAPBOX_ACCESS_TOKEN.',
        code: 'CONFIG_MISSING',
      },
    }
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&language=fr`

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache 1 heure
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        error: {
          error: errorData.message || 'Erreur lors du géocodage inverse',
          code: `HTTP_${response.status}`,
        },
      }
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return {
        data: null,
        error: {
          error: 'Localisation introuvable',
          code: 'NOT_FOUND',
        },
      }
    }

    const feature = data.features[0]

    const result: GeocodeResult = {
      lat,
      lon,
      address: feature.place_name || `${lat}, ${lon}`,
      placeName: feature.text || feature.place_name,
    }

    return { data: result, error: null }
  } catch (err) {
    console.error('[Geocoding Service] Error:', err)
    return {
      data: null,
      error: {
        error: err instanceof Error ? err.message : 'Erreur inconnue lors du géocodage inverse',
        code: 'NETWORK_ERROR',
      },
    }
  }
}

/**
 * Vérifie si le service de géocodage est configuré
 */
export function isGeocodingConfigured(): boolean {
  return !!MAPBOX_ACCESS_TOKEN
}

