import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message requis" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "OpenAI API key non configurée",
          response: "Désolé, l'assistant IA n'est pas configuré. Veuillez contacter l'administrateur."
        },
        { status: 500 }
      )
    }

    const OpenAI = (await import("openai")).default
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Construire le contexte pour l'assistant spécialisé en élevage porcin
    const systemPrompt = `Tu es un assistant IA spécialisé en élevage porcin en Côte d'Ivoire. 
Tu fournis des conseils pratiques, précis et adaptés au contexte ivoirien.
Tu réponds toujours en français, de manière claire et professionnelle.
Si tu ne connais pas quelque chose, tu l'admets honnêtement.
Tu donnes des conseils basés sur les meilleures pratiques d'élevage porcin.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse."

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("OpenAI API Error:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la génération de la réponse",
        details: error.message 
      },
      { status: 500 }
    )
  }
}

