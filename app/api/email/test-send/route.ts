import { NextResponse } from "next/server";
import { sendCriticalEmail } from "@/lib/email/utils";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";
import * as Sentry from "@sentry/nextjs";

/**
 * Route de test pour vérifier l'envoi d'email
 * POST avec { "to": "email@example.com" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Adresse email requise (paramètre 'to')" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    console.log("[Test Email] Sending test welcome email to:", to);

    // Send test email using critical email function
    const result = await sendCriticalEmail(
      {
        to,
        subject: "Test Email - PorkyFarm",
        react: WelcomeEmail({
          userName: "Test User",
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.porkyfarm.app"}/auth/login`,
        }),
      },
      {
        action: "test",
      }
    );

    if (!result.success) {
      console.error("[Test Email] Failed:", result.error);

      Sentry.captureException(new Error(`Test email failed: ${result.error}`), {
        tags: {
          type: "email",
          action: "test",
        },
        extra: {
          to,
          error: result.error,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erreur lors de l'envoi",
          // Don't expose technical details
        },
        { status: 500 }
      );
    }

    console.log("[Test Email] Sent successfully:", result.messageId);

    return NextResponse.json({
      success: true,
      message: `Email de test envoye avec succes a ${to}`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[Test Email] Exception:", error);

    Sentry.captureException(error, {
      tags: {
        type: "email",
        action: "test",
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de l'envoi de l'email de test",
      },
      { status: 500 }
    );
  }
}
