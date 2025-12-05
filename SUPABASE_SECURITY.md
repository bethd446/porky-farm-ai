# Configuration de Sécurité Supabase - PorcPro

## 🔒 Protection contre les mots de passe compromis (HaveIBeenPwned)

### Problème
Supabase Auth peut vérifier si un mot de passe a été compromis en le comparant avec la base de données HaveIBeenPwned.org. Cette fonctionnalité est actuellement désactivée.

### Solution : Activer la protection

#### Méthode 1 : Via Supabase Dashboard (RECOMMANDÉ)

1. **Connectez-vous à Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez aux paramètres d'authentification**
   - Menu de gauche → **Authentication**
   - Cliquez sur **Settings** (ou **Policies**)

3. **Activez la protection**
   - Cherchez la section **"Password Protection"** ou **"Security"**
   - Activez l'option **"Check passwords against HaveIBeenPwned"**
   - Ou cherchez **"Leaked password protection"**

4. **Sauvegardez**
   - Cliquez sur **Save** ou **Update**

#### Méthode 2 : Via SQL (si disponible dans votre version)

```sql
-- Vérifier la configuration actuelle
SELECT * FROM auth.config WHERE key = 'security';

-- Note: La configuration exacte peut varier selon la version de Supabase
-- Il est recommandé d'utiliser le Dashboard
```

### 📋 Emplacement exact dans le Dashboard

Le chemin exact peut varier selon la version de Supabase :

**Option A :**
- Authentication → Settings → Security → Password Protection

**Option B :**
- Authentication → Policies → Password Policies

**Option C :**
- Project Settings → Authentication → Security

### ✅ Vérification

Une fois activé, lorsque quelqu'un essaie de s'inscrire avec un mot de passe compromis, il recevra un message d'erreur comme :

```
"Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre."
```

### 🔐 Autres recommandations de sécurité

Pendant que vous configurez la sécurité, activez aussi :

1. **Email confirmation** (déjà activé normalement)
   - Authentication → Settings → Email Templates

2. **Rate limiting** (déjà activé normalement)
   - Protection contre les attaques par force brute

3. **Password requirements**
   - Longueur minimale : 8 caractères (recommandé)
   - Complexité : lettres + chiffres (optionnel)

4. **Session management**
   - Durée de session
   - Refresh tokens

### 📝 Note importante

La vérification HaveIBeenPwned utilise l'API publique de HaveIBeenPwned qui :
- ✅ Ne transmet jamais le mot de passe complet
- ✅ Utilise un hash partiel (k-anonymity)
- ✅ Est sécurisée et respecte la vie privée
- ✅ Est gratuite et largement utilisée

### 🚨 Si vous ne trouvez pas l'option

1. Vérifiez que vous êtes sur la dernière version de Supabase
2. Contactez le support Supabase si nécessaire
3. Cette fonctionnalité peut être disponible uniquement sur certains plans

### 🔗 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

