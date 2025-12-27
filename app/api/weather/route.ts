import { NextRequest, NextResponse } from 'next/server'
import { getWeatherForFarm } from '@/lib/services/weather'
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

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les paramètres
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Paramètres lat et lon requis' },
        { status: 400 },
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Coordonnées invalides' },
        { status: 400 },
      )
    }

    // Récupérer les données météo
    const { data, error } = await getWeatherForFarm(latitude, longitude)

    if (error) {
      return NextResponse.json(
        { error: error.error, code: error.code },
        { status: error.code === 'CONFIG_MISSING' ? 503 : 500 },
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('[API Weather] Error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération météo' },
      { status: 500 },
    )
  }
}

