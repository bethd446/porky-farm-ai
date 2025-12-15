import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

// GET /api/gestations - Récupérer toutes les gestations
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
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

// POST /api/gestations - Créer une nouvelle gestation
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { sow_id, sow_name, boar_id, boar_name, breeding_date, notes } = body

    if (!sow_id || !sow_name || !breeding_date) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    // Calcul de la date prévue (114 jours pour les porcs)
    const breedingDate = new Date(breeding_date)
    const expectedDueDate = new Date(breedingDate)
    expectedDueDate.setDate(expectedDueDate.getDate() + 114)

    const { data, error } = await supabase
      .from("gestations")
      .insert({
        user_id: user.id,
        sow_id,
        sow_name,
        boar_id,
        boar_name,
        breeding_date,
        expected_due_date: expectedDueDate.toISOString().split("T")[0],
        status: "active",
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la création de la gestation" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
