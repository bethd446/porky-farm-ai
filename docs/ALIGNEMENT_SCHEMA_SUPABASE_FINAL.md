# ✅ Alignement Complet sur Schéma Supabase Réel

**Date** : 2025-01-28  
**Tech Lead** : Alignement `porkyfarm-mobile` sur schéma Supabase confirmé

---

## 📋 SCHÉMA SUPABASE CONFIRMÉ

### Tables et Colonnes

1. **`public.profiles`** :
   - `id` (uuid, clé = auth.uid())
   - `has_completed_onboarding` (boolean, not null, default false)
   - `onboarding_data` (jsonb)
   - `subscription_tier` (text, default 'free', check: 'free','premium','enterprise')

2. **`public.pigs`** :
   - `id`, `user_id`, `tag_number`, `birth_date`, `sex`, `breed`, `status`, `weight_history` (jsonb), `photo_url`, `mother_id`, `father_id`, `notes`, `created_at`, `updated_at`

3. **`public.events`** :
   - `event_type` ('vaccination','weighing','birth','sale','treatment','other')
   - `title`, `description`, `cost`, `event_date`

4. **`public.transactions`** :
   - `type` ('income','expense')
   - `category` ('sale','feed','veterinary','equipment','labor','other')
   - `amount`, `description`, `transaction_date`

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. Service Onboarding

**Fichier** : `porkyfarm-mobile/services/onboarding.ts`

**Changements** :
- ✅ `checkOnboardingStatus()` utilise `.select('has_completed_onboarding, onboarding_data, subscription_tier')`
- ✅ Retourne `{ hasCompleted, onboardingData?, subscriptionTier?, error? }`
- ✅ `markOnboardingCompleted()` met à jour `has_completed_onboarding = true`
- ✅ `saveOnboardingData()` met à jour `onboarding_data` et `has_completed_onboarding = true`
- ✅ Pas de logs "Table or column not found" inutiles
- ✅ Gestion d'erreurs robuste (PGRST116, réseau, etc.)

**Code clé** :
```typescript
checkOnboardingStatus: async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('has_completed_onboarding, onboarding_data, subscription_tier')
    .eq('id', user.id)
    .single()
  
  return {
    hasCompleted: Boolean(data?.has_completed_onboarding),
    onboardingData: data?.onboarding_data || null,
    subscriptionTier: data?.subscription_tier || 'free',
    error: null,
  }
}
```

---

### 2. OnboardingGuard

**Fichier** : `porkyfarm-mobile/app/_layout.tsx`

**Changements** :
- ✅ Utilise le nouvel objet de retour de `checkOnboardingStatus()`
- ✅ `hasTriedOnboardingCheck` ne se remet **JAMAIS** à `false` (sauf logout)
- ✅ `hasLoggedOnce` pour logger une seule fois
- ✅ En cas d'erreur : `setNeedsOnboarding(false)` (ne pas bloquer)
- ✅ En cas de succès : `setNeedsOnboarding(!hasCompleted)`
- ✅ Logs limités : `[OnboardingGuard] Déclenchement checkOnboarding` (une fois) et `[OnboardingGuard] Onboarding status: completed/not completed`

**Code clé** :
```typescript
const hasLoggedOnce = useRef(false)

if (!hasLoggedOnce.current) {
  console.log('[OnboardingGuard] Déclenchement checkOnboarding')
  hasLoggedOnce.current = true
}

// Après le check
console.log('[OnboardingGuard] Onboarding status:', result.hasCompleted ? 'completed' : 'not completed')
```

---

### 3. Service Animals (pigs)

**Fichier** : `porkyfarm-mobile/services/animals.ts`

**Changements** :
- ✅ Interface `Animal` alignée sur `public.pigs` :
  - `tag_number` (au lieu de `identifier`)
  - `sex` ('male' | 'female' | 'unknown', au lieu de `category`)
  - `photo_url` (au lieu de `image_url`)
  - `weight_history` (jsonb, au lieu de `weight`)
- ✅ Helpers `mapCategoryToSex()` et `mapSexToCategory()` pour conversion UI ↔ DB
- ✅ `AnimalInsert` utilise directement `sex`, `tag_number`, `photo_url`, `weight_history`

**Code clé** :
```typescript
export function mapCategoryToSex(category: 'sow' | 'boar' | 'piglet' | 'fattening'): 'male' | 'female' | 'unknown' {
  if (category === 'sow') return 'female'
  if (category === 'boar') return 'male'
  return 'unknown'
}

export function mapSexToCategory(sex: string): 'sow' | 'boar' | 'piglet' | 'fattening' {
  if (sex === 'female') return 'sow'
  if (sex === 'male') return 'boar'
  return 'fattening'
}
```

