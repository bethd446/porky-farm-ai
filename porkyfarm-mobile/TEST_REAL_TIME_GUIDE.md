# 🧪 GUIDE TEST TEMPS RÉEL - INSCRIPTION

## 🎯 Objectif

Tester la création d'un compte en temps réel et détecter/corriger les erreurs.

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Préparer l'environnement

```bash
cd /Users/desk/Desktop/porky-farm-ai-V1/porkyfarm-mobile

# Lancer l'app
npx expo start -c

# Dans un autre terminal, surveiller les logs
# (Les logs apparaissent automatiquement)
```

### 2. Ouvrir Supabase Dashboard

- Aller sur https://supabase.com/dashboard
- Sélectionner votre projet
- Ouvrir **Authentication → Users** (onglet)
- Ouvrir **Table Editor → profiles** (onglet)
- Ouvrir **Table Editor → farms** (onglet)
- Ouvrir **Logs → Auth** (onglet)

### 3. Préparer un email de test

Utiliser un email que vous pouvez consulter :
- Ex: `votre-email+test1@gmail.com`
- OU créer un compte email temporaire

---

## 📋 TEST MANUEL ÉTAPE PAR ÉTAPE

### ÉTAPE 1: Accéder à l'inscription

1. Ouvrir l'app sur votre device/simulateur
2. Vérifier l'écran **Welcome**
3. Cliquer sur **"Créer un compte"**
4. ✅ Vérifier que la page d'inscription s'affiche

**Erreur possible:** Page ne s'affiche pas
- **Solution:** Vérifier la navigation dans `_layout.tsx`

---

### ÉTAPE 2: Remplir le formulaire

1. Entrer un email valide (ex: `test+porkyfarm@example.com`)
2. Entrer un mot de passe (min. 6 caractères, ex: `test123`)
3. Confirmer le mot de passe (identique)
4. ✅ Vérifier que le bouton "Créer mon compte" est activé

**Erreurs possibles:**
- Bouton reste désactivé → Vérifier la validation
- Message d'erreur immédiat → Vérifier le format email

---

### ÉTAPE 3: Soumettre le formulaire

1. Cliquer sur **"Créer mon compte"**
2. ✅ Vérifier l'indicateur de chargement
3. ✅ Vérifier l'écran de confirmation
4. ✅ Vérifier le message "Email de confirmation envoyé"

**Erreurs possibles:**
- Pas de chargement → Vérifier `signUp()` dans AuthContext
- Erreur immédiate → Vérifier la console Metro
- Pas de redirection → Vérifier le handler d'erreur

**Logs attendus dans Metro:**
```
[Auth] signUp: start
[Auth] signUp: success
```

---

### ÉTAPE 4: Vérifier dans Supabase (Users)

1. Aller dans **Supabase Dashboard → Authentication → Users**
2. Chercher l'email utilisé
3. ✅ Vérifier que l'utilisateur apparaît
4. ✅ Vérifier `email_confirmed_at` = `null` (pas encore confirmé)
5. ✅ Vérifier `is_anonymous` = `false`

**Erreurs possibles:**
- Utilisateur non créé → Vérifier les logs Supabase
- `is_anonymous` = `true` → Problème avec `signUp()`

**Logs Supabase attendus:**
- Event: `signup`
- Event: `user.created`

---

### ÉTAPE 5: Vérifier le profil

