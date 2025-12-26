import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { uuidSchema, updateAnimalSchema, formatZodErrors } from "@/lib/api/validation"

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

// GET /api/animals/[id] - Recuperer un animal specifique
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const { data, error } = await supabase.from("pigs").select("*").eq("id", id).eq("user_id", user.id).single()

    if (error) {
      return NextResponse.json({ error: "Animal introuvable" }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT /api/animals/[id] - Mettre a jour un animal
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateAnimalSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.error) }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("pigs")
      .update({ ...validation.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la mise a jour" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE /api/animals/[id] - Supprimer un animal
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const { error } = await supabase.from("pigs").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
    }

    return NextResponse.json({ message: "Animal supprime avec succes" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
