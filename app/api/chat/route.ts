import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    const { messages, livestockContext, hasImage } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ content: "Veuillez poser une question." }, { status: 200 })
    }

    const systemPrompt = `Tu es PorkyAssistant, un assistant IA expert en elevage porcin, specialement concu pour aider les eleveurs ivoiriens. 

Ton role est de fournir des conseils pratiques et professionnels sur :
- La gestion du cheptel (truies, verrats, porcelets)
- L'alimentation et les rations selon le stade physiologique
- La reproduction : saillie, gestation, mise-bas, lactation
- La sante : prevention des maladies, vaccinations, traitements
- L'hygiene et la biosecurite
- La gestion financiere de l'elevage
- Les meilleures pratiques adaptees au contexte africain

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

    const { text } = await generateText({
      model: hasImage ? openai("gpt-4o") : openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: formattedMessages,
    })

    return Response.json({ content: text })
  } catch (error: unknown) {
    const err = error as Error

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
