import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createHealthCaseSchema, formatZodErrors } from "@/lib/api/validation"
import { trackEvent, AnalyticsEvents } from "@/lib/services/analytics"
import { sendAlertSms, formatPhoneNumber } from "@/lib/services/sms"

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
      .from("health_records")
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

    // Mapper les champs du schéma validation vers health_records
    const { data, error } = await supabase
      .from("health_records")
      .insert({
        user_id: user.id,
        pig_id: validatedData.animal_id, // animal_id → pig_id
        title: validatedData.issue || validatedData.title || "Cas de santé", // issue → title
        description: validatedData.description,
        severity: validatedData.priority === 'high' || validatedData.priority === 'critical' 
          ? (validatedData.priority === 'critical' ? 'critical' : 'high')
          : (validatedData.priority === 'low' ? 'low' : 'medium'), // priority → severity
        status: validatedData.status || 'ongoing',
        treatment: validatedData.treatment,
        veterinarian: validatedData.veterinarian,
        image_url: validatedData.photo || validatedData.image_url, // photo → image_url
        cost: validatedData.cost,
        start_date: validatedData.start_date || new Date().toISOString().split('T')[0],
        type: validatedData.type || 'disease', // Ajouter type si manquant
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la creation du cas de sante" }, { status: 500 })
    }

    // Tracker l'événement analytics
    const isCritical = validatedData.priority === 'high' || validatedData.priority === 'critical'
    await trackEvent(
      user.id,
      isCritical ? AnalyticsEvents.HEALTH_CASE_CRITICAL : AnalyticsEvents.HEALTH_CASE_CREATED,
      {
        priority: validatedData.priority,
        animalId: validatedData.animal_id,
      },
    )

    // Envoyer SMS si cas critique et numéro disponible
    if (isCritical) {
      try {
        // Récupérer le profil utilisateur pour le numéro de téléphone
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single()

        if (profile?.phone) {
          const formattedPhone = formatPhoneNumber(profile.phone)
          if (formattedPhone) {
            const smsMessage = `🚨 Alerte PorkyFarm: Cas santé critique - ${validatedData.issue || validatedData.title || 'Cas de santé'} - ${validatedData.animal_name || 'Animal'}. Détails: ${validatedData.description?.substring(0, 100) || ''}`
            await sendAlertSms(formattedPhone, smsMessage)
            await trackEvent(user.id, AnalyticsEvents.SMS_SENT, {
              alertType: 'health_critical',
            })
          }
        }
      } catch (smsError) {
        // Ne pas bloquer la création si SMS échoue
        console.error('[API Health Cases] SMS error:', smsError)
      }
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