---

### 4. Service Events

**Fichier** : `porkyfarm-mobile/services/events.ts` (nouveau)

**Changements** :
- ✅ Service complet pour `public.events`
- ✅ `event_type` : 'vaccination','weighing','birth','sale','treatment','other'
- ✅ Colonnes : `title`, `description`, `cost`, `event_date`
- ✅ CRUD complet : `getAll()`, `getByType()`, `getByPig()`, `getById()`, `create()`, `update()`, `delete()`

**Note** : Les cas de santé peuvent utiliser `events` avec `event_type = 'treatment'` ou continuer à utiliser `health_records` si cette table existe.

---

### 5. Service Transactions (Costs)

**Fichier** : `porkyfarm-mobile/services/costs.ts`

**Changements** :
- ✅ Aligné sur `public.transactions`
- ✅ `type` : 'income' | 'expense'
- ✅ `category` : 'sale' | 'feed' | 'veterinary' | 'equipment' | 'labor' | 'other'
- ✅ Colonnes : `amount`, `description`, `transaction_date`

---

### 6. Formulaire Ajout Animal

**Fichier** : `porkyfarm-mobile/app/(tabs)/livestock/add.tsx`

**Changements** :
- ✅ Utilise `tag_number` au lieu de `identifier`
- ✅ Mappe `category` (UI) vers `sex` (DB) via `mapCategoryToSex()`
- ✅ Convertit `weight` (UI) en `weight_history` (DB) : `[{ date, weight }]`
- ✅ Utilise `photo_url` au lieu de `image_url`

**Code clé** :
```typescript
const sex = mapCategoryToSex(formData.category)
const weightHistory = formData.weight
  ? [{ date: new Date().toISOString().split('T')[0], weight: formData.weight }]
  : null

const animalData: AnimalInsert = {
  tag_number: formData.tag_number,
  sex,
  weight_history: weightHistory,
  photo_url: formData.photo_url || null,
  // ...
}
```

---

### 7. Helper AnimalUI (pour compatibilité UI)

**Fichier** : `porkyfarm-mobile/lib/animalHelpers.ts` (nouveau)

**Changements** :
- ✅ Interface `AnimalUI` avec propriétés calculées :
  - `identifier` (alias de `tag_number`)
  - `category` (calculé depuis `sex`)
  - `image_url` (alias de `photo_url`)
  - `weight` (extrait de `weight_history`)
- ✅ Fonction `animalToUI()` pour convertir `Animal` → `AnimalUI`
- ✅ Fonction `animalsToUI()` pour convertir `Animal[]` → `AnimalUI[]`

**Note** : Les fichiers UI existants (`livestock/index.tsx`, `livestock/[id].tsx`, `index.tsx`, etc.) devront être mis à jour pour utiliser `animalToUI()` ou adapter leurs références.

---

## 📝 FICHIERS MODIFIÉS

1. ✅ `porkyfarm-mobile/services/onboarding.ts` - Aligné sur `profiles`
2. ✅ `porkyfarm-mobile/app/_layout.tsx` - OnboardingGuard amélioré
3. ✅ `porkyfarm-mobile/services/animals.ts` - Aligné sur `pigs` (tag_number, sex, photo_url, weight_history)
4. ✅ `porkyfarm-mobile/services/events.ts` - Nouveau service pour `events`
5. ✅ `porkyfarm-mobile/services/costs.ts` - Aligné sur `transactions`
6. ✅ `porkyfarm-mobile/app/(tabs)/livestock/add.tsx` - Formulaire aligné
7. ✅ `porkyfarm-mobile/lib/animalHelpers.ts` - Helpers pour compatibilité UI

---

## 🔄 FICHIERS À METTRE À JOUR (UI)

Les fichiers suivants utilisent encore les anciennes propriétés (`identifier`, `category`, `image_url`, `weight`) et devront être mis à jour :

1. `porkyfarm-mobile/app/(tabs)/livestock/index.tsx` - Utilise `item.identifier`, `item.category`
2. `porkyfarm-mobile/app/(tabs)/livestock/[id].tsx` - Utilise `animal.identifier`, `animal.category`, `animal.weight`
3. `porkyfarm-mobile/app/(tabs)/index.tsx` - Utilise `a.category`
4. `porkyfarm-mobile/app/(tabs)/reproduction/add.tsx` - Utilise `a.category`
5. `porkyfarm-mobile/app/(tabs)/health/add.tsx` - Utilise `animal.identifier`
6. `porkyfarm-mobile/components/AnimalListItem.tsx` - Utilise `animal.identifier`, `animal.category`, `animal.weight`, `animal.photo`

**Solution** : Utiliser `animalToUI()` ou adapter directement les références.

