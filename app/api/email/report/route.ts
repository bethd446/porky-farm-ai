import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/resend"
import { WeeklyReportEmail } from "@/lib/email/templates/weekly-report-email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, userName, farmName, stats, alerts } = body

    if (!to || !userName) {
      return NextResponse.json({ error: "Email et nom utilisateur requis" }, { status: 400 })
    }

    // Format current date
    const now = new Date()
    const reportDate = now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    const defaultStats = {
      totalAnimals: 0,
      newBirths: 0,
      gestationsInProgress: 0,
      upcomingBirths: 0,
      healthCases: 0,
      resolvedCases: 0,
      ...stats,
    }

    const result = await sendEmail({
      to,
      subject: `📊 Rapport hebdomadaire PorkyFarm - ${reportDate}`,
      react: WeeklyReportEmail({
        userName,
        farmName,
        reportDate,
        stats: defaultStats,
        alerts: alerts || [],
      }),
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Erreur lors de l'envoi" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: "Rapport hebdomadaire envoyé",
    })
  } catch (error) {
    console.error("[Email Report] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
