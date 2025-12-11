import type React from "react"
import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
  console.warn("[Resend] No API key found. Email functionality will be disabled.")
}

// Initialize Resend client (will be null if no API key)
const resend = apiKey ? new Resend(apiKey) : null

// Configuration email
export const EMAIL_CONFIG = {
  from: "PorkyFarm <noreply@porkyfarm.app>",
  replyTo: "support@porkyfarm.app",
  domain: "porkyfarm.app",
  baseUrl: "https://www.porkyfarm.app",
}

// Types
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  react?: React.ReactElement
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export function isResendConfigured(): boolean {
  return resend !== null
}

// Send email function
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  if (!resend) {
    console.error("[Resend] API key not configured")
    return {
      success: false,
      error: "Service email non configure. Veuillez ajouter RESEND_API_KEY.",
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      react: options.react,
      text: options.text,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    if (error) {
      console.error("[Resend] Email error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error("[Resend] Exception:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur inconnue",
    }
  }
}

// Export resend instance for advanced usage
export { resend }
