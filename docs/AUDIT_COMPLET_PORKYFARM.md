# 🔍 AUDIT COMPLET PORKYFARM - WEB + MOBILE + BACKEND

**Date** : 2025-01-28  
**Tech Lead** : Audit système complet  
**Objectif** : Identifier et corriger tous les problèmes critiques

---

## 📊 RÉSUMÉ EXÉCUTIF

### Problèmes Critiques Identifiés

1. **❌ CRITIQUE** : Table `veterinary_cases` utilisée dans API web mais n'existe pas (devrait être `health_records`)
2. **❌ CRITIQUE** : Colonne `subscription_tier` utilisée dans admin mais non définie dans schéma
3. **⚠️ MOYEN** : Dépendances Expo non alignées (versions)
4. **⚠️ MOYEN** : ESLint non installé (web)
5. **✅ OK** : Tables mobiles alignées avec schéma (`pigs`, `health_records`, `gestations`, `feed_stock`, `transactions`, `tasks`)

---

## A. WEB – ERREURS ET CORRECTIONS

### A.1. Erreur : Table `veterinary_cases` inexistante

**Description** :
- Fichier `app/api/health-cases/route.ts` ligne 36 utilise `.from("veterinary_cases")`
- La table réelle dans Supabase est `health_records` (définie dans `scripts/001-create-tables.sql`)

**Cause identifiée** :
- Incohérence entre code web et schéma Supabase
- Le mobile utilise correctement `health_records`

**Fichiers concernés** :
- `app/api/health-cases/route.ts` (ligne 36)
- `app/api/health-cases/[id]/route.ts` (à vérifier)

**Plan de correction** :
- Remplacer `veterinary_cases` par `health_records` dans toutes les API routes
- Vérifier que les colonnes utilisées correspondent au schéma (`title`, `severity`, `status`, `pig_id`, etc.)

---

### A.2. Erreur : Colonne `subscription_tier` manquante

**Description** :
- `app/admin/page.tsx` ligne 128 utilise `u.subscription_tier === "pro"`
- `scripts/001-admin-roles-setup.sql` référence `subscription_tier` dans RPC
- Mais `scripts/001-create-tables.sql` ne définit pas cette colonne dans `profiles`

**Cause identifiée** :
- Colonne utilisée mais non créée dans le schéma initial

**Fichiers concernés** :
- `app/admin/page.tsx` (lignes 128, 129)
- `lib/admin/admin-utils.ts` (interface `UserProfile`)
- `scripts/001-create-tables.sql` (table `profiles`)

**Plan de correction** :
- Ajouter colonne `subscription_tier TEXT DEFAULT 'free'` dans `profiles`
- Ou supprimer les références si non nécessaire pour MVP

---

### A.3. Vérification Routes Dashboard

**Routes à tester** :
- `/dashboard` (page principale)
- `/dashboard/livestock`
- `/dashboard/health`
- `/dashboard/reproduction`
- `/dashboard/feeding`
- `/dashboard/ai-assistant`
- `/dashboard/profile`

**État** : À tester en local

---

## B. MOBILE – ERREURS ET CORRECTIONS

### B.1. ✅ Tables Supabase alignées

**Vérification** :
- `porkyfarm-mobile/services/animals.ts` → `pigs` ✅
- `porkyfarm-mobile/services/healthCases.ts` → `health_records` ✅
- `porkyfarm-mobile/services/gestations.ts` → `gestations` ✅
- `porkyfarm-mobile/services/feeding.ts` → `feed_stock` ✅
- `porkyfarm-mobile/services/costs.ts` → `transactions` ✅
- `porkyfarm-mobile/services/tasks.ts` → `tasks` ✅
- `porkyfarm-mobile/services/onboarding.ts` → `profiles` ✅

**État** : ✅ Toutes les tables sont correctement alignées

---

### B.2. ⚠️ Dépendances Expo non alignées

**Problème** :
- `@react-native-community/datetimepicker` : 8.5.1 (attendu 8.4.4)
- `react-native-svg` : 15.15.1 (attendu 15.12.1)
- `@react-navigation/bottom-tabs` : ^7.9.0 (attendu ^7.4.0)
- `@react-navigation/native` : ^7.1.26 (attendu ^7.1.8)

**Impact** : Faible (versions mineures/patch)

**Plan de correction** :
- Exécuter `npx expo install --check` pour aligner
- Ou ajouter à `expo.install.exclude` si fonctionnel

---

### B.3. Navigation Expo Router

**Routes vérifiées** :
- `(auth)` ✅
- `onboarding` ✅
- `(tabs)` ✅
- `profile/index` ✅
- `debug/supabase-test` ✅

