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

// GET /api/health-cases - Récupérer tous les cas de santé
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
      .from("veterinary_cases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erreur lors du chargement des cas de santé" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/health-cases - Créer un nouveau cas de santé
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
    const {
      animal_id,
      animal_name,
      issue,
      description,
      priority,
      status,
      treatment,
      veterinarian,
      photo,
      cost,
      start_date,
    } = body

    if (!animal_id || !issue || !description) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("veterinary_cases")
      .insert({
        user_id: user.id,
        animal_id,
        animal_name,
        issue,
        description,
        priority: priority || "medium",
        status: status || "active",
        treatment,
        veterinarian,
        photo,
        cost,
        start_date,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la création du cas de santé" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
