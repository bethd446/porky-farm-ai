import type React from "react"
import { Resend } from "resend"

// Initialize Resend client
const resend = new Resend(
  process.env.resend_domainkey || process.env.RESEND_API_KEY || "re_placeholder"
)

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

// Send email function
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
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
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

// Export resend instance for advanced usage
export { resend }
