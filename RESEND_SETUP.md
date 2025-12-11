# Configuration Resend - Guide Complet

Ce guide explique comment configurer et utiliser Resend pour l'envoi d'emails dans le projet PorkyFarm.

## 📦 Installation

Resend est déjà installé dans le projet. Si vous devez le réinstaller :

```bash
npm install resend
```

## 🔑 Configuration

### 1. Obtenir une clé API Resend

1. Créez un compte sur [Resend](https://resend.com)
2. Allez dans [API Keys](https://resend.com/api-keys)
3. Créez une nouvelle clé API
4. Copiez la clé (commence par `re_`)

### 2. Configurer la clé API

Ajoutez la clé API dans votre fichier `.env.local` :

```env
RESEND_API_KEY=re_Wq3sRFii_P8RVw8YP9M4vfLgAK3hA5ZkY
```

**⚠️ Important :** Ne commitez jamais votre clé API dans Git. Le fichier `.env.local` est déjà dans `.gitignore`.

### 3. Vérifier la configuration

Testez la configuration avec la route de diagnostic :

```bash
# Vérifier la configuration
curl http://localhost:3000/api/email/diagnostic

# Tester l'envoi d'email
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "votre@email.com"}'
```

## 📧 Structure des Templates Email

Les templates email suivent le pattern officiel de Resend :

### Structure des fichiers

```
lib/email/
├── resend.ts              # Configuration et fonction d'envoi
└── templates/
    ├── welcome-email.tsx           # Email de bienvenue
    ├── password-reset-email.tsx    # Email de réinitialisation
    ├── alert-email.tsx             # Email d'alerte
    └── weekly-report-email.tsx    # Rapport hebdomadaire
```

### Pattern des templates

Tous les templates suivent ce pattern :

```tsx
import * as React from "react";

interface EmailTemplateProps {
  // Props du template
}

export function EmailTemplate({ prop1, prop2 }: EmailTemplateProps) {
  return <div>{/* Contenu HTML avec styles inline */}</div>;
}
```

## 🚀 Utilisation

### Envoyer un email depuis une route API

```typescript
import { sendEmail } from "@/lib/email/resend";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";

// Dans votre route API
const result = await sendEmail({
  to: "user@example.com",
  subject: "Bienvenue sur PorkyFarm !",
  react: WelcomeEmail({
    userName: "John Doe",
    loginUrl: "https://www.porkyfarm.app/auth/login",
  }),
});

if (result.success) {
  console.log("Email envoyé:", result.messageId);
} else {
  console.error("Erreur:", result.error);
}
```

### Types d'emails disponibles

#### 1. Email de bienvenue

```typescript
await sendEmail({
  to: email,
  subject: "Bienvenue sur PorkyFarm !",
  react: WelcomeEmail({
    userName: "John Doe",
    loginUrl: "https://www.porkyfarm.app/auth/login",
  }),
});
```

#### 2. Email de réinitialisation de mot de passe

```typescript
await sendEmail({
  to: email,
  subject: "Réinitialisation de votre mot de passe",
  react: PasswordResetEmail({
    userName: "John Doe",
    resetUrl: "https://www.porkyfarm.app/auth/reset-password?token=xxx",
    expiresIn: "1 heure",
  }),
});
```

#### 3. Email d'alerte

```typescript
await sendEmail({
  to: email,
  subject: "[PorkyFarm] Alerte importante",
  react: AlertEmail({
    userName: "John Doe",
    alertType: "vaccination",
    alertTitle: "Vaccination à effectuer",
    alertMessage: "La vaccination de Truie #123 est prévue demain.",
    animalName: "Truie #123",
    actionUrl: "https://www.porkyfarm.app/dashboard/health",
    actionLabel: "Voir les détails",
  }),
});
```

## 🔧 Configuration Email

La configuration email est définie dans `lib/email/resend.ts` :

```typescript
export const EMAIL_CONFIG = {
  from: "PorkyFarm <noreply@porkyfarm.app>",
  replyTo: "support@porkyfarm.app",
  domain: "porkyfarm.app",
  baseUrl: "https://www.porkyfarm.app",
};
```

### Personnaliser l'expéditeur

Pour utiliser votre propre domaine :

1. **Ajoutez votre domaine dans Resend :**
   - Allez sur [Resend Domains](https://resend.com/domains)
   - Ajoutez votre domaine
   - Configurez les enregistrements DNS requis

2. **Mettez à jour la configuration :**
   ```typescript
   export const EMAIL_CONFIG = {
     from: "PorkyFarm <noreply@votre-domaine.com>",
     replyTo: "support@votre-domaine.com",
     domain: "votre-domaine.com",
     baseUrl: "https://www.votre-domaine.com",
   };
   ```

## 🐛 Dépannage

### Email non reçu

1. **Vérifiez les logs :**
   - Console navigateur : `[Registration]`
   - Terminal serveur : `[Email API]`, `[Resend]`

2. **Vérifiez la configuration :**

   ```bash
   curl http://localhost:3000/api/email/diagnostic
   ```

3. **Vérifiez le dossier spam**

4. **Vérifiez que le domaine est vérifié dans Resend**

### Erreur "API key not configured"

- Vérifiez que `RESEND_API_KEY` est dans `.env.local`
- Redémarrez le serveur de développement
- Vérifiez que la clé commence par `re_`

### Erreur "Domain not verified"

- Vérifiez votre domaine dans [Resend Domains](https://resend.com/domains)
- Configurez les enregistrements DNS requis
- Attendez la vérification (peut prendre quelques minutes)

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [React Email Templates](https://react.email)
- [Resend API Reference](https://resend.com/docs/api-reference)

## ✅ Bonnes Pratiques

1. **Toujours utiliser des templates React** (recommandé par Resend)
2. **Utiliser des styles inline** pour la compatibilité email
3. **Tester les emails** avant de les envoyer en production
4. **Ne jamais commiter** les clés API
5. **Logger les erreurs** pour le debugging
6. **Gérer les erreurs gracieusement** sans bloquer l'utilisateur
