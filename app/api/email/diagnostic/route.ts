// Route de diagnostic pour vérifier la configuration email
import { NextResponse } from "next/server";
import { isResendConfigured, EMAIL_CONFIG } from "@/lib/email/resend";

export async function GET() {
  const diagnostics: {
    resendConfigured: boolean;
    resendApiKey: boolean;
    emailConfig: typeof EMAIL_CONFIG;
    issues: string[];
    recommendations: string[];
  } = {
    resendConfigured: false,
    resendApiKey: false,
    emailConfig: EMAIL_CONFIG,
    issues: [],
    recommendations: [],
  };

  // Vérifier RESEND_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY;
  diagnostics.resendApiKey = !!resendApiKey;
  diagnostics.resendConfigured = isResendConfigured();

  if (!resendApiKey) {
    diagnostics.issues.push(
      "RESEND_API_KEY n'est pas configurée dans les variables d'environnement"
    );
    diagnostics.recommendations.push(
      "Ajoutez RESEND_API_KEY dans votre fichier .env.local. Obtenez votre clé sur https://resend.com/api-keys"
    );
  } else if (!resendApiKey.startsWith("re_")) {
    diagnostics.issues.push(
      "RESEND_API_KEY semble invalide (format incorrect)"
    );
    diagnostics.recommendations.push(
      "La clé API Resend doit commencer par 're_'. Vérifiez votre clé sur https://resend.com/api-keys"
    );
  } else if (resendApiKey.length < 20) {
    // Warning only, not a blocking issue
    // Most Resend API keys are 40+ characters, but some can be shorter
    diagnostics.recommendations.push(
      `La clé API semble courte (${resendApiKey.length} caractères). Les clés Resend font généralement 40+ caractères. Vérifiez qu'elle est complète.`
    );
  } else {
    // Key looks valid
    diagnostics.recommendations.push(
      `Clé API Resend détectée (${resendApiKey.length} caractères, format correct)`
    );
  }

  // Vérifier la configuration du sender
  if (
    EMAIL_CONFIG.from.includes("@porkyfarm.app") &&
    !EMAIL_CONFIG.from.includes("@faluekroni.resend.app")
  ) {
    diagnostics.issues.push(
      "Le domaine d'envoi 'porkyfarm.app' n'est peut-être pas vérifié dans Resend"
    );
    diagnostics.recommendations.push(
      "Utilisez l'adresse de test '@faluekroni.resend.app' ou vérifiez votre domaine dans Resend Dashboard"
    );
  }

  if (!diagnostics.resendConfigured) {
    diagnostics.issues.push("Resend n'est pas correctement initialisé");
  }

  // Vérifier les variables Supabase pour les emails de confirmation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    diagnostics.issues.push("Configuration Supabase manquante");
    diagnostics.recommendations.push(
      "Vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont configurés"
    );
  }

  // Vérifier la configuration email
  if (!EMAIL_CONFIG.from || !EMAIL_CONFIG.domain) {
    diagnostics.issues.push("Configuration email incomplète");
  }

  const status = diagnostics.issues.length === 0 ? 200 : 503;

  return NextResponse.json(
    {
      success: diagnostics.issues.length === 0,
      diagnostics,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
