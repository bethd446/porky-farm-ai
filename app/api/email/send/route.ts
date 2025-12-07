import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/resend"
import { WelcomeEmail } from "@/lib/email/templates/welcome-email"
import { PasswordResetEmail } from "@/lib/email/templates/password-reset-email"
import { AlertEmail } from "@/lib/email/templates/alert-email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    if (!type || !to) {
      return NextResponse.json({ error: "Missing required fields: type, to" }, { status: 400 })
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
          return NextResponse.json({ error: "Missing resetUrl for password-reset email" }, { status: 400 })
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
          return NextResponse.json(
            { error: "Missing alert data: alertType, alertTitle, alertMessage" },
            { status: 400 },
          )
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
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("[Email API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
