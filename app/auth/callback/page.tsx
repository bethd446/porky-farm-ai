"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verification de votre connexion...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a session after OAuth callback
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setStatus("success");
          setMessage(
            "Connexion reussie ! Redirection vers votre tableau de bord..."
          );

          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1500);
        } else {
          // Wait a bit for the client to process the hash
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();

          if (retrySession) {
            setStatus("success");
            setMessage(
              "Connexion reussie ! Redirection vers votre tableau de bord..."
            );

            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 1500);
          } else {
            setStatus("error");
            setMessage("Erreur de connexion. Veuillez reessayer.");
          }
        }
      } catch (error) {
        console.error("[Auth Callback] Error:", error);

        // Log to Sentry
        if (typeof window !== "undefined" && (window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            tags: { type: "auth", action: "oauth_callback" },
          });
        }

        setStatus("error");
        setMessage(
          "Une erreur est survenue lors de la connexion. Veuillez reessayer."
        );
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="text-center space-y-4 p-8">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-muted-foreground">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg text-foreground">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-lg text-destructive">{message}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-4 text-primary hover:underline"
            >
              Retour a la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
