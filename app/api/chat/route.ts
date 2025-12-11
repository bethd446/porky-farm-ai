import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Create OpenAI provider with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          content:
            "L'assistant IA n'est pas configure. Veuillez ajouter votre cle OPENAI_API_KEY dans les variables d'environnement.",
        },
        { status: 200 },
      )
    }

    const { messages, livestockContext, hasImage } = await req.json()

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

Utilise ces informations pour personnaliser tes conseils. Par exemple, si l'utilisateur a beaucoup de truies, donne des conseils adaptes a la gestion des reproductions. Si le cheptel est petit, adapte les recommandations en consequence.`
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
  } catch (error: any) {
    console.error("Chat API error:", error)

    let errorMessage = "Desole, je rencontre des difficultes techniques. Veuillez reessayer dans quelques instants."

    if (
      error?.message?.includes("API key") ||
      error?.message?.includes("401") ||
      error?.message?.includes("Incorrect API key")
    ) {
      errorMessage = "Cle API OpenAI invalide. Verifiez votre OPENAI_API_KEY dans les variables d'environnement."
    } else if (error?.message?.includes("quota") || error?.message?.includes("429")) {
      errorMessage = "Quota OpenAI depasse. Verifiez votre compte OpenAI ou attendez quelques minutes."
    } else if (error?.message?.includes("model")) {
      errorMessage = "Modele OpenAI non disponible. Verifiez que votre compte a acces a GPT-4."
    }

    return Response.json({ content: errorMessage }, { status: 200 })
  }
}
