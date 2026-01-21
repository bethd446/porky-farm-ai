# ✅ CHECKLIST TEST INSCRIPTION TEMPS RÉEL

## 🎯 Objectif

Tester la création d'un compte et vérifier tous les appels API.

---

## 📋 PRÉPARATION

### Avant de commencer

- [ ] App lancée : `npx expo start -c`
- [ ] Supabase Dashboard ouvert
- [ ] Console Metro visible
- [ ] Email de test prêt (ex: `test+porkyfarm@example.com`)
- [ ] Script `031-ensure-user-triggers.sql` exécuté dans Supabase

---

## 🧪 TEST COMPLET

### ÉTAPE 1: Accéder à l'inscription

- [ ] Ouvrir l'app
- [ ] Vérifier l'écran Welcome
- [ ] Cliquer sur **"Créer un compte"**
- [ ] ✅ Page d'inscription s'affiche

**Logs attendus:** Aucun (navigation simple)

---

### ÉTAPE 2: Remplir le formulaire

- [ ] Entrer email : `test+porkyfarm@example.com`
- [ ] Entrer mot de passe : `test123456`
- [ ] Confirmer mot de passe : `test123456`
- [ ] ✅ Bouton "Créer mon compte" activé

**Logs attendus:** Aucun (validation côté client)

---

### ÉTAPE 3: Soumettre le formulaire

- [ ] Cliquer sur **"Créer mon compte"**
- [ ] ✅ Indicateur de chargement visible
- [ ] ✅ Écran de confirmation affiché
- [ ] ✅ Message "Email de confirmation envoyé"

**Logs attendus dans Metro:**
```
[AuthContext] signUp: start { email: 'test+porkyfarm@example.com' }
[Auth] signUp: start { email: 'test+porkyfarm@example.com' }
[Auth] signUp: success { userId: '...', email: '...' }
[AuthContext] signUp: success { userId: '...', email: '...', emailConfirmed: false }
[AuthContext] Email not confirmed, staying on register screen
```

**Si erreur:**
```
[Auth] signUp error: [message]
[AuthContext] signUp error: [message]
```

---

### ÉTAPE 4: Vérifier dans Supabase (Users)

1. Aller dans **Supabase Dashboard → Authentication → Users**
2. Chercher l'email utilisé
3. ✅ Utilisateur apparaît
4. ✅ `email_confirmed_at` = `null` (pas encore confirmé)
5. ✅ `is_anonymous` = `false`
6. ✅ `created_at` = date actuelle

**Si utilisateur non créé:**
- Vérifier les logs Supabase → Logs → Auth
- Vérifier les erreurs dans la console Metro

---

### ÉTAPE 5: Vérifier le profil

1. Aller dans **Supabase Dashboard → Table Editor → profiles**
2. Filtrer par `id` = `user.id` (de l'étape 4)
3. ✅ Profil existe

**Si profil n'existe pas:**
- Exécuter `scripts/031-ensure-user-triggers.sql`
- Vérifier que le trigger `on_auth_user_created` existe
- Créer manuellement si nécessaire (voir DEBUG_INSCRIPTION.md)

---

### ÉTAPE 6: Vérifier la ferme

1. Aller dans **Supabase Dashboard → Table Editor → farms**
2. Filtrer par `user_id` = `user.id`
3. ✅ Ferme existe OU sera créée au premier accès

**Si ferme n'existe pas:**
- C'est normal si le trigger `on_profile_created` n'existe pas
- La ferme sera créée automatiquement via `getCurrentFarmId()` au premier accès
- OU exécuter le script 031 pour créer le trigger

---

### ÉTAPE 7: Confirmer l'email

1. Ouvrir votre boîte email
2. Chercher l'email de Supabase
3. Cliquer sur le lien de confirmation
4. ✅ App s'ouvre
5. ✅ Redirection vers dashboard

**Logs attendus:**
```
[Auth] Event: SIGNED_IN
[Auth] Session updated
```

---

### ÉTAPE 8: Vérifier après confirmation

1. Dans **Supabase → Users** → Vérifier `email_confirmed_at` n'est plus `null`
2. Dans l'app → ✅ Dashboard s'affiche
3. ✅ Aucune erreur
4. ✅ Données se chargent

---

## 🔍 VÉRIFICATIONS TECHNIQUES

### Appels API attendus

1. **POST** `https://[project].supabase.co/auth/v1/signup`
   - Body: `{ email, password }`
   - Response: `{ user, session }`
   - Status: `200` ou `201`

2. **INSERT** `profiles` (automatique via trigger)
   - Vérifier qu'un profil est créé

3. **INSERT** `farms` (automatique via trigger OU au premier accès)
   - Vérifier qu'une ferme est créée

### Logs Supabase

Dans **Supabase Dashboard → Logs → Auth** :
- ✅ Event: `signup`
- ✅ Event: `user.created`
- ❌ Pas d'erreur `user_already_registered`
- ❌ Pas d'erreur `email_rate_limit_exceeded`

---

## 🐛 CORRECTIONS RAPIDES

### Si profil non créé

```sql
-- Dans Supabase SQL Editor
-- Remplacer [user_id] et [email] par les valeurs réelles
INSERT INTO public.profiles (id, email, full_name)
VALUES (
  '[user_id]',
  '[email]',
  'Utilisateur'
)
ON CONFLICT (id) DO NOTHING;
```

### Si ferme non créée

```sql
-- Dans Supabase SQL Editor
-- Remplacer [user_id] par la valeur réelle
INSERT INTO public.farms (user_id, name, is_primary)
VALUES (
  '[user_id]',
  'Ma ferme',
  true
)
ON CONFLICT DO NOTHING;
```

---

## 📊 RÉSULTAT

| Étape | ✅/❌ | Notes |
|-------|-------|-------|
| Inscription | ⬜ | |
| Utilisateur créé | ⬜ | |
| Profil créé | ⬜ | |
| Ferme créée | ⬜ | |
| Email reçu | ⬜ | |
| Confirmation | ⬜ | |
| Connexion | ⬜ | |
| Dashboard | ⬜ | |

**Test:** ⬜ Réussi ⬜ Échec

**Erreurs:** 
- 
- 

