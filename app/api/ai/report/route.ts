/**
 * Endpoint génération de rapports mensuels (post-MVP)
 * Génère un rapport structuré en Markdown pour l'élevage
 */

import { generateText } from "ai"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { z } from "zod"
import { getModelForRequest } from "@/lib/ai/client"
import { trackEvent, AnalyticsEvents } from "@/lib/services/analytics"

const reportRequestSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
})

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

export async function POST(req: Request) {
  try {
    // Authentification
    const userId = await getUserId()
    if (!userId) {
      return Response.json(
        {
          error: "Authentification requise",
        },
        { status: 401 },
      )
    }

    // Validation
    const body = await req.json()
    const validation = reportRequestSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        {
          error: "Requête invalide",
        },
        { status: 400 },
      )
    }

    const { month, year } = validation.data
    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()

    // Récupérer les données du mois depuis Supabase
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString()
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString()

    // Récupérer les données du mois
    const [animalsResult, healthCasesResult, gestationsResult, stockResult] =
      await Promise.all([
        supabaseService
          .from("pigs")
          .select("*")
          .eq("user_id", userId)
          .lte("created_at", endDate),
        supabaseService
          .from("health_records")
          .select("*")
          .eq("user_id", userId)
          .gte("start_date", startDate)
          .lte("start_date", endDate),
        supabaseService
          .from("gestations")
          .select("*")
          .eq("user_id", userId)
          .gte("mating_date", startDate)
          .lte("mating_date", endDate),
        supabaseService
          .from("feed_stock")
          .select("*")
          .eq("user_id", userId),
      ])

    const animals = animalsResult.data || []
    const healthCases = healthCasesResult.data || []
    const gestations = gestationsResult.data || []
    const stock = stockResult.data || []

    // Construire le prompt pour le rapport
    const systemPrompt = `Tu es un expert en analyse de données d'élevage porcin.

Génère un rapport mensuel structuré en Markdown pour un élevage porcin en Côte d'Ivoire.

Le rapport doit contenir :
1. RÉSUMÉ EXÉCUTIF : Vue d'ensemble du mois
2. STATISTIQUES CLÉS : Chiffres importants (animaux, gestations, cas santé, stock)
3. ÉVÉNEMENTS MARQUANTS : Faits saillants du mois
4. ANALYSE : Points forts et points à améliorer
5. RECOMMANDATIONS : Actions pour le mois suivant

Format : Markdown avec sections claires, listes à puces, et métriques en évidence.`

    const dataSummary = `
DONNÉES DU MOIS ${targetMonth}/${targetYear}:
- Total animaux: ${animals.length}
- Cas de santé: ${healthCases.length}
- Gestations: ${gestations.length}
- Stock d'aliments: ${stock.reduce((sum, s) => sum + (s.quantity_kg || 0), 0)} kg
`

    // Générer le rapport
    const model = getModelForRequest("analysis")
    const { text, usage } = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Génère un rapport mensuel complet pour cet élevage.${dataSummary}`,
        },
      ],
    })

    // Tracker analytics
    await trackEvent(userId, AnalyticsEvents.AI_CHAT_USED, {
      endpoint: "report",
      month: targetMonth,
      year: targetYear,
    })

    return Response.json(
      {
        success: true,
        report: text,
        month: targetMonth,
        year: targetYear,
        timestamp: new Date().toISOString(),
        usage: {
          promptTokens: usage?.promptTokens || 0,
          completionTokens: usage?.completionTokens || 0,
          totalTokens: (usage?.promptTokens || 0) + (usage?.completionTokens || 0),
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const err = error as Error

    const userId = await getUserId()
    await trackEvent(userId, AnalyticsEvents.AI_CHAT_ERROR, {
      error: err.message,
      endpoint: "report",
    })

    return Response.json(
      {
        error: "Erreur lors de la génération du rapport. Veuillez réessayer.",
      },
      { status: 500 }
    )
  }
}

