# Configuration Resend pour PorkyFarm

## 1. Creation du compte Resend

1. Allez sur [resend.com](https://resend.com) et creez un compte
2. Une fois connecte, allez dans **API Keys**
3. Creez une nouvelle cle API avec les permissions "Full Access"
4. Copiez la cle (commence par `re_`)

## 2. Configuration du domaine porkyfarm.app

1. Dans Resend, allez dans **Domains** > **Add Domain**
2. Entrez `porkyfarm.app`
3. Resend vous donnera des enregistrements DNS a ajouter :

### Enregistrements DNS requis

Ajoutez ces enregistrements dans votre gestionnaire DNS (Vercel, Cloudflare, etc.) :

| Type  | Nom                          | Valeur                                      | TTL  |
|-------|------------------------------|---------------------------------------------|------|
| MX    | send.porkyfarm.app           | feedback-smtp.us-east-1.amazonses.com       | 3600 |
| TXT   | send.porkyfarm.app           | v=spf1 include:amazonses.com ~all           | 3600 |
| TXT   | resend._domainkey.porkyfarm.app | (fourni par Resend - cle DKIM)           | 3600 |
| CNAME | send.porkyfarm.app           | (fourni par Resend)                         | 3600 |

### Verification DMARC (recommande)

Ajoutez aussi un enregistrement DMARC pour ameliorer la delivrabilite :

| Type | Nom                  | Valeur                                           |
|------|----------------------|--------------------------------------------------|
| TXT  | _dmarc.porkyfarm.app | v=DMARC1; p=none; rua=mailto:dmarc@porkyfarm.app |

## 3. Configuration dans Vercel

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez la variable :
   - **Key**: `RESEND_API_KEY`
   - **Value**: votre cle API (re_...)
   - **Environment**: Production, Preview, Development

## 4. Test de l'integration

Une fois configure, testez l'envoi d'email avec :

```bash
curl -X POST https://www.porkyfarm.app/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "votre-email@example.com",
    "data": {
      "userName": "Test User"
    }
  }'
```

## 5. Types d'emails disponibles

### Email de bienvenue
```json
{
  "type": "welcome",
  "to": "user@example.com",
  "data": {
    "userName": "Jean Kouame"
  }
}
```

### Reinitialisation de mot de passe
```json
{
  "type": "password-reset",
  "to": "user@example.com",
  "data": {
    "userName": "Jean Kouame",
    "resetUrl": "https://www.porkyfarm.app/auth/reset?token=xxx"
  }
}
```

### Alerte (vaccination, gestation, sante)
```json
{
  "type": "alert",
  "to": "user@example.com",
  "data": {
    "userName": "Jean Kouame",
    "alertType": "gestation",
    "alertTitle": "Mise-bas imminente",
    "alertMessage": "La truie Bella devrait mettre bas dans 3 jours.",
    "animalName": "Bella"
  }
}
```

## 6. Securite

- **Ne jamais exposer** `RESEND_API_KEY` cote client
- L'API `/api/email/send` est uniquement accessible cote serveur
- Implementez une authentification si vous ouvrez cette API aux clients

## 7. Limites Resend (Plan gratuit)

- 100 emails/jour
- 3000 emails/mois
- 1 domaine personnalise

Pour plus d'emails, passez au plan payant sur resend.com.
