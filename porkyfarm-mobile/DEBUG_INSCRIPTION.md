# 🐛 DEBUG INSCRIPTION - GUIDE DE TEST

## 🎯 Objectif

Tester l'inscription en temps réel et corriger les erreurs détectées.

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Préparer l'environnement

```bash
cd /Users/desk/Desktop/porky-farm-ai-V1/porkyfarm-mobile

# Lancer l'app avec logs détaillés
npx expo start -c

# Dans un autre terminal, surveiller les logs réseau
# (Les logs apparaissent automatiquement dans Metro)
```

### 2. Ouvrir les outils de debug

- ✅ **Console Metro** (visible dans le terminal)
- ✅ **Supabase Dashboard** → Authentication → Users
- ✅ **Supabase Dashboard** → Table Editor → profiles
- ✅ **Supabase Dashboard** → Table Editor → farms
- ✅ **Supabase Dashboard** → Logs → Auth

---

## 📋 TEST ÉTAPE PAR ÉTAPE

### ÉTAPE 1: Vérifier les triggers Supabase

**Action:** Exécuter `scripts/031-ensure-user-triggers.sql` dans Supabase SQL Editor

**Vérification:**
```sql
-- Vérifier les triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_profile_created');
```

**Résultat attendu:**
- ✅ `on_auth_user_created` sur `auth.users`
- ✅ `on_profile_created` sur `public.profiles`

---

### ÉTAPE 2: Test d'inscription

1. **Ouvrir l'app**
   - Vérifier l'écran Welcome
   - Cliquer sur "Créer un compte"

2. **Remplir le formulaire**
   - Email: `test+porkyfarm@example.com` (ou votre email)
   - Mot de passe: `test123456`
   - Confirmer: `test123456`

3. **Soumettre**
   - Cliquer sur "Créer mon compte"
   - **Observer la console Metro**

---

## 🔍 LOGS À SURVEILLER

### Console Metro - Logs attendus

```bash
# ✅ SUCCÈS
[Auth] signUp: start
[Auth] signUp: success
[Auth] User created: { id: '...', email: '...' }

# ❌ ERREUR
[Auth] signUp error: [message d'erreur]
```

### Supabase Logs - Events attendus

Dans **Supabase Dashboard → Logs → Auth** :
- ✅ Event: `signup`
- ✅ Event: `user.created`
- ❌ Pas d'erreur

---

## 🐛 ERREURS COURANTES & CORRECTIONS

### Erreur 1: "User already registered"

**Symptôme:**
```
Alert: "Cet email est déjà enregistré"
```

**Correction:**
- Le code gère déjà cette erreur ✅
- Utiliser un email différent pour le test

---

### Erreur 2: "Profile not created"

**Symptôme:**
- Utilisateur créé dans `auth.users`
- Mais pas de profil dans `profiles`

**Vérification:**
```sql
-- Dans Supabase SQL Editor
SELECT * FROM profiles WHERE id = '[user_id]';
```

**Correction:**
1. Exécuter `scripts/031-ensure-user-triggers.sql`
2. Vérifier que le trigger `on_auth_user_created` existe
3. Si le trigger existe mais ne fonctionne pas, créer le profil manuellement :

```sql
-- Créer le profil manuellement
INSERT INTO public.profiles (id, email, full_name)
VALUES (
  '[user_id]',
  '[email]',
  'Utilisateur'
)
ON CONFLICT (id) DO NOTHING;
```

---

### Erreur 3: "Farm not created"

**Symptôme:**
- Profil créé mais pas de ferme dans `farms`

**Vérification:**
```sql
-- Dans Supabase SQL Editor
SELECT * FROM farms WHERE user_id = '[user_id]';
```

**Correction:**
1. Vérifier que le trigger `on_profile_created` existe (voir script 031)
2. OU la ferme sera créée automatiquement au premier accès via `getCurrentFarmId()`
3. Si nécessaire, créer manuellement :

```sql
-- Créer la ferme manuellement
INSERT INTO public.farms (user_id, name, is_primary)
VALUES (
  '[user_id]',
  'Ma ferme',
  true
)
ON CONFLICT DO NOTHING;
```

---

### Erreur 4: "Email not sent"

**Symptôme:**
- Pas d'email de confirmation reçu

**Vérification:**
1. Supabase Dashboard → Authentication → Settings
2. Vérifier "Enable email confirmations" est activé
3. Vérifier le template "Confirm signup" est configuré

**Correction:**
- Suivre `EMAIL_CONFIGURATION.md`

---

### Erreur 5: "Network error" ou "Connection failed"

**Symptôme:**
```
Error: Network request failed
```

**Vérification:**
1. Vérifier la connexion internet
2. Vérifier les variables d'environnement dans `eas.json`
3. Vérifier que Supabase est accessible

**Correction:**
```bash
# Vérifier les variables
cat eas.json | grep EXPO_PUBLIC_SUPABASE
```

---

### Erreur 6: "Redirect not working"

**Symptôme:**
- Après confirmation email, pas de redirection

**Vérification:**
1. Vérifier `app.json` → `scheme: "porkyfarm"`
2. Vérifier le handler dans `app/_layout.tsx`
3. Vérifier le deep link dans `services/auth.ts`

**Correction:**
- Vérifier que le deep link est correctement configuré

---

## 📊 CHECKLIST DE TEST

### Avant le test
- [ ] App lancée (`npx expo start`)
- [ ] Supabase Dashboard ouvert
- [ ] Console Metro visible
- [ ] Triggers vérifiés (script 031 exécuté)
- [ ] Email de test prêt

### Pendant le test
- [ ] Page d'inscription accessible
- [ ] Formulaire rempli
- [ ] Soumission réussie
- [ ] Écran de confirmation affiché
- [ ] Utilisateur créé dans Supabase
- [ ] Profil créé automatiquement
- [ ] Ferme créée automatiquement (ou au premier accès)
- [ ] Email de confirmation reçu
- [ ] Aucune erreur dans la console

### Après le test
- [ ] Confirmation email fonctionne
- [ ] Redirection vers dashboard
- [ ] Dashboard s'affiche
- [ ] Données se chargent
- [ ] Aucune erreur persistante

---

## 🔧 COMMANDES DE DEBUG

### Vérifier les appels API

```bash
# Dans la console Metro, chercher :
[Auth] signUp
[Auth] User created
[Auth] Error
```

### Vérifier dans Supabase

```sql
-- Vérifier l'utilisateur
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'test+porkyfarm@example.com'
ORDER BY created_at DESC 
LIMIT 1;

-- Vérifier le profil
SELECT * FROM profiles 
WHERE id = '[user_id_from_above]';

-- Vérifier la ferme
SELECT * FROM farms 
WHERE user_id = '[user_id_from_above]';
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

