import { NextResponse } from "next/server"
import { resend, EMAIL_CONFIG } from "@/lib/email/resend"

// Verify domain configuration with Resend
export async function GET() {
  try {
    const apiKey = process.env.resend_domainkey || process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "API key not configured",
        status: "not_configured",
      })
    }

    // Try to list domains to verify API key works
    const { data: domains, error } = await resend.domains.list()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        status: "api_error",
      })
    }

    // Find porkyfarm.app domain
    const porkyfarmDomain = domains?.data?.find((d) => d.name === "porkyfarm.app")

    return NextResponse.json({
      success: true,
      status: porkyfarmDomain ? "verified" : "pending",
      domain: EMAIL_CONFIG.domain,
      from: EMAIL_CONFIG.from,
      domainInfo: porkyfarmDomain
        ? {
            id: porkyfarmDomain.id,
            status: porkyfarmDomain.status,
            createdAt: porkyfarmDomain.created_at,
          }
        : null,
      totalDomains: domains?.data?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    })
  }
}
