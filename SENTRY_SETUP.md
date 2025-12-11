# Configuration Sentry

Sentry a été intégré dans le projet pour le monitoring des erreurs et la performance.

## Configuration actuelle

Le projet est configuré avec :

- **Organisation** : `porkyfarm`
- **Projet** : `javascript-nextjs`
- **DSN** : Configuré dans les fichiers de configuration (peut être surchargé via variables d'environnement)

## Variables d'environnement (optionnelles)

Si vous souhaitez surcharger la configuration par défaut, ajoutez ces variables dans votre fichier `.env.local` :

```env
# Sentry Configuration (optionnel - le DSN est déjà configuré par défaut)
NEXT_PUBLIC_SENTRY_DSN=https://5e273bd4573ffab60eca18744aa50f9d@o4510515944357888.ingest.de.sentry.io/4510515949666384
SENTRY_DSN=https://5e273bd4573ffab60eca18744aa50f9d@o4510515944357888.ingest.de.sentry.io/4510515949666384

# Sentry Organization (déjà configuré)
SENTRY_ORG=porkyfarm

# Sentry Project (déjà configuré)
SENTRY_PROJECT=javascript-nextjs

# Environment (production, development, staging, etc.)
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_ENVIRONMENT=production

# Debug mode (pour activer les logs Sentry en développement)
# Définir à "true" pour activer
NEXT_PUBLIC_SENTRY_DEBUG=false
SENTRY_DEBUG=false
```

**Note** : Le DSN est déjà configuré par défaut dans les fichiers de configuration. Vous n'avez pas besoin de le définir dans `.env.local` sauf si vous souhaitez le surcharger.

## Intégration Anthropic SDK

L'instrumentation Anthropic est configurée pour surveiller automatiquement tous les appels à l'API Anthropic/Claude.

### Configuration

L'intégration est configurée dans `sentry.server.config.ts` avec :

- `recordInputs: true` en développement (pour capturer les prompts)
- `recordOutputs: true` en développement (pour capturer les réponses)
- En production, les inputs/outputs ne sont pas enregistrés par défaut pour protéger les données sensibles

### Utilisation

L'instrumentation fonctionne automatiquement. Il suffit d'utiliser le SDK Anthropic normalement :

```typescript
import { Anthropic } from "anthropic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Tell me a joke" }],
});
```

Sentry capturera automatiquement :

- Les traces de performance (durée des appels)
- Les erreurs éventuelles
- Les métadonnées (modèle utilisé, tokens consommés, etc.)

### Variables d'environnement requises

Pour utiliser Anthropic, ajoutez dans `.env.local` :

```env
ANTHROPIC_API_KEY=votre-clé-api-anthropic
```

## Fonctionnalités activées

- ✅ Monitoring des erreurs côté client et serveur
- ✅ Session Replay (enregistrement des sessions utilisateurs)
- ✅ Performance monitoring (traces)
- ✅ Source maps automatiques (en production)
- ✅ Filtrage automatique des erreurs en développement
- ✅ **Instrumentation Anthropic SDK** - Monitoring des appels API Anthropic/Claude

## Configuration

Les fichiers de configuration sont :

- `sentry.client.config.ts` - Configuration côté client
- `sentry.server.config.ts` - Configuration côté serveur
- `sentry.edge.config.ts` - Configuration pour les edge functions
- `instrumentation.ts` - Instrumentation automatique

## Test de l'intégration

Deux méthodes sont disponibles pour tester Sentry :

### 1. Page de test dédiée (recommandé)

Visitez `/sentry-example-page` dans votre application. Cette page vous permet de :

- Déclencher des erreurs gérées
- Déclencher des erreurs non gérées
- Voir les informations sur l'intégration

### 2. Route API de test

Visitez `/api/test-sentry` pour envoyer une erreur de test à Sentry via une route API.

### 3. Test de l'intégration Anthropic

Visitez `/api/test-anthropic` pour tester l'instrumentation Sentry avec l'API Anthropic. Cette route :

- Envoie une requête de test à Claude
- Capture automatiquement les traces dans Sentry
- Affiche les informations d'utilisation des tokens

**Prérequis** : Vous devez avoir `ANTHROPIC_API_KEY` configurée dans votre `.env.local`.

### 4. Test manuel dans le code

Vous pouvez également tester en appelant une fonction non définie :

```typescript
// Quelque part dans votre code
myUndefinedFunction();
```

Après avoir déclenché une erreur, vérifiez votre [dashboard Sentry](https://sentry.io/organizations/porkyfarm/projects/javascript-nextjs/) pour voir l'erreur apparaître.
