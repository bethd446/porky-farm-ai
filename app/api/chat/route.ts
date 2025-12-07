import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          content:
            "L'assistant IA n'est pas configuré. Veuillez ajouter la clé OPENAI_API_KEY dans les variables d'environnement.",
        },
        { status: 200 },
      )
    }

    const { messages, livestockContext } = await req.json()

    const systemPrompt = `Tu es PorkyAssistant, un assistant IA expert en élevage porcin, spécialement conçu pour aider les éleveurs ivoiriens. 

Ton rôle est de fournir des conseils pratiques et professionnels sur :
- La gestion du cheptel (truies, verrats, porcelets)
- L'alimentation et les rations selon le stade physiologique
- La reproduction : saillie, gestation, mise-bas, lactation
- La santé : prévention des maladies, vaccinations, traitements
- L'hygiène et la biosécurité
- La gestion financière de l'élevage
- Les meilleures pratiques adaptées au contexte africain

${
  livestockContext
    ? `CONTEXTE DE L'ÉLEVAGE DE L'UTILISATEUR:
${livestockContext}

Utilise ces informations pour personnaliser tes conseils. Par exemple, si l'utilisateur a beaucoup de truies, donne des conseils adaptés à la gestion des reproductions. Si le cheptel est petit, adapte les recommandations en conséquence.`
    : ""
}

RÈGLES DE RÉPONSE:
- Réponds toujours en français, de manière claire et pratique
- Utilise des listes à puces et des sections pour organiser tes réponses
- Sois empathique et encourage les bonnes pratiques d'élevage
- Donne des conseils concrets et applicables en Côte d'Ivoire
- Si on te pose une question hors sujet, ramène poliment la conversation vers l'élevage porcin`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    })

    return Response.json({ content: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json(
      {
        content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.",
      },
      { status: 200 },
    )
  }
}