**État** : ✅ Routes alignées avec structure fichiers

---

## C. BACKEND / SUPABASE / API

### C.1. Tables Supabase - État

**Tables définies dans schéma** :
- ✅ `profiles` (avec `has_completed_onboarding` via script 006)
- ✅ `pigs`
- ✅ `health_records`
- ✅ `vaccinations`
- ✅ `gestations`
- ✅ `feeding_records`
- ✅ `feed_stock`
- ✅ `transactions`
- ✅ `tasks` (via script 006)

**Tables utilisées dans code** :
- ✅ `profiles` (web + mobile)
- ✅ `pigs` (web + mobile)
- ✅ `health_records` (mobile) / ❌ `veterinary_cases` (web - ERREUR)
- ✅ `gestations` (web + mobile)
- ✅ `feed_stock` (mobile)
- ✅ `transactions` (mobile)
- ✅ `tasks` (mobile)

**Problème identifié** :
- ❌ Web utilise `veterinary_cases` au lieu de `health_records`

---

### C.2. API Routes Next.js

**Routes identifiées** :
- `/api/animals` ✅ (utilise `pigs`)
- `/api/health-cases` ❌ (utilise `veterinary_cases` - ERREUR)
- `/api/gestations` ✅ (utilise `gestations`)
- `/api/chat` ✅ (Assistant IA)
- `/api/ai/chat` ✅ (Vercel AI Gateway)
- `/api/weather` (à vérifier)
- `/api/alerts/send-sms` (à vérifier)

---

## D. CORRECTIONS À APPLIQUER

### D.1. Correction API Health Cases (PRIORITÉ 1)

**Fichier** : `app/api/health-cases/route.ts`

**Changement** :
```typescript
// AVANT
.from("veterinary_cases")

// APRÈS
.from("health_records")
```

**Vérifier aussi** :
- Colonnes utilisées : `title`, `severity`, `status`, `pig_id`, `start_date`, etc.
- Aligner avec schéma `health_records`

---

### D.2. Correction API Health Cases [id] (PRIORITÉ 1)

**Fichier** : `app/api/health-cases/[id]/route.ts`

**Vérifier** :
- Utilise `veterinary_cases` ou `health_records` ?
- Corriger si nécessaire

---

### D.3. Ajout colonne subscription_tier (PRIORITÉ 2)

**Option A** : Ajouter la colonne
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));
```

**Option B** : Supprimer les références (si non MVP)
- Modifier `app/admin/page.tsx` pour ne pas utiliser `subscription_tier`

---

## E. CHECKLIST DE VALIDATION

### Web
- [ ] `/api/health-cases` utilise `health_records`
- [ ] `/api/health-cases/[id]` utilise `health_records`
- [ ] Admin dashboard fonctionne (avec ou sans `subscription_tier`)
- [ ] Toutes les routes dashboard se chargent sans erreur

### Mobile
- [ ] App démarre sans erreur
- [ ] Onboarding fonctionne
- [ ] Navigation bottom tabs fonctionne
- [ ] Ajout animal fonctionne
- [ ] Cas de santé fonctionne
- [ ] Gestations fonctionne
- [ ] Stock alimentation fonctionne
- [ ] Assistant IA fonctionne

### Backend
- [ ] Toutes les tables utilisées existent dans Supabase
- [ ] Toutes les colonnes utilisées existent dans les tables
- [ ] API routes retournent des données valides

---

## F. PROCHAINES ÉTAPES

1. **Immédiat** : Corriger `veterinary_cases` → `health_records` dans API web
2. **Immédiat** : Décider pour `subscription_tier` (ajouter ou supprimer)
3. **Court terme** : Tester toutes les routes web en local
4. **Court terme** : Tester toutes les routes mobile en simulateur
5. **Moyen terme** : Aligner dépendances Expo
6. **Moyen terme** : Installer ESLint pour web

---

## G. FICHIERS À MODIFIER

### Priorité 1 (Critique)
1. `app/api/health-cases/route.ts` - Remplacer `veterinary_cases` par `health_records`
2. `app/api/health-cases/[id]/route.ts` - Vérifier et corriger si nécessaire

### Priorité 2 (Important)
3. `scripts/001-create-tables.sql` - Ajouter `subscription_tier` OU
4. `app/admin/page.tsx` - Supprimer références `subscription_tier`

### Priorité 3 (Amélioration)
5. `porkyfarm-mobile/package.json` - Aligner dépendances Expo
6. `package.json` - Installer ESLint

