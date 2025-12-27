import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress, reverseGeocode } from '@/lib/services/geocoding'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) return null

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { address, lat, lon } = body

    // Géocodage direct (adresse -> coordonnées)
    if (address) {
      const { data, error } = await geocodeAddress(address)

      if (error) {
        return NextResponse.json(
          { error: error.error, code: error.code },
          { status: error.code === 'CONFIG_MISSING' ? 503 : error.code === 'NOT_FOUND' ? 404 : 500 },
        )
      }

      return NextResponse.json({ data }, { status: 200 })
    }

    // Géocodage inverse (coordonnées -> adresse)
    if (lat !== undefined && lon !== undefined) {
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Coordonnées invalides' },
          { status: 400 },
        )
      }

      const { data, error } = await reverseGeocode(latitude, longitude)

      if (error) {
        return NextResponse.json(
          { error: error.error, code: error.code },
          { status: error.code === 'CONFIG_MISSING' ? 503 : error.code === 'NOT_FOUND' ? 404 : 500 },
        )
      }

      return NextResponse.json({ data }, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Paramètres invalides: address ou (lat, lon) requis' },
      { status: 400 },
    )
  } catch (err) {
    console.error('[API Geocode] Error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur lors du géocodage' },
      { status: 500 },
    )
  }
}

