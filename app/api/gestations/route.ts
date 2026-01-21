import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createGestationSchema, formatZodErrors } from "@/lib/api/validation"
import { trackEvent, AnalyticsEvents } from "@/lib/services/analytics"

async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// GET /api/gestations - Recuperer toutes les gestations
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("gestations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erreur lors du chargement des gestations" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/gestations - Creer une nouvelle gestation
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createGestationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.error) }, { status: 400 })
    }

    const validatedData = validation.data

    // Créer la gestation - colonnes alignées sur Supabase gestations
    const { data, error } = await supabase
      .from("gestations")
      .insert({
        user_id: user.id,
        sow_id: validatedData.sow_id,
        boar_id: validatedData.boar_id,
        mating_date: validatedData.mating_date,
        expected_farrowing_date: validatedData.expected_farrowing_date,
        status: "en_cours",
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('[API Gestations] Insert error:', error)
      return NextResponse.json({ error: "Erreur lors de la création de la gestation" }, { status: 500 })
    }

    // Tracker l'événement analytics
    await trackEvent(user.id, AnalyticsEvents.GESTATION_CREATED, {
      sowId: validatedData.sow_id,
      expectedFarrowingDate: validatedData.expected_farrowing_date,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
