import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Create OpenAI provider with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Vérifier si la clé API est configurée
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error(
        "[Chat API] OPENAI_API_KEY is not set in environment variables"
      );
      return Response.json(
        {
          content:
            "L'assistant IA n'est pas configuré. Veuillez ajouter votre clé OPENAI_API_KEY dans le fichier .env.local et redémarrer le serveur de développement.",
        },
        { status: 200 }
      );
    }

    // Vérifier le format de la clé (doit commencer par "sk-")
    if (!apiKey.startsWith("sk-")) {
      console.error(
        "[Chat API] OPENAI_API_KEY format is invalid (should start with 'sk-')"
      );
      return Response.json(
        {
          content:
            "Format de clé API invalide. La clé OpenAI doit commencer par 'sk-'. Vérifiez votre OPENAI_API_KEY dans .env.local.",
        },
        { status: 200 }
      );
    }

    const { messages, livestockContext, hasImage } = await req.json();

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
- Pour les medicaments, rappelle toujours de consulter un veterinaire pour le dosage exact`;

    const formattedMessages = messages.map(
      (m: { role: string; content: string; image?: string }) => {
        if (m.image) {
          return {
            role: m.role as "user" | "assistant",
            content: [
              {
                type: "text",
                text:
                  m.content ||
                  "Que voyez-vous sur cette image ? Identifiez et donnez des conseils.",
              },
              { type: "image", image: m.image },
            ],
          };
        }
        return {
          role: m.role as "user" | "assistant",
          content: m.content,
        };
      }
    );

    const { text } = await generateText({
      model: hasImage ? openai("gpt-4o") : openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: formattedMessages,
    });

    return Response.json({ content: text });
  } catch (error: any) {
    console.error("[Chat API] Error:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) + "...",
    });

    let errorMessage =
      "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.";

    if (
      error?.message?.includes("API key") ||
      error?.message?.includes("401") ||
      error?.message?.includes("Incorrect API key") ||
      error?.message?.includes("Invalid API key")
    ) {
      errorMessage =
        "Clé API OpenAI invalide ou expirée. Vérifiez votre OPENAI_API_KEY dans le fichier .env.local. Si vous venez de l'ajouter, redémarrez le serveur de développement (Ctrl+C puis npm run dev).";
    } else if (
      error?.message?.includes("quota") ||
      error?.message?.includes("429")
    ) {
      errorMessage =
        "Quota OpenAI dépassé. Vérifiez votre compte OpenAI ou attendez quelques minutes.";
    } else if (error?.message?.includes("model")) {
      errorMessage =
        "Modèle OpenAI non disponible. Vérifiez que votre compte a accès à GPT-4.";
    } else if (error?.status === 401) {
      errorMessage =
        "Authentification OpenAI échouée. Vérifiez que votre clé API est valide et active.";
    }

    return Response.json({ content: errorMessage }, { status: 200 });
  }
}
