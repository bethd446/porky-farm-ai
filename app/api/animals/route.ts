import { type NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/api/auth-helpers"
import { createAnimalSchema, formatZodErrors } from "@/lib/api/validation"

// GET /api/animals - Recuperer tous les animaux de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user || !supabase) {
      return NextResponse.json({ error: authError || "Non authentifie" }, { status: 401 })
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

// POST /api/animals - Creer un nouvel animal
export async function POST(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user || !supabase) {
      return NextResponse.json({ error: authError || "Non authentifie" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createAnimalSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.error) }, { status: 400 })
    }

    const validatedData = validation.data

    const { data, error } = await supabase
      .from("pigs")
      .insert({
        user_id: user.id,
        identifier: validatedData.identifier,
        name: validatedData.name,
        category: validatedData.category,
        breed: validatedData.breed,
        birth_date: validatedData.birth_date,
        weight: validatedData.weight,
        status: validatedData.status,
        health_status: validatedData.health_status,
        photo: validatedData.photo,
        mother_id: validatedData.mother_id,
        father_id: validatedData.father_id,
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la creation de l'animal" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