1. Aller dans **Supabase Dashboard → Table Editor → profiles**
2. Filtrer par `id` = `user.id` (de l'étape 4)
3. ✅ Vérifier qu'un profil existe

**Si le profil n'existe pas:**
- Vérifier le trigger `handle_new_user` dans Supabase
- Vérifier les logs Supabase pour erreurs
- Créer manuellement si nécessaire (voir solution ci-dessous)

---

### ÉTAPE 6: Vérifier la ferme

1. Aller dans **Supabase Dashboard → Table Editor → farms**
2. Filtrer par `user_id` = `user.id`
3. ✅ Vérifier qu'une ferme existe
4. ✅ Vérifier `is_primary` = `true`

**Si la ferme n'existe pas:**
- Vérifier la fonction `create_default_farm` dans Supabase
- Vérifier `getCurrentFarmId()` dans `lib/farmHelpers.ts`
- La ferme sera créée au premier accès si le code le gère

---

### ÉTAPE 7: Confirmer l'email

1. Ouvrir votre boîte email
2. Chercher l'email de Supabase
3. Cliquer sur le lien de confirmation
4. ✅ Vérifier que l'app s'ouvre
5. ✅ Vérifier la redirection vers le dashboard

**Erreurs possibles:**
- Email non reçu → Vérifier la configuration email dans Supabase
- Lien ne fonctionne pas → Vérifier le deep link dans `app.json`
- Pas de redirection → Vérifier le handler dans `_layout.tsx`

---

### ÉTAPE 8: Vérifier après confirmation

1. Dans **Supabase → Users** → Vérifier `email_confirmed_at` n'est plus `null`
2. Dans l'app → Vérifier que le dashboard s'affiche
3. ✅ Vérifier qu'aucune erreur n'apparaît
4. ✅ Vérifier que les données se chargent

---

## 🔍 VÉRIFICATIONS TECHNIQUES

### Console Metro - Logs attendus

```bash
# Inscription
[Auth] signUp: start
[Auth] signUp: success
[Auth] User created: { id: '...', email: '...' }

# Après confirmation
[Auth] Event: SIGNED_IN
[Auth] Session updated
```

### Supabase Logs - Events attendus

Dans **Supabase Dashboard → Logs → Auth** :
- ✅ `signup` event
- ✅ `user.created` event
- ❌ Pas d'erreur `user_already_registered`
- ❌ Pas d'erreur `email_rate_limit_exceeded`

### Appels API attendus

1. **POST** `https://[project].supabase.co/auth/v1/signup`
   - Body: `{ email, password }`
   - Response: `{ user, session }`

2. **INSERT** `profiles` (automatique via trigger)
   - Vérifier qu'un profil est créé

3. **INSERT** `farms` (automatique ou au premier accès)
   - Vérifier qu'une ferme est créée

---

## 🐛 ERREURS COURANTES & CORRECTIONS

### Erreur 1: "User already registered"

**Symptôme:** 
```
Alert: "Cet email est déjà enregistré"
```

**Vérification:**
```bash
# Dans Supabase Dashboard → Authentication → Users
# Chercher l'email
# Si trouvé, supprimer l'utilisateur
```

**Solution dans le code:**
Le code gère déjà cette erreur et propose de se connecter.

---

### Erreur 2: "Profile not created"

**Symptôme:**
- Utilisateur créé mais pas de profil dans `profiles`

**Vérification:**
```sql
-- Dans Supabase SQL Editor
SELECT * FROM profiles WHERE id = '[user_id]';
```

**Solution:**
1. Vérifier le trigger `handle_new_user` existe
2. Si absent, créer le trigger (voir script ci-dessous)

---

### Erreur 3: "Farm not created"

**Symptôme:**
- Profil créé mais pas de ferme dans `farms`

**Vérification:**
```sql
-- Dans Supabase SQL Editor
SELECT * FROM farms WHERE user_id = '[user_id]';
```

**Solution:**
1. Vérifier `getCurrentFarmId()` dans `lib/farmHelpers.ts`
2. La ferme sera créée automatiquement au premier accès
3. OU créer manuellement si nécessaire

---

### Erreur 4: "Email not sent"

**Symptôme:**
- Pas d'email de confirmation reçu

**Vérification:**
1. Supabase Dashboard → Authentication → Settings
2. Vérifier "Enable email confirmations" est activé
3. Vérifier le template "Confirm signup" est configuré

**Solution:**
- Suivre `EMAIL_CONFIGURATION.md`

---

### Erreur 5: "Redirect not working"

**Symptôme:**
- Après confirmation email, pas de redirection vers l'app

**Vérification:**
1. Vérifier `app.json` → `scheme: "porkyfarm"`
2. Vérifier le handler dans `app/_layout.tsx`
3. Vérifier le deep link dans `services/auth.ts`

---

## 📊 CHECKLIST DE TEST

### Avant le test
- [ ] App lancée (`npx expo start`)
- [ ] Supabase Dashboard ouvert
- [ ] Console Metro visible
- [ ] Email de test prêt

### Pendant le test
- [ ] Page d'inscription accessible
- [ ] Formulaire rempli correctement
- [ ] Soumission réussie
- [ ] Écran de confirmation affiché
- [ ] Utilisateur créé dans Supabase
- [ ] Profil créé (ou trigger actif)
- [ ] Ferme créée (ou sera créée)
- [ ] Email de confirmation reçu
- [ ] Lien de confirmation fonctionne
- [ ] Redirection vers dashboard
- [ ] Aucune erreur dans la console

### Après le test
- [ ] Dashboard s'affiche correctement
- [ ] Données se chargent
- [ ] Navigation fonctionne
- [ ] Aucune erreur persistante

---

## 🔧 SCRIPTS DE CORRECTION

### Créer le trigger pour profil (si manquant)

```sql
-- Dans Supabase SQL Editor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Créer la ferme manuellement (si nécessaire)

```sql
-- Dans Supabase SQL Editor
-- Remplacer [user_id] par l'ID de l'utilisateur
INSERT INTO public.farms (user_id, name, is_primary)
VALUES (
  '[user_id]',
  'Ma ferme',
  true
)
ON CONFLICT DO NOTHING;
```

---

## 📝 RAPPORT DE TEST

**Date:** _______________
**Email testé:** _______________
**Device:** _______________

### Résultats

| Étape | Statut | Notes |
|------|--------|------|
| Inscription | ⬜ | |
| Utilisateur créé | ⬜ | |
| Profil créé | ⬜ | |
| Ferme créée | ⬜ | |
| Email reçu | ⬜ | |
| Confirmation | ⬜ | |
| Connexion | ⬜ | |

### Erreurs rencontrées

1. 
2. 
3. 

### Actions correctives

1. 
2. 
3. 

---

## ✅ RÉSULTAT FINAL

**Test:** ⬜ Réussi ⬜ Échec
**Prêt pour production:** ⬜ Oui ⬜ Non

**Commentaires:**
- 
- 

