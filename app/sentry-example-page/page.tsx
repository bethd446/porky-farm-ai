"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function SentryExamplePage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerError = () => {
    try {
      // Créer une erreur de test
      throw new Error(
        "Test Sentry Error - Cette erreur est intentionnelle pour tester l'intégration Sentry"
      );
    } catch (error) {
      // Capturer l'erreur dans Sentry
      Sentry.captureException(error, {
        tags: {
          test: true,
          page: "sentry-example-page",
        },
        extra: {
          message:
            "Ceci est une erreur de test pour vérifier que Sentry fonctionne correctement",
          timestamp: new Date().toISOString(),
        },
      });
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const triggerUnhandledError = () => {
    // Simuler une erreur non gérée
    // @ts-ignore - Intentionnel pour tester
    myUndefinedFunction();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Page de test Sentry</h1>
          <p className="text-muted-foreground">
            Utilisez les boutons ci-dessous pour tester l'intégration Sentry.
            Les erreurs seront envoyées à votre dashboard Sentry.
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Tests d'erreurs</h2>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Erreur gérée</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cliquez sur ce bouton pour déclencher une erreur qui sera
                  capturée et envoyée à Sentry.
                </p>
                <button
                  onClick={triggerError}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Déclencher une erreur de test
                </button>
                {errorMessage && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                      Erreur capturée : {errorMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Vérifiez votre dashboard Sentry pour voir cette erreur.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Erreur non gérée</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cliquez sur ce bouton pour déclencher une erreur non gérée qui
                  sera automatiquement capturée par Sentry.
                </p>
                <button
                  onClick={triggerUnhandledError}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                >
                  Déclencher une erreur non gérée
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">Informations</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Les erreurs sont envoyées à votre projet Sentry</li>
              <li>• Vérifiez votre dashboard Sentry pour voir les erreurs</li>
              <li>
                • En développement, les erreurs ne sont envoyées que si
                SENTRY_DEBUG=true
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
