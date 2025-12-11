import type React from "react";
import { Resend } from "resend";

// Initialize Resend client with API key from environment
// Follows Resend official documentation pattern
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration email
// Use Resend test domain or custom domain if verified
export const EMAIL_CONFIG = {
  // Use Resend test domain for development/testing
  // Replace with your verified domain in production: noreply@porkyfarm.app
  from:
    process.env.RESEND_FROM_EMAIL ||
    "PorkyFarm <onboarding@faluekroni.resend.app>",
  replyTo: process.env.RESEND_REPLY_TO || "support@faluekroni.resend.app",
  domain: process.env.RESEND_DOMAIN || "faluekroni.resend.app",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.porkyfarm.app",
};

// Types
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Send email using Resend
 * Follows Resend official documentation pattern
 * @param options - Email options including recipient, subject, and content
 * @returns Promise with success status and message ID or error
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Resend] API key not configured");
    return {
      success: false,
      error: "Service email non configure. Veuillez ajouter RESEND_API_KEY.",
    };
  }

  try {
    // Validate email addresses
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        console.error("[Resend] Invalid email address:", email);
        return {
          success: false,
          error: `Adresse email invalide: ${email}`,
        };
      }
    }

    // Send email using Resend SDK
    // Supports both React components and HTML
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipients,
      subject: options.subject,
      // Use react parameter for React email templates (recommended by Resend)
      react: options.react,
      // Fallback to HTML if react is not provided
      html: options.html,
      text: options.text,
      replyTo: EMAIL_CONFIG.replyTo,
    });

    if (error) {
      // Log detailed error for debugging (server-side only)
      console.error("[Resend] Email error:", {
        message: error.message,
        name: error.name,
        // Don't log sensitive data
      });

      // Return user-friendly error message
      let errorMessage = "Erreur lors de l'envoi de l'email";

      if (
        error.message?.includes("domain") ||
        error.message?.includes("Domain")
      ) {
        errorMessage = "Domaine email non verifie. Contactez le support.";
      } else if (
        error.message?.includes("rate") ||
        error.message?.includes("limit")
      ) {
        errorMessage = "Limite d'envoi atteinte. Reessayez plus tard.";
      } else if (
        error.message?.includes("invalid") ||
        error.message?.includes("Invalid")
      ) {
        errorMessage = "Configuration email invalide.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("[Resend] Exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur inconnue",
    };
  }
}

// Export resend instance for advanced usage
export { resend };
