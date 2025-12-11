import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, isResendConfigured } from "@/lib/email/resend"
import { WelcomeEmail } from "@/lib/email/templates/welcome-email"
import { PasswordResetEmail } from "@/lib/email/templates/password-reset-email"
import { AlertEmail } from "@/lib/email/templates/alert-email"

export async function POST(request: NextRequest) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Service email temporairement indisponible",
        },
        { status: 503 },
      )
    }

    const body = await request.json()
    const { type, to, data } = body

    if (!type || !to) {
      return NextResponse.json({ error: "Parametres manquants" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const emails = Array.isArray(to) ? to : [to]
    if (!emails.every((email) => emailRegex.test(email))) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 })
    }

    let result

    switch (type) {
      case "welcome":
        const welcomeName = data?.userName || data?.name || data?.firstName || "Eleveur"
        result = await sendEmail({
          to,
          subject: "Bienvenue sur PorkyFarm !",
          react: WelcomeEmail({
            userName: welcomeName,
            loginUrl: data?.loginUrl || "https://www.porkyfarm.app/auth/login",
          }),
        })
        break

      case "password-reset":
        if (!data?.resetUrl) {
          return NextResponse.json({ error: "Parametres manquants" }, { status: 400 })
        }
        result = await sendEmail({
          to,
          subject: "Reinitialisation de votre mot de passe PorkyFarm",
          react: PasswordResetEmail({
            userName: data?.userName || data?.name || "Eleveur",
            resetUrl: data.resetUrl,
            expiresIn: data?.expiresIn,
          }),
        })
        break

      case "alert":
        if (!data?.alertType || !data?.alertTitle || !data?.alertMessage) {
          return NextResponse.json({ error: "Parametres manquants" }, { status: 400 })
        }
        result = await sendEmail({
          to,
          subject: `[PorkyFarm] ${data.alertTitle}`,
          react: AlertEmail({
            userName: data?.userName || data?.name || "Eleveur",
            alertType: data.alertType,
            alertTitle: data.alertTitle,
            alertMessage: data.alertMessage,
            animalName: data?.animalName,
            actionUrl: data?.actionUrl,
            actionLabel: data?.actionLabel,
          }),
        })
        break

      default:
        return NextResponse.json({ error: "Type d'email non supporte" }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
