/**
 * Endpoint analyse photo via Vision IA
 * Pour analyse de photos d'animaux, symptômes, médicaments
 */

import { generateText } from "ai"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { z } from "zod"
import { checkRateLimit, CHAT_RATE_LIMIT } from "@/lib/api/rate-limit"
import { trackEvent, AnalyticsEvents } from "@/lib/services/analytics"
import { getModelForRequest } from "@/lib/ai/client"
import { systemPrompts } from "@/lib/ai/prompts"

const analyzePhotoSchema = z.object({
  imageBase64: z.string().min(1, "Image requise"),
  animalType: z.enum(["sow", "boar", "piglet", "fattening", "unknown"]).optional(),
  context: z.string().max(1000).optional(),
})

async function getSupabaseClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

async function getUserId(): Promise<string | null> {
  try {
    const supabase = await getSupabaseClient()
    if (!supabase) return null

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
    // Vérifier la configuration IA
    const hasGatewayKey = !!process.env.VERCEL_AI_GATEWAY_API_KEY
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY

    if (!hasGatewayKey && !hasOpenAIKey) {
      return Response.json(
        {
          error: "Service d'analyse d'images non configuré.",
        },
        { status: 503 },
      )
    }

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

    // Rate limiting - plus strict pour les images
    const rateLimitResult = checkRateLimit(`photo:${userId}`, {
      maxRequests: 10,
      windowMs: CHAT_RATE_LIMIT.windowMs,
    })

    if (!rateLimitResult.success) {
      return Response.json(
        {
          error: `Limite de requêtes atteinte. Réessayez dans ${rateLimitResult.retryAfter} secondes.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
          },
        },
      )
    }

    // Validation
    const body = await req.json()
    const validation = analyzePhotoSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        {
          error: `Requête invalide: ${validation.error.errors.map((e) => e.message).join(", ")}`,
        },
        { status: 400 },
      )
    }

    const { imageBase64, animalType, context } = validation.data

    // Vérifier la taille de l'image (max 10MB en base64)
    if (imageBase64.length > 10 * 1024 * 1024) {
      return Response.json(
        {
          error: "Image trop volumineuse. Taille maximale: 10MB",
        },
        { status: 400 },
      )
    }

    // Construire le prompt avec contexte
    let systemPrompt = systemPrompts.image_analysis

    if (animalType && animalType !== "unknown") {
      const animalLabels: Record<string, string> = {
        sow: "truie",
        boar: "verrat",
        piglet: "porcelet",
        fattening: "porc d'engraissement",
      }
      systemPrompt += `\n\nType d'animal: ${animalLabels[animalType]}`
    }

    if (context) {
      systemPrompt += `\n\nContexte fourni par l'utilisateur: ${context}`
    }

    // Sélectionner le modèle vision
    const model = getModelForRequest("vision")

    // Générer l'analyse
    const { text, usage } = await generateText({
      model: model as Parameters<typeof generateText>[0]["model"],
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyse cette image et fournis un diagnostic structuré avec niveau d'urgence.",
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    })

    // Enregistrer l'utilisation
    try {
      const supabase = await getSupabaseClient()
      if (supabase) {
        const estimatedCost = 0.01 // Vision IA plus coûteuse

        await supabase.rpc("increment_ai_usage", {
          p_user_id: userId,
          p_cost_estimate: estimatedCost,
          p_has_image: true,
        })
      }
    } catch (usageError) {
      console.warn("[AI] Usage tracking failed:", usageError)
    }

    // Tracker analytics
    await trackEvent(userId, AnalyticsEvents.AI_CHAT_USED, {
      hasImage: true,
      messageCount: 1,
      viaGateway: hasGatewayKey,
      animalType,
    })

    // Extraire les tokens de l'objet usage
    const usageAny = usage as unknown as Record<string, number>
    const promptTokens = usageAny?.promptTokens || usageAny?.input || 0
    const completionTokens = usageAny?.completionTokens || usageAny?.output || 0

    return Response.json(
      {
        analysis: text,
        timestamp: new Date().toISOString(),
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      },
    )
  } catch (error: unknown) {
    const err = error as Error
    console.error("[AI Analyze Photo] Error:", err.message)

    const userId = await getUserId()
    if (userId) {
      await trackEvent(userId, AnalyticsEvents.AI_CHAT_ERROR, {
        error: err.message,
        endpoint: "analyze-photo",
      })
    }

    return Response.json(
      {
        error: "Erreur lors de l'analyse de l'image. Veuillez réessayer.",
      },
      { status: 500 },
    )
  }
}
