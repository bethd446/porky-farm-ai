import { NextResponse } from "next/server"
import { sendEmail, EMAIL_CONFIG } from "@/lib/email/resend"

export async function GET() {
  const apiKey = process.env.resend_domainkey || process.env.RESEND_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Cle API Resend non configuree. Ajoutez RESEND_API_KEY ou resend_domainkey dans les variables d'environnement.",
        configured: false,
        help: "Obtenez votre cle sur https://resend.com/api-keys",
      },
      { status: 500 },
    )
  }

  // Check if API key format is valid (starts with re_)
  if (!apiKey.startsWith("re_")) {
    return NextResponse.json(
      {
        success: false,
        error: "Format de cle API invalide. La cle doit commencer par 're_'.",
        configured: false,
        help: "Verifiez votre cle API sur https://resend.com/api-keys",
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    configured: true,
    domain: EMAIL_CONFIG.domain,
    from: EMAIL_CONFIG.from,
    message: "Resend est correctement configure. Utilisez POST /api/email/test pour envoyer un email de test.",
  })
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.resend_domainkey || process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Service de notification indisponible. Contactez le support.",
          details: "API key not configured",
        },
        { status: 503 },
      )
    }

    if (!apiKey.startsWith("re_")) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration email invalide. Contactez le support.",
          details: "Invalid API key format",
        },
        { status: 503 },
      )
    }

    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          error: "Adresse email manquante",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'adresse email invalide",
        },
        { status: 400 },
      )
    }

    const result = await sendEmail({
      to,
      subject: "Test Email - PorkyFarm",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a;">PorkyFarm - Test Email</h1>
          <p>Felicitations ! Votre integration email fonctionne correctement.</p>
          <p style="color: #666;">
            Cet email a ete envoye depuis <strong>${EMAIL_CONFIG.domain}</strong>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">
            PorkyFarm - Gestion intelligente de votre elevage porcin
          </p>
        </div>
      `,
    })

    if (!result.success) {
      let userMessage = "Erreur lors de l'envoi de l'email"

      if (result.error?.includes("API key")) {
        userMessage = "Cle API invalide. Verifiez votre configuration Resend."
      } else if (result.error?.includes("domain")) {
        userMessage = "Domaine non verifie. Configurez vos enregistrements DNS."
      } else if (result.error?.includes("rate")) {
        userMessage = "Limite d'envoi atteinte. Reessayez dans quelques minutes."
      }

      return NextResponse.json(
        {
          success: false,
          error: userMessage,
          details: process.env.NODE_ENV === "development" ? result.error : undefined,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Email de test envoye avec succes a ${to}`,
    })
  } catch (error) {
    console.error("[Email Test] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Service de notification momentanement indisponible",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    )
  }
}
