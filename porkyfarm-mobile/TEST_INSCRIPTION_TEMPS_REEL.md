# 🧪 TEST INSCRIPTION TEMPS RÉEL - PORKYFARM

## 🎯 Objectif

Tester la création d'un nouveau compte utilisateur en temps réel et vérifier :
- ✅ Les appels API se font correctement
- ✅ Le profil utilisateur est créé
- ✅ La ferme par défaut est créée
- ✅ La redirection fonctionne
- ✅ Aucune erreur dans la console

---

## 📋 CHECKLIST DE TEST

### Phase 1: Préparation

- [ ] L'app est lancée (`npx expo start`)
- [ ] Supabase Dashboard ouvert (pour voir les logs)
- [ ] Console Metro ouverte (pour voir les logs)
- [ ] Email de test prêt (ex: `test+porkyfarm@example.com`)

### Phase 2: Test d'inscription

#### Étape 1: Accéder à la page d'inscription
- [ ] Ouvrir l'app
- [ ] Vérifier l'écran Welcome
- [ ] Cliquer sur "Créer un compte"
- [ ] Vérifier que la page d'inscription s'affiche

#### Étape 2: Remplir le formulaire
- [ ] Entrer un email valide (ex: `test+porkyfarm@example.com`)
- [ ] Entrer un mot de passe (min. 6 caractères)
- [ ] Confirmer le mot de passe
- [ ] Vérifier que le bouton "Créer mon compte" est activé

#### Étape 3: Soumettre le formulaire
- [ ] Cliquer sur "Créer mon compte"
- [ ] Vérifier l'indicateur de chargement
- [ ] Vérifier l'écran de confirmation
- [ ] Vérifier le message "Email de confirmation envoyé"

#### Étape 4: Vérifier dans Supabase
- [ ] Aller dans Supabase Dashboard → Authentication → Users
- [ ] Vérifier que le nouvel utilisateur apparaît
- [ ] Vérifier que `email_confirmed_at` est `null` (pas encore confirmé)
- [ ] Vérifier que `is_anonymous` est `false`

#### Étape 5: Vérifier le profil
- [ ] Aller dans Supabase Dashboard → Table Editor → `profiles`
- [ ] Vérifier qu'un profil a été créé pour cet utilisateur
- [ ] Vérifier les champs : `id`, `email`, `full_name`, etc.

#### Étape 6: Vérifier la ferme
- [ ] Aller dans Supabase Dashboard → Table Editor → `farms`
- [ ] Vérifier qu'une ferme a été créée pour cet utilisateur
- [ ] Vérifier que `user_id` correspond à l'utilisateur
- [ ] Vérifier que `is_primary` est `true`

### Phase 3: Test de confirmation email

#### Étape 7: Confirmer l'email
- [ ] Ouvrir l'email de confirmation
- [ ] Cliquer sur le lien de confirmation
- [ ] Vérifier que l'app s'ouvre
- [ ] Vérifier la redirection vers le dashboard

#### Étape 8: Vérifier après confirmation
- [ ] Dans Supabase → Users → Vérifier `email_confirmed_at` n'est plus `null`
- [ ] Dans l'app → Vérifier que le dashboard s'affiche
- [ ] Vérifier qu'aucune erreur n'apparaît

### Phase 4: Test de connexion

#### Étape 9: Se déconnecter
- [ ] Aller dans Profile → Se déconnecter
- [ ] Vérifier le retour à l'écran Welcome

#### Étape 10: Se reconnecter
- [ ] Cliquer sur "J'ai déjà un compte"
- [ ] Entrer l'email utilisé pour l'inscription
- [ ] Cliquer sur "Envoyer le lien"
- [ ] Vérifier la réception du Magic Link
- [ ] Cliquer sur le lien → Vérifier la connexion

---

## 🔍 VÉRIFICATIONS TECHNIQUES

### Console Metro (Logs attendus)

```bash
# Logs normaux (pas d'erreur)
[Auth] signUp: start
[Auth] signUp: success
[Auth] User created: { id: '...', email: '...' }
```

### Supabase Logs

Dans Supabase Dashboard → Logs → Auth :
- ✅ `signup` event
- ✅ `user.created` event
- ❌ Pas d'erreur `user_already_registered`
- ❌ Pas d'erreur `email_rate_limit_exceeded`

### Appels API attendus

1. **POST** `/auth/v1/signup` (Supabase Auth)
   - Body: `{ email, password }`
   - Response: `{ user, session }`

2. **INSERT** `profiles` (si trigger ou fonction)
   - Vérifier qu'un profil est créé automatiquement

3. **INSERT** `farms` (si trigger ou fonction)
   - Vérifier qu'une ferme est créée automatiquement

---

## 🐛 ERREURS COURANTES & SOLUTIONS

### Erreur 1: "User already registered"

**Symptôme:** Message "Cet email est déjà enregistré"

**Solution:**
- Utiliser un email différent
- OU supprimer l'utilisateur dans Supabase Dashboard

### Erreur 2: "Email rate limit exceeded"

**Symptôme:** Trop d'emails envoyés

**Solution:**
- Attendre quelques minutes
- OU désactiver temporairement la confirmation email dans Supabase

### Erreur 3: "Profile not created"

**Symptôme:** Utilisateur créé mais pas de profil

**Solution:**
- Vérifier le trigger `handle_new_user` dans Supabase
- Créer manuellement le profil si nécessaire

### Erreur 4: "Farm not created"

**Symptôme:** Profil créé mais pas de ferme

**Solution:**
- Vérifier la fonction `create_default_farm` dans Supabase
- Créer manuellement la ferme si nécessaire

### Erreur 5: "Redirect not working"

**Symptôme:** Après confirmation, pas de redirection

**Solution:**
- Vérifier le deep link dans `app.json`
- Vérifier le handler dans `_layout.tsx`

---

## 📊 RÉSULTATS ATTENDUS

| Étape | Résultat attendu | ✅/❌ |
|-------|-------------------|-------|
| Inscription | Email envoyé | ⬜ |
| Utilisateur créé | Visible dans Supabase | ⬜ |
| Profil créé | Visible dans `profiles` | ⬜ |
| Ferme créée | Visible dans `farms` | ⬜ |
| Email confirmé | `email_confirmed_at` rempli | ⬜ |
| Connexion | Dashboard affiché | ⬜ |
| Aucune erreur | Console propre | ⬜ |

---

## 🚀 COMMANDES DE TEST

```bash
# 1. Lancer l'app
cd /Users/desk/Desktop/porky-farm-ai-V1/porkyfarm-mobile
npx expo start -c

# 2. Dans un autre terminal, surveiller les logs
# (Les logs apparaissent automatiquement dans Metro)

# 3. Ouvrir Supabase Dashboard
# https://supabase.com/dashboard/project/[votre-project]/auth/users
```

---

## 📝 NOTES DE TEST

**Date:** _______________
**Email testé:** _______________
**Résultat:** ⬜ Succès ⬜ Échec

**Erreurs rencontrées:**
- 
- 

**Actions correctives:**
- 
- 

---

## 🔧 SCRIPT DE TEST AUTOMATISÉ (Optionnel)

Voir `scripts/test-signup.js` pour un test automatisé (à créer si nécessaire)

