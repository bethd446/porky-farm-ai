import { NextRequest, NextResponse } from 'next/server'
import { sendAlertSms, formatPhoneNumber } from '@/lib/services/sms'
import { trackEvent, AnalyticsEvents } from '@/lib/services/analytics'
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
    const { to, message, alertType } = body

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et message requis' },
        { status: 400 },
      )
    }

    // Formater le numéro
    const formattedPhone = formatPhoneNumber(to)
    if (!formattedPhone) {
      return NextResponse.json(
        { error: 'Format de numéro invalide. Utilisez le format E.164 (ex: +2250123456789)' },
        { status: 400 },
      )
    }

    // Envoyer le SMS
    const result = await sendAlertSms(formattedPhone, message)

    // Tracker l'événement
    await trackEvent(userId, result.success ? AnalyticsEvents.SMS_SENT : AnalyticsEvents.SMS_FAILED, {
      alertType,
      phoneNumber: formattedPhone.replace(/\d(?=\d{4})/g, '*'), // Masquer partiellement
      success: result.success,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de l\'envoi SMS' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[API Send SMS] Error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'envoi SMS' },
      { status: 500 },
    )
  }
}

