# Configuration Resend - Guide rapide

## Étape 1 : Mettre à jour la clé API

Dans votre fichier `.env.local`, remplacez :

```env
RESEND_API_KEY=re_placeholder
```

Par votre vraie clé API :

```env
RESEND_API_KEY=re_Wq3sRFii_P8RVw8YP9M4vfLgAK3hA5ZkY
```

## Étape 2 : Redémarrer le serveur

Après modification de `.env.local`, redémarrez votre serveur de développement :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
```

## Étape 3 : Vérifier la configuration

Testez la configuration :

```bash
curl http://localhost:3000/api/email/diagnostic
```

Vous devriez voir `"success": true` et aucune issue.

## Étape 4 : Tester l'envoi d'email

Testez l'envoi d'un email :

```bash
curl -X POST http://localhost:3000/api/email/test-send \
  -H "Content-Type: application/json" \
  -d '{"to": "votre@email.com"}'
```

## Configuration actuelle

- **Sender** : `onboarding@faluekroni.resend.app` (domaine de test Resend)
- **Reply-To** : `support@faluekroni.resend.app`
- **Base URL** : `http://localhost:3000` (dev) / `https://www.porkyfarm.app` (prod)

## Personnalisation (optionnel)

Pour utiliser votre propre domaine vérifié, ajoutez dans `.env.local` :

```env
RESEND_FROM_EMAIL=PorkyFarm <noreply@porkyfarm.app>
RESEND_REPLY_TO=support@porkyfarm.app
RESEND_DOMAIN=porkyfarm.app
```

⚠️ **Important** : Le domaine doit être vérifié dans votre dashboard Resend avant utilisation.