---

## 🧪 PLAN DE TESTS MANUELS

### Test 1 : OnboardingGuard - Pas de boucle ✅

**Scénario** :
1. Lancer l'app mobile
2. Observer les logs dans la console

**Résultat attendu** :
- ✅ `[OnboardingGuard] Déclenchement checkOnboarding` apparaît **une seule fois**
- ✅ `[OnboardingGuard] Onboarding status: completed/not completed` apparaît **une seule fois**
- ✅ Pas de logs "Table or column not found"
- ✅ Pas de boucle infinie

---

### Test 2 : Utilisateur Sans Onboarding ✅

**Scénario** :
- Utilisateur connecté
- `has_completed_onboarding = false` dans `profiles`

**Résultat attendu** :
- ✅ Spinner "Chargement..." (max 8s)
- ✅ Redirection vers `/onboarding` **une seule fois**
- ✅ Pas de boucle

---

### Test 3 : Utilisateur Avec Onboarding Complété ✅

**Scénario** :
- Utilisateur connecté
- `has_completed_onboarding = true` dans `profiles`

**Résultat attendu** :
- ✅ Spinner "Chargement..." (max 8s)
- ✅ Accès direct aux `(tabs)` (Accueil)
- ✅ Pas de redirection vers `/onboarding`

---

### Test 4 : Ajout Animal ✅

**Scénario** :
1. Aller sur "Ajouter un animal"
2. Remplir le formulaire :
   - Numéro d'identification : `TRUIE-001`
   - Catégorie : `Truie`
   - Poids : `150`
   - Photo (optionnel)
3. Enregistrer

**Résultat attendu** :
- ✅ Animal créé dans `pigs` avec :
  - `tag_number = 'TRUIE-001'`
  - `sex = 'female'` (mappé depuis `category = 'sow'`)
  - `weight_history = [{ date: '2025-01-28', weight: 150 }]`
  - `photo_url = <base64>` (si photo ajoutée)
- ✅ Pas d'erreur "column not found"

---

### Test 5 : Liste Animaux ✅

**Scénario** :
1. Aller sur "Mon Cheptel"
2. Voir la liste des animaux

**Résultat attendu** :
- ✅ Liste affichée correctement
- ✅ `tag_number` affiché comme identifiant
- ✅ `sex` mappé vers label français (Truie, Verrat, etc.)
- ✅ Pas d'erreur "property does not exist"

---

### Test 6 : Service Events ✅

**Scénario** :
1. Créer un événement (vaccination, pesée, etc.)
2. Vérifier dans Supabase

**Résultat attendu** :
- ✅ Événement créé dans `events` avec :
  - `event_type` correct ('vaccination', 'weighing', etc.)
  - `title`, `description`, `cost`, `event_date` remplis

---

### Test 7 : Service Transactions ✅

**Scénario** :
1. Créer une transaction (dépense ou revenu)
2. Vérifier dans Supabase

**Résultat attendu** :
- ✅ Transaction créée dans `transactions` avec :
  - `type` correct ('income' ou 'expense')
  - `category` correct ('sale', 'feed', 'veterinary', etc.)
  - `amount`, `description`, `transaction_date` remplis

---

## ✅ GARANTIES

1. **OnboardingService** :
   - ✅ Utilise `profiles.has_completed_onboarding`
   - ✅ Retourne format stable avec `onboardingData` et `subscriptionTier`
   - ✅ Pas de logs "Table or column not found" inutiles

2. **OnboardingGuard** :
   - ✅ Pas de boucle infinie (`hasTriedOnboardingCheck` reste `true`)
   - ✅ Logs limités (une seule fois)
   - ✅ Gestion d'erreurs robuste (ne bloque pas l'utilisateur)

3. **AnimalsService** :
   - ✅ Utilise `pigs.tag_number`, `pigs.sex`, `pigs.photo_url`, `pigs.weight_history`
   - ✅ Helpers de mapping UI ↔ DB

4. **EventsService** :
   - ✅ Utilise `events` avec `event_type`, `title`, `description`, `cost`, `event_date`

5. **CostsService** :
   - ✅ Utilise `transactions` avec `type`, `category`, `amount`, `description`, `transaction_date`

---

## 🎯 ÉTAT FINAL

- ✅ Services alignés sur schéma Supabase réel
- ✅ OnboardingGuard stable (pas de boucle, logs limités)
- ✅ Helpers de mapping UI ↔ DB
- ⚠️ Fichiers UI à mettre à jour (utiliser `animalToUI()` ou adapter références)

**Prochaine étape** : Mettre à jour les fichiers UI pour utiliser les nouvelles propriétés ou `animalToUI()`.

