import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { sendEmailWithRetry, sendCriticalEmail } from "@/lib/email/utils";
import { logEmailOperation, trackEmailMetric } from "@/lib/email/monitoring";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";
import { PasswordResetEmail } from "@/lib/email/templates/password-reset-email";
import { AlertEmail } from "@/lib/email/templates/alert-email";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data, critical = false, retry = false } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: "Missing required fields: type, to" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "welcome":
        const welcomeName =
          data?.userName || data?.name || data?.firstName || "Eleveur";
        // Use critical email function for welcome emails (with retry)
        const welcomeEmailOptions = {
          to,
          subject: "Bienvenue sur PorkyFarm !",
          react: WelcomeEmail({
            userName: welcomeName,
            loginUrl: data?.loginUrl || "https://www.porkyfarm.app/auth/login",
          }),
        };

        if (critical || !retry) {
          // First attempt or critical: use retry logic
          result = await sendCriticalEmail(welcomeEmailOptions, {
            userId: data?.userId,
            action: "welcome",
          });
        } else {
          // Retry attempt: use standard retry
          result = await sendEmailWithRetry(welcomeEmailOptions, {
            maxRetries: 2,
            retryDelay: 2000,
          });
        }
        break;

      case "password-reset":
        if (!data?.resetUrl) {
          return NextResponse.json(
            { error: "Missing resetUrl for password-reset email" },
            { status: 400 }
          );
        }
        // Password reset is critical - use retry logic
        result = await sendCriticalEmail(
          {
            to,
            subject: "Reinitialisation de votre mot de passe PorkyFarm",
            react: PasswordResetEmail({
              userName: data?.userName || data?.name || "Eleveur",
              resetUrl: data.resetUrl,
              expiresIn: data?.expiresIn || "24 heures",
            }),
          },
          {
            action: "password-reset",
          }
        );
        break;

      case "alert":
        if (!data?.alertType || !data?.alertTitle || !data?.alertMessage) {
          return NextResponse.json(
            {
              error: "Missing alert data: alertType, alertTitle, alertMessage",
            },
            { status: 400 }
          );
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
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    // Log email operation for monitoring
    logEmailOperation({
      type,
      to: Array.isArray(to) ? to[0] : to,
      subject: result.success
        ? type === "welcome"
          ? "Bienvenue sur PorkyFarm !"
          : type === "password-reset"
            ? "Réinitialisation de votre mot de passe PorkyFarm"
            : `[PorkyFarm] ${data?.alertTitle || "Notification"}`
        : "Unknown",
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      timestamp: new Date().toISOString(),
      critical: critical || type === "welcome" || type === "password-reset",
    });

    if (!result.success) {
      trackEmailMetric("failed", type, {
        to,
        critical,
        retry,
        error: result.error,
      });

      // Log to Sentry for critical emails
      if (critical || type === "welcome" || type === "password-reset") {
        Sentry.captureException(
          new Error(`Critical email failed: ${result.error}`),
          {
            tags: {
              type: "email",
              emailType: type,
              critical: true,
            },
            extra: {
              to,
              type,
              error: result.error,
            },
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erreur lors de l'envoi de l'email",
          retryable:
            !result.error?.includes("API key") &&
            !result.error?.includes("invalid"),
        },
        { status: 500 }
      );
    }

    trackEmailMetric("sent", type, {
      to,
      messageId: result.messageId,
      critical: critical || type === "welcome" || type === "password-reset",
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      verified: true,
    });
  } catch (error) {
    console.error("[Email API] Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
