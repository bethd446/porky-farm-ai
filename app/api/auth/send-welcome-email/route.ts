import { type NextRequest, NextResponse } from "next/server";
import { sendCriticalEmail } from "@/lib/email/utils";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";
import * as Sentry from "@sentry/nextjs";

/**
 * Route API dédiée pour l'envoi d'email de bienvenue
 * Appelée après l'inscription réussie
 * Côté serveur uniquement pour garantir la sécurité
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userName, userId } = body;

    if (!email || !userName) {
      return NextResponse.json(
        { error: "Email et nom d'utilisateur requis" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Send welcome email with retry logic (critical email)
    const result = await sendCriticalEmail(
      {
        to: email,
        subject: "Bienvenue sur PorkyFarm !",
        react: WelcomeEmail({
          userName,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.porkyfarm.app"}/auth/login`,
        }),
      },
      {
        userId,
        action: "welcome",
      }
    );

    if (!result.success) {
      // Log error but don't expose details to client
      console.error("[Welcome Email] Failed to send:", {
        email,
        userId,
        error: result.error,
      });

      Sentry.captureException(
        new Error(`Welcome email failed: ${result.error}`),
        {
          level: "error",
          tags: {
            type: "email",
            action: "welcome",
            critical: true,
          },
          extra: {
            email,
            userId,
            error: result.error,
          },
        }
      );

      // Return success=false but don't expose error details
      return NextResponse.json(
        {
          success: false,
          message: "Email non envoye",
          // Don't expose technical details
        },
        { status: 200 } // 200 because account creation succeeded
      );
    }

    console.log("[Welcome Email] Sent successfully:", {
      email,
      userId,
      messageId: result.messageId,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[Welcome Email] Exception:", error);

    Sentry.captureException(error, {
      tags: {
        type: "email",
        action: "welcome",
      },
    });

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'envoi de l'email",
      },
      { status: 500 }
    );
  }
}
