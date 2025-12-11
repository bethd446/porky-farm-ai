# Diagnostic des problèmes d'envoi d'email

## Problème identifié

Lors de la création d'un compte, l'utilisateur ne reçoit pas d'email de bienvenue.

## Points de vérification

### 1. Vérifier la configuration Resend

**Route de diagnostic :** `/api/email/diagnostic`

Visitez cette route pour vérifier :

- Si `RESEND_API_KEY` est configurée
- Si Resend est correctement initialisé
- La configuration email

**Test manuel :**

Vérifiez dans votre `.env.local` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2. Tester l'envoi d'email

**Route de test :** `/api/email/test`

**GET** : Vérifie la configuration

```bash
curl http://localhost:3000/api/email/test
```

**POST** : Envoie un email de test

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "votre@email.com"}'
```

### 3. Vérifier les logs

Après une inscription, vérifiez les logs de la console :

**Dans le navigateur (console) :**

- Recherchez `[Registration]` pour voir les logs d'envoi d'email
- Recherchez les erreurs liées à l'email

**Dans le terminal (serveur) :**

- Recherchez `[Email API]` pour voir les logs côté serveur
- Recherchez `[Resend]` pour les erreurs Resend

### 4. Causes possibles

#### A. RESEND_API_KEY non configurée

**Symptôme :** Les logs montrent "Service email non configure"

**Solution :**

1. Créez un compte sur [Resend](https://resend.com)
2. Générez une clé API
3. Ajoutez-la dans `.env.local` :
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. Redémarrez le serveur de développement

#### B. Domaine non vérifié

**Symptôme :** Erreur "domain" dans les logs

**Solution :**

1. Allez sur [Resend Dashboard](https://resend.com/domains)
2. Ajoutez et vérifiez votre domaine `porkyfarm.app`
3. Configurez les enregistrements DNS requis

#### C. Email dans les spams

**Symptôme :** L'email est envoyé (messageId retourné) mais non reçu

**Solution :**

- Vérifiez le dossier spam
- Vérifiez que le domaine est bien vérifié
- Utilisez un domaine vérifié pour l'envoi

#### D. Limite de taux atteinte

**Symptôme :** Erreur "rate" dans les logs

**Solution :**

- Attendez quelques minutes
- Vérifiez votre plan Resend
- Considérez l'upgrade si nécessaire

### 5. Améliorations apportées

✅ **Meilleure gestion d'erreurs :**

- Les erreurs sont maintenant loggées avec plus de détails
- Les erreurs sont envoyées à Sentry pour le monitoring

✅ **Route de diagnostic :**

- `/api/email/diagnostic` pour vérifier la configuration

✅ **Logs améliorés :**

- Logs détaillés dans la console navigateur
- Logs détaillés côté serveur
- Tags Sentry pour le suivi

### 6. Test complet

Pour tester complètement le flux :

1. **Vérifier la configuration :**

   ```bash
   curl http://localhost:3000/api/email/diagnostic
   ```

2. **Tester l'envoi :**

   ```bash
   curl -X POST http://localhost:3000/api/email/test \
     -H "Content-Type: application/json" \
     -d '{"to": "votre@email.com"}'
   ```

3. **Créer un compte de test :**
   - Allez sur `/auth/register`
   - Créez un compte avec un email valide
   - Vérifiez les logs dans la console
   - Vérifiez votre boîte email (et spam)

### 7. Vérification Supabase

Note : Supabase envoie aussi un email de confirmation lors de `signUp()`. Vérifiez :

1. **Configuration Supabase :**
   - Allez sur [Supabase Dashboard](https://app.supabase.com)
   - Vérifiez les paramètres d'email
   - Vérifiez que les emails de confirmation sont activés

2. **Variables d'environnement :**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   ```

## Prochaines étapes

1. Visitez `/api/email/diagnostic` pour voir l'état de la configuration
2. Testez l'envoi avec `/api/email/test`
3. Vérifiez les logs lors d'une nouvelle inscription
4. Consultez votre dashboard Sentry pour voir les erreurs capturées
