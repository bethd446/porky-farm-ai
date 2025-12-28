/**
 * Endpoint recommandations élevage basées sur données Supabase
 * Analyse les données de la ferme et génère des recommandations prioritaires
 */

import { generateText } from "ai"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getModelForRequest } from "@/lib/ai/client"
import { buildFarmAnalysisPrompt } from "@/lib/ai/prompts"
import { trackEvent, AnalyticsEvents } from "@/lib/services/analytics"

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

export async function GET(req: Request) {
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

    // Récupérer les données de la ferme depuis Supabase
    // Utiliser service role key pour accès complet (côté serveur uniquement)
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

    // Récupérer les données agrégées
    const [animalsResult, healthCasesResult, gestationsResult, stockResult] =
      await Promise.all([
        supabaseService
          .from("pigs")
          .select("category, status, weight, birth_date")
          .eq("user_id", userId),
        supabaseService
          .from("health_records")
          .select("status, severity, start_date")
          .eq("user_id", userId)
          .gte("start_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), // 30 derniers jours
        supabaseService
          .from("gestations")
          .select("status, mating_date")
          .eq("user_id", userId),
        supabaseService
          .from("feed_stock")
          .select("quantity_kg")
          .eq("user_id", userId),
      ])

    const animals = animalsResult.data || []
    const healthCases = healthCasesResult.data || []
    const gestations = gestationsResult.data || []
    const stock = stockResult.data || []

    // Calculer les métriques
    const animalsByCategory = {
      sows: animals.filter((a) => a.category === "sow").length,
      boars: animals.filter((a) => a.category === "boar").length,
      piglets: animals.filter((a) => a.category === "piglet").length,
      fattening: animals.filter((a) => a.category === "fattening").length,
    }

    const activeHealthCases = healthCases.filter(
      (c) => c.status === "ongoing"
    ).length

    const activeGestations = gestations.filter(
      (g) => g.status === "pregnant"
    ).length

    const totalStockKg = stock.reduce((sum, item) => sum + (item.quantity_kg || 0), 0)

    // Calculer poids moyen (si disponible)
    const animalsWithWeight = animals.filter((a) => a.weight && a.weight > 0)
    const averageWeight =
      animalsWithWeight.length > 0
        ? animalsWithWeight.reduce((sum, a) => sum + (a.weight || 0), 0) /
          animalsWithWeight.length
        : undefined

    // Identifier problèmes de santé récents
    const recentHealthIssues = healthCases
      .filter((c) => c.severity === "high" || c.severity === "critical")
      .map((c) => c.severity)
      .slice(0, 5)

    // Construire les données pour l'analyse
    const farmData = {
      totalAnimals: animals.length,
      animalsByCategory,
      activeHealthCases,
      activeGestations,
      totalStockKg,
      averageWeight,
      recentHealthIssues: recentHealthIssues.length > 0 ? recentHealthIssues : undefined,
    }

    // Construire le prompt
    const systemPrompt = buildFarmAnalysisPrompt(farmData)

    // Générer l'analyse avec modèle d'analyse structurée
    const model = getModelForRequest("analysis")
    const { text, usage } = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content:
            "Analyse ces données et génère des recommandations prioritaires pour améliorer cet élevage.",
        },
      ],
    })

    // Parser la réponse JSON (si possible)
    let analysisJson: any = null
    try {
      // Essayer d'extraire le JSON de la réponse
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisJson = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Si le parsing échoue, garder le texte brut
      analysisJson = { raw: text }
    }

    // Stocker la recommandation dans Supabase (optionnel, future table)
    // Pour l'instant, on retourne juste l'analyse

    // Tracker analytics
    await trackEvent(userId, AnalyticsEvents.AI_CHAT_USED, {
      endpoint: "recommendations",
      farmSize: animals.length,
    })

    return Response.json(
      {
        success: true,
        analysis: analysisJson,
        rawText: text,
        farmData,
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
      endpoint: "recommendations",
    })

    return Response.json(
      {
        error: "Erreur lors de la génération des recommandations. Veuillez réessayer.",
      },
      { status: 500 }
    )
  }
}

