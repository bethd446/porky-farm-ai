/**
 * Endpoint IA Chat unifié via Vercel AI Gateway
 * Remplace/enveloppe l'endpoint /api/chat existant
 */

import { streamText } from "ai"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { chatRequestSchema, formatZodErrors } from "@/lib/api/validation"
import { checkRateLimit, CHAT_RATE_LIMIT } from "@/lib/api/rate-limit"
import { trackEvent, AnalyticsEvents } from "@/lib/services/analytics"
import { getModelForRequest } from "@/lib/ai/client"
import { buildChatPrompt } from "@/lib/ai/prompts"

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
          content: "L'assistant IA n'est pas configuré. Veuillez contacter le support.",
        },
        { status: 200 },
      )
    }

    // Authentification
    const userId = await getUserId()
    const rateLimitKey = userId || "anonymous"
    const rateLimitResult = checkRateLimit(`chat:${rateLimitKey}`, CHAT_RATE_LIMIT)

    if (!rateLimitResult.success) {
      return Response.json(
        {
          content: `Vous avez atteint la limite de requêtes. Veuillez réessayer dans ${rateLimitResult.retryAfter} secondes.`,
          rateLimited: true,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        },
      )
    }

    // Validation
    const body = await req.json()
    const validation = chatRequestSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        {
          content: `Requête invalide: ${formatZodErrors(validation.error)}`,
        },
        { status: 400 },
      )
    }

    const { messages, livestockContext, hasImage } = validation.data

    // Vérifier le quota quotidien (50 requêtes par jour par défaut)
    if (userId) {
      try {
        const supabase = await getSupabaseClient()
        if (supabase) {
          const { data: quotaCheck } = await supabase.rpc("check_ai_quota", {
            p_user_id: userId,
            p_daily_limit: 50,
          })

          if (quotaCheck === false) {
            return Response.json(
              {
                content:
                  "Vous avez atteint votre limite quotidienne de requêtes IA (50/jour). Réessayez demain ou contactez le support pour augmenter votre quota.",
                quotaExceeded: true,
              },
              { status: 429 },
            )
          }
        }
      } catch (quotaError) {
        console.warn("[AI] Quota check failed, continuing:", quotaError)
      }
    }

    // Construire le prompt système
    const systemPrompt = buildChatPrompt(livestockContext, hasImage || false)

    // Formater les messages pour l'IA
    const formattedMessages = messages.map(
      (m: { role: string; content: string; image?: string }) => {
        if (m.image) {
          return {
            role: m.role as "user" | "assistant",
            content: [
              {
                type: "text" as const,
                text:
                  m.content ||
                  "Que voyez-vous sur cette image ? Identifiez et donnez des conseils.",
              },
              { type: "image" as const, image: m.image },
            ],
          }
        }
        return {
          role: m.role as "user" | "assistant",
          content: m.content,
        }
      }
    )

    // Sélectionner le modèle approprié
    const model = getModelForRequest(hasImage ? "vision" : "chat", false)

    // Générer la réponse en streaming (bypass type issues between AI SDK versions)
    const result = await (streamText as Function)({
      model,
      system: systemPrompt,
      messages: formattedMessages,
    })

    // Tracker l'utilisation (après succès, en arrière-plan)
    if (userId) {
      // Enregistrer dans ai_usage (async, ne bloque pas la réponse)
      ;(async () => {
        try {
          const supabase = await getSupabaseClient()
          if (supabase) {
            // Estimation coût (approximatif)
            const estimatedCost = hasImage ? 0.01 : 0.001

            await supabase.rpc("increment_ai_usage", {
              p_user_id: userId,
              p_cost_estimate: estimatedCost,
              p_has_image: hasImage || false,
            })
          }
        } catch (usageError) {
          console.warn("[AI] Usage tracking failed:", usageError)
        }
      })()

      trackEvent(userId, AnalyticsEvents.AI_CHAT_USED, {
        hasImage,
        messageCount: messages.length,
        viaGateway: hasGatewayKey,
      }).catch(console.error)
    }

    // Retourner le stream
    return result.toTextStreamResponse({
      headers: {
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.resetTime),
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error("[AI Chat] Error:", err.message)

    // Tracker l'erreur
    const userId = await getUserId()
    if (userId) {
      await trackEvent(userId, AnalyticsEvents.AI_CHAT_ERROR, {
        error: err.message,
      })
    }

    // Message d'erreur user-friendly
    let errorMessage =
      "Désolé, je rencontre des difficultés techniques. Veuillez réessayer."

    if (err?.message?.includes("API key") || err?.message?.includes("401")) {
      errorMessage =
        "Service IA temporairement indisponible. Veuillez réessayer plus tard."
    } else if (err?.message?.includes("quota") || err?.message?.includes("429")) {
      errorMessage =
        "Service très sollicité. Veuillez patienter quelques instants et réessayer."
    }

    return Response.json({ content: errorMessage }, { status: 200 })
  }
}
