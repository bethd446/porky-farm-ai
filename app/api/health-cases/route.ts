import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createHealthCaseSchema, formatZodErrors } from "@/lib/api/validation"

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

// GET /api/health-cases - Recuperer tous les cas de sante
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
      .from("veterinary_cases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erreur lors du chargement des cas de sante" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/health-cases - Creer un nouveau cas de sante
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
    const validation = createHealthCaseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.error) }, { status: 400 })
    }

    const validatedData = validation.data

    const { data, error } = await supabase
      .from("veterinary_cases")
      .insert({
        user_id: user.id,
        animal_id: validatedData.animal_id,
        animal_name: validatedData.animal_name,
        issue: validatedData.issue,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        treatment: validatedData.treatment,
        veterinarian: validatedData.veterinarian,
        photo: validatedData.photo,
        cost: validatedData.cost,
        start_date: validatedData.start_date,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la creation du cas de sante" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
