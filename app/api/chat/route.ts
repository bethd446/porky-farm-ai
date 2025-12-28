import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { chatRequestSchema, formatZodErrors } from "@/lib/api/validation"
import { checkRateLimit, CHAT_RATE_LIMIT } from "@/lib/api/rate-limit"
import { trackEvent, AnalyticsEvents } from "@/lib/services/analytics"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          content: "L'assistant IA n'est pas configure. Veuillez contacter le support.",
        },
        { status: 200 },
      )
    }

    const userId = await getUserId()
    const rateLimitKey = userId || "anonymous"
    const rateLimitResult = checkRateLimit(`chat:${rateLimitKey}`, CHAT_RATE_LIMIT)

    if (!rateLimitResult.success) {
      return Response.json(
        {
          content: `Vous avez atteint la limite de requetes. Veuillez reessayer dans ${rateLimitResult.retryAfter} secondes.`,
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

    const body = await req.json()
    const validation = chatRequestSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        {
          content: `Requete invalide: ${formatZodErrors(validation.error)}`,
        },
        { status: 400 },
      )
    }

    const { messages, livestockContext, hasImage } = validation.data

    // Vérifier le quota quotidien (50 requêtes par jour par défaut)
    if (userId) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                return (await cookies()).get(name)?.value
              },
            },
          },
        )

        const { data: quotaCheck } = await supabase.rpc('check_ai_quota', {
          p_user_id: userId,
          p_daily_limit: 50, // Limite quotidienne (configurable)
        })

        if (quotaCheck === false) {
          return Response.json(
            {
              content: 'Vous avez atteint votre limite quotidienne de requêtes IA (50/jour). Réessayez demain ou contactez le support pour augmenter votre quota.',
              quotaExceeded: true,
            },
            { status: 429 },
          )
        }
      } catch (quotaError) {
        // Si la fonction RPC n'existe pas encore, continuer (pour compatibilité)
        console.warn('[AI] Quota check failed, continuing:', quotaError)
      }
    }

    const systemPrompt = `Tu es PorkyAssistant, un assistant IA expert en élevage porcin, spécialement conçu pour aider les éleveurs ivoiriens.

⚠️ IMPORTANT : Tu es un outil d'aide et de conseil. Tu ne remplaces JAMAIS un vétérinaire professionnel. En cas de doute grave sur la santé d'un animal, tu dois toujours recommander de consulter un vétérinaire.

Ton rôle est de fournir des conseils pratiques et professionnels sur :
- La gestion du cheptel (truies, verrats, porcelets, porcs d'engraissement)
- L'alimentation et les rations selon le stade physiologique et le poids
- La reproduction : saillie, gestation (114 jours), mise-bas, lactation, sevrage
- La santé : prévention des maladies courantes, vaccinations, traitements de base
- L'hygiène et la biosécurité en élevage porcin
- La gestion financière de l'élevage (coûts, revenus, rentabilité)
- Les meilleures pratiques adaptées au contexte ivoirien et africain (climat, ressources disponibles)

${
  hasImage
    ? `ANALYSE D'IMAGE:
L'utilisateur t'envoie une image. Tu dois analyser cette image et fournir:
1. Une identification de ce que tu vois (medicament, aliment, porc, symptome, etc.)
2. Des informations pertinentes sur ce que tu identifies
3. Des conseils pratiques lies a l'image

Types d'images que tu peux analyser:
- Photos de porcs (race, etat de sante, estimation d'age/poids)
- Photos de medicaments veterinaires (utilisation, dosage, precautions)
- Photos d'aliments pour porcs (composition, qualite, stockage)
- Photos de symptomes ou lesions (diagnostic possible, traitement suggere)
- Photos d'equipements ou installations d'elevage

Si tu ne peux pas identifier clairement quelque chose, dis-le honnetement et demande plus de details.
`
    : ""
}

${
  livestockContext
    ? `CONTEXTE DE L'ELEVAGE DE L'UTILISATEUR:
${livestockContext}

Utilise ces informations pour personnaliser tes conseils.`
    : ""
}

REGLES DE REPONSE:
- Reponds toujours en francais, de maniere claire et pratique
- Utilise des listes a puces et des sections pour organiser tes reponses
- Sois empathique et encourage les bonnes pratiques d'elevage
- Donne des conseils concrets et applicables en Cote d'Ivoire
- Si on te pose une question hors sujet, ramene poliment la conversation vers l'elevage porcin
- Pour les medicaments, rappelle toujours de consulter un veterinaire pour le dosage exact`

    const formattedMessages = messages.map((m: { role: string; content: string; image?: string }) => {
      if (m.image) {
        return {
          role: m.role as "user" | "assistant",
          content: [
            { type: "text", text: m.content || "Que voyez-vous sur cette image ? Identifiez et donnez des conseils." },
            { type: "image", image: m.image },
          ],
        }
      }
      return {
        role: m.role as "user" | "assistant",
        content: m.content,
      }
    })

    const model = hasImage ? openai("gpt-4o") : openai("gpt-4o-mini")
    const { text, usage } = await generateText({
      model,
      system: systemPrompt,
      messages: formattedMessages,
    })

    // Estimer le coût (approximatif)
    // GPT-4o-mini : ~$0.15/1M tokens input, ~$0.60/1M tokens output
    // GPT-4o : ~$2.50/1M tokens input, ~$10/1M tokens output
    const costPer1MInput = hasImage ? 2.5 : 0.15
    const costPer1MOutput = hasImage ? 10 : 0.6
    const estimatedCost =
      ((usage?.promptTokens || 0) / 1_000_000) * costPer1MInput +
      ((usage?.completionTokens || 0) / 1_000_000) * costPer1MOutput

    // Enregistrer l'utilisation dans la table ai_usage
    if (userId) {
      try {
        const supabaseForUsage = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                return (await cookies()).get(name)?.value
              },
            },
          },
        )

        await supabaseForUsage.rpc('increment_ai_usage', {
          p_user_id: userId,
          p_cost_estimate: estimatedCost,
          p_has_image: hasImage || false,
        })
      } catch (usageError) {
        // Si la fonction RPC n'existe pas encore, continuer (pour compatibilité)
        console.warn('[AI] Usage tracking failed:', usageError)
      }
    }

    // Tracker l'utilisation de l'IA (analytics)
    await trackEvent(userId, AnalyticsEvents.AI_CHAT_USED, {
      hasImage,
      messageCount: messages.length,
      estimatedCost,
      tokensUsed: (usage?.promptTokens || 0) + (usage?.completionTokens || 0),
    })

    return Response.json(
      {
        content: text,
        usage: {
          promptTokens: usage?.promptTokens || 0,
          completionTokens: usage?.completionTokens || 0,
          totalTokens: (usage?.promptTokens || 0) + (usage?.completionTokens || 0),
          estimatedCost,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      },
    )
  } catch (error: unknown) {
    const err = error as Error

    // Tracker l'erreur
    const userId = await getUserId()
    await trackEvent(userId, AnalyticsEvents.AI_CHAT_ERROR, {
      error: err.message,
    })

    // Determine error type for appropriate user message
    let errorMessage = "Desole, je rencontre des difficultes techniques. Veuillez reessayer."

    if (err?.message?.includes("API key") || err?.message?.includes("401")) {
      errorMessage = "Service IA temporairement indisponible. Veuillez reessayer plus tard."
    } else if (err?.message?.includes("quota") || err?.message?.includes("429")) {
      errorMessage = "Service tres sollicite. Veuillez patienter quelques instants et reessayer."
    }

    return Response.json({ content: errorMessage }, { status: 200 })
  }
}
