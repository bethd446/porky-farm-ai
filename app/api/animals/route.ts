import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Helper pour créer un client Supabase côté serveur
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

// GET /api/animals - Récupérer tous les animaux de l'utilisateur
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
      .from("pigs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erreur lors du chargement des animaux" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/animals - Créer un nouvel animal
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
      identifier,
      name,
      category,
      breed,
      birth_date,
      weight,
      status,
      health_status,
      photo,
      mother_id,
      father_id,
      notes,
    } = body

    if (!identifier || !name || !category) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("pigs")
      .insert({
        user_id: user.id,
        identifier,
        name,
        category,
        breed,
        birth_date,
        weight,
        status: status || "active",
        health_status: health_status || "healthy",
        photo,
        mother_id,
        father_id,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la création de l'animal" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
