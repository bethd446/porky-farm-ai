import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCriticalEmail } from "@/lib/email/utils";
import { PasswordResetEmail } from "@/lib/email/templates/password-reset-email";
import * as Sentry from "@sentry/nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Use service role key for server-side operations
    const supabase = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

    if (!supabase) {
      console.error("[Reset Password] Service role key not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate reset token via Supabase
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.porkyfarm.app"}/auth/update-password`;

    const { data: resetData, error: resetError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: resetUrl,
        },
      });

    if (resetError || !resetData) {
      console.error("[Reset Password] Supabase error:", resetError);
      return NextResponse.json(
        { error: resetError?.message || "Failed to generate reset link" },
        { status: 500 }
      );
    }

    // Get user info for personalized email
    const { data: userData } = await supabase.auth.admin.getUserById(
      resetData.user.id
    );
    const userName = userData?.user?.user_metadata?.full_name || "Éleveur";

    // Send custom email via Resend with retry
    const emailResult = await sendCriticalEmail(
      {
        to: email,
        subject: "Réinitialisation de votre mot de passe PorkyFarm",
        react: PasswordResetEmail({
          userName,
          resetUrl: resetData.properties.action_link,
          expiresIn: "24 heures",
        }),
      },
      {
        userId: resetData.user.id,
        action: "password-reset",
      }
    );

    if (!emailResult.success) {
      // Log error but still return success since Supabase link was generated
      // User can still use the link from Supabase email
      console.error(
        "[Reset Password] Failed to send custom email:",
        emailResult.error
      );
      Sentry.captureException(
        new Error(`Password reset email failed: ${emailResult.error}`),
        {
          tags: {
            type: "email",
            action: "password-reset",
          },
          extra: {
            email,
            userId: resetData.user.id,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reset link generated and email sent",
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("[Reset Password] Exception:", error);
    Sentry.captureException(error, {
      tags: {
        type: "auth",
        action: "reset-password",
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
