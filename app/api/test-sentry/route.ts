// Route de test pour vérifier que Sentry fonctionne correctement
// Visitez /api/test-sentry pour envoyer une erreur de test à Sentry
// Supprimez ce fichier en production

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Créer une erreur de test
    throw new Error(
      "Test Sentry Error - Cette erreur est intentionnelle pour tester l'intégration"
    );
  } catch (error) {
    // Capturer l'erreur dans Sentry
    Sentry.captureException(error, {
      tags: {
        test: true,
      },
      extra: {
        message:
          "Ceci est une erreur de test pour vérifier que Sentry fonctionne",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Erreur de test envoyée à Sentry. Vérifiez votre dashboard Sentry.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
