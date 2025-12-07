import { NextResponse } from "next/server"
import { sendEmail, EMAIL_CONFIG } from "@/lib/email/resend"

// Test endpoint to verify Resend integration
export async function GET() {
  // Check if API key is configured
  const apiKey = process.env.resend_domainkey || process.env.RESEND_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "RESEND_API_KEY not configured",
        configured: false,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    configured: true,
    domain: EMAIL_CONFIG.domain,
    from: EMAIL_CONFIG.from,
    message: "Resend is properly configured. Use POST /api/email/test to send a test email.",
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'to' email address in request body",
        },
        { status: 400 },
      )
    }

    // Send a test email
    const result = await sendEmail({
      to,
      subject: "Test Email - PorkyFarm",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a;">PorkyFarm - Test Email</h1>
          <p>Felicitations ! Votre integration Resend fonctionne correctement.</p>
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
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Test email sent successfully to ${to}`,
    })
  } catch (error) {
    console.error("[Email Test] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
