# 📧 Configuration Emails Supabase - PorkyFarm

## 🎯 Objectif

Activer les emails de confirmation pour les nouvelles inscriptions.

---

## 📋 ÉTAPES

### 1. Accéder aux paramètres d'authentification

1. Ouvrir **Supabase Dashboard**
2. Aller dans **Authentication** → **Settings**
3. Section **Email Auth**

### 2. Activer les confirmations email

- ✅ Cocher **Enable email confirmations**
- ✅ Cocher **Secure email change** (optionnel mais recommandé)
- ✅ Cocher **Double confirm email changes** (optionnel)

### 3. Configurer le template d'email

1. Aller dans **Authentication** → **Email Templates**
2. Sélectionner **Confirm signup**
3. Modifier le template :

#### Subject
```
Confirmez votre inscription à PorkyFarm
```

#### Body HTML
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🐷 PorkyFarm</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #111827; margin-top: 0;">Bienvenue sur PorkyFarm !</h2>
    
    <p style="color: #6b7280; font-size: 16px;">
      Merci de vous être inscrit. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background-color: #10B981; 
                color: white; 
                padding: 14px 28px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                font-weight: 600;
                font-size: 16px;">
        Confirmer mon email
      </a>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
    </p>
    <p style="color: #3b82f6; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 6px;">
      {{ .ConfirmationURL }}
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      ⚠️ Ce lien expire dans 24 heures.<br>
      Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>PorkyFarm - Gestion d'élevage porcin</p>
    <p>© 2025 PorkyFarm. Tous droits réservés.</p>
  </div>
</body>
</html>
```

#### Body Text (fallback)
```
Bienvenue sur PorkyFarm ! 🐷

Merci de vous être inscrit. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :

{{ .ConfirmationURL }}

Ce lien expire dans 24 heures.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

À bientôt sur PorkyFarm !
```

### 4. Configurer les autres templates (optionnel)

#### Reset Password
```
Subject: Réinitialiser votre mot de passe PorkyFarm

Body: 
Bonjour,

Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :

{{ .ConfirmationURL }}

Si vous n'avez pas fait cette demande, ignorez cet email.

Lien: {{ .ConfirmationURL }}
```

#### Magic Link
```
Subject: Connexion à PorkyFarm

Body:
Bonjour,

Cliquez sur le lien ci-dessous pour vous connecter à PorkyFarm :

{{ .ConfirmationURL }}

Ce lien expire dans 1 heure.

Lien: {{ .ConfirmationURL }}
```

---

## 🧪 TESTER

### Test d'inscription

1. Créer un nouveau compte dans l'app
2. Vérifier la réception de l'email
3. Cliquer sur le lien de confirmation
4. Vérifier que le compte est activé
5. Se connecter avec le compte confirmé

### Vérifications

- ✅ Email reçu dans la boîte de réception
- ✅ Lien de confirmation fonctionne
- ✅ Compte activé après clic
- ✅ Connexion possible après confirmation
- ✅ Design email correct (responsive)

---

## ⚙️ CONFIGURATION AVANCÉE

### SMTP personnalisé (optionnel)

Si vous voulez utiliser votre propre serveur SMTP :

1. Aller dans **Settings** → **Auth** → **SMTP Settings**
2. Configurer :
   - SMTP Host
   - SMTP Port
   - SMTP User
   - SMTP Password
   - Sender email
   - Sender name

### Rate Limiting

- **Max emails per hour**: 4 (par défaut)
- **Max emails per day**: 16 (par défaut)

---

## 📝 NOTES

- Les emails sont envoyés depuis `noreply@mail.app.supabase.io` par défaut
- Pour un domaine personnalisé, configurer SMTP
- Les emails peuvent prendre quelques secondes à arriver
- Vérifier le dossier spam si l'email n'arrive pas

---

## ✅ CHECKLIST

- [ ] Emails de confirmation activés
- [ ] Template "Confirm signup" configuré
- [ ] Test d'inscription effectué
- [ ] Email reçu et testé
- [ ] Compte activé après confirmation
- [ ] Connexion fonctionne après confirmation

---

**Date de configuration:** _______________
**Testé par:** _______________
**Statut:** ⬜ Configuré ⬜ Testé ⬜ Validé

