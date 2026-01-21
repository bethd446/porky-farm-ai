# 📐 PLAN D'ARCHITECTURE - Onboarding State Management

**Date :** 28 Décembre 2024  
**Objectif :** Système d'onboarding robuste avec observabilité non-bloquante

---

## 🎯 PRINCIPES FONDAMENTAUX

1. **Source de vérité unique** : `public.profiles` (Supabase) pour la décision de navigation
2. **Cache local** : AsyncStorage pour pré-remplir les formulaires (offline)
3. **Non-bloquant** : Les logs ne doivent jamais bloquer l'UX
4. **Observabilité** : Tracking des événements en best-effort

---

## 📁 STRUCTURE DE FICHIERS

### **Web (Next.js)**

```
lib/
  onboarding/
    types.ts              # Types TypeScript (OnboardingState, etc.)
    state.ts              # Service de chargement d'état depuis Supabase
    hooks/
      useOnboardingState.ts  # Hook React pour accéder à l'état
    guards/
      OnboardingGuard.tsx    # Guard pour rediriger selon l'état
    observability/
      activity.ts         # Client pour user_activity
      health.ts           # Client pour app_health_logs
      queue.ts            # Queue d'événements pour offline
app/
  middleware.ts           # Route guard Next.js
  dashboard/
    layout.tsx            # Layout avec OnboardingGuard
```

### **Mobile (Expo)**

```
lib/
  onboarding/
    types.ts              # Types TypeScript (partagés avec web)
    state.ts              # Service de chargement d'état depuis Supabase
    cache.ts              # Gestion cache local (AsyncStorage)
    hooks/
      useOnboardingState.ts  # Hook React pour accéder à l'état
    guards/
      OnboardingGuard.tsx    # Guard pour rediriger selon l'état
    observability/
      activity.ts         # Client pour user_activity
      health.ts           # Client pour app_health_logs
      queue.ts            # Queue d'événements pour offline
app/
  _layout.tsx            # Root layout avec OnboardingGuard
```

### **Services Supabase (Partagés)**

```
lib/
  supabase/
    rpc.ts                # Helpers pour appeler les RPC
    observability.ts      # Client Supabase pour logs (partagé web/mobile)
```

---

## 🔧 COMPOSANTS À CRÉER

### 1. **Types TypeScript** (`lib/onboarding/types.ts`)

```typescript
export interface OnboardingState {
  hasCompleted: boolean
  step: string | null
  version: string | null
  completedAt: Date | null
  data: unknown | null
}

export interface OnboardingService {
  loadState: () => Promise<OnboardingState>
  markStep: (step: string, partialData?: any) => Promise<{ error: Error | null }>
  completeOnboarding: (finalData?: any) => Promise<{ error: Error | null; persisted: boolean }>
}
```

### 2. **Service d'État** (`lib/onboarding/state.ts`)

**Responsabilités :**
- Charger l'état depuis `profiles` (Supabase)
- Gérer les erreurs (redirection vers écran d'erreur + log)
- Exposer `markStep()` et `completeOnboarding()`
- Appeler la RPC `complete_onboarding`

### 3. **Hook React** (`lib/onboarding/hooks/useOnboardingState.ts`)

**Responsabilités :**
- Exposer l'état onboarding
- Exposer les méthodes `markStep()` et `completeOnboarding()`
- Gérer le loading/error state
- Recharger l'état après mutations

### 4. **Guard de Navigation** (`lib/onboarding/guards/OnboardingGuard.tsx`)

**Responsabilités :**
- Vérifier l'état onboarding au démarrage
- Rediriger selon les règles :
  - Pas connecté → auth
  - Connecté + `hasCompleted = false` → onboarding
  - Connecté + `hasCompleted = true` → dashboard
- Gérer les erreurs (écran d'erreur)

### 5. **Client Observabilité** (`lib/onboarding/observability/`)

**activity.ts :**
- `trackActivity(activity_type, details)` → insert en best-effort
- Queue d'événements pour offline
- Ne bloque jamais l'UI

**health.ts :**
- `logHealth(severity, event, message, context)` → insert en best-effort
- Queue d'événements pour offline
- Ne bloque jamais l'UI

**queue.ts :**
- Queue simple pour ordonnancer les insertions
- Traitement en arrière-plan
- Retry automatique

### 6. **Cache Local** (`lib/onboarding/cache.ts` - Mobile uniquement)

**Responsabilités :**
- Sauvegarder les données d'onboarding dans AsyncStorage
- Pré-remplir les formulaires si offline
- Gérer "pending completion" si terminé offline

---

## 🔄 FLOW D'ONBOARDING

### **Démarrage de l'app**

1. **Auth** → Vérifier si utilisateur connecté
2. **Load Onboarding State** → Charger depuis `profiles` (Supabase)
3. **Guard** → Décider de la navigation :
   - Si erreur → Écran d'erreur + log dans `app_health_logs`
   - Si `hasCompleted = false` → Onboarding
   - Si `hasCompleted = true` → Dashboard

### **Pendant l'onboarding**

1. **Chaque étape** → `markStep(step, partialData)`
   - Sauvegarde dans `profiles.onboarding_step` et `profiles.onboarding_data`
   - Track `activity_type = 'onboarding_step_view'`
   - Cache local (AsyncStorage) pour offline

2. **Complétion** → `completeOnboarding(finalData)`
   - Appelle RPC `complete_onboarding(p_step, p_version, p_data)`
   - Vérifie persistance (relecture)
   - Track `activity_type = 'onboarding_completed'`
   - Si offline → stocker "pending completion" local

### **Gestion Offline**

1. **Pending Completion** :
   - Si `completeOnboarding()` échoue (offline) → stocker dans AsyncStorage
   - Au retour réseau → appeler RPC automatiquement
   - Vérifier persistance après appel

2. **Pré-remplissage** :
   - Si offline → charger depuis AsyncStorage
   - Permettre à l'utilisateur de continuer
   - Synchroniser dès retour réseau

---

## 📊 ÉVÉNEMENTS À TRACKER

### **user_activity**

1. `onboarding_step_view`
   - `step`: string (ex: "step1", "step2")
   - `version`: string (ex: "v1.0")
   - `timestamp`: Date

2. `onboarding_completed`
   - `version`: string
   - `total_steps`: number
   - `timestamp`: Date

### **app_health_logs**

1. `onboarding_profile_fetch_failed`
   - `severity`: "error"
   - `message`: string
   - `context`: { userId, error }

2. `onboarding_complete_rpc_failed`
   - `severity`: "error"
   - `message`: string
   - `context`: { userId, step, error }

---

## 🛡️ ANTI-BUGS

### **1. Ne jamais utiliser le cache local pour la décision finale**

```typescript
// ❌ MAUVAIS
const cachedState = await AsyncStorage.getItem('onboarding_state')
if (cachedState?.hasCompleted) {
  router.push('/dashboard')
}

// ✅ BON
const state = await onboardingService.loadState() // Toujours depuis Supabase
if (state.hasCompleted) {
  router.push('/dashboard')
}
```

### **2. Cache local uniquement pour pré-remplir**

```typescript
// ✅ BON
const cachedData = await AsyncStorage.getItem('onboarding_data')
if (cachedData && isOffline) {
  // Pré-remplir le formulaire
  setFormData(JSON.parse(cachedData))
}
```

### **3. Pending completion si offline**

```typescript
// ✅ BON
const { error } = await completeOnboarding(data)
if (error && isOffline) {
  // Stocker "pending completion"
  await AsyncStorage.setItem('pending_completion', JSON.stringify(data))
  // Retry automatique au retour réseau
}
```

---

## 📝 FICHIERS À CRÉER/MODIFIER

### **Mobile (Expo) - Priorité**

1. ✅ `porkyfarm-mobile/lib/onboarding/types.ts` (nouveau)
2. ✅ `porkyfarm-mobile/lib/onboarding/state.ts` (nouveau)
3. ✅ `porkyfarm-mobile/lib/onboarding/cache.ts` (nouveau)
4. ✅ `porkyfarm-mobile/lib/onboarding/hooks/useOnboardingState.ts` (nouveau)
5. ✅ `porkyfarm-mobile/lib/onboarding/guards/OnboardingGuard.tsx` (remplacer existant)
6. ✅ `porkyfarm-mobile/lib/onboarding/observability/activity.ts` (nouveau)
7. ✅ `porkyfarm-mobile/lib/onboarding/observability/health.ts` (nouveau)
8. ✅ `porkyfarm-mobile/lib/onboarding/observability/queue.ts` (nouveau)
9. ✅ `porkyfarm-mobile/app/_layout.tsx` (modifier pour utiliser nouveau guard)
10. ✅ `porkyfarm-mobile/services/onboarding.ts` (adapter pour utiliser nouveau système)

### **Web (Next.js) - À faire après**

1. `lib/onboarding/types.ts` (partagé avec mobile)
2. `lib/onboarding/state.ts` (adapté pour web)
3. `lib/onboarding/hooks/useOnboardingState.ts` (adapté pour web)
4. `lib/onboarding/guards/OnboardingGuard.tsx` (adapté pour web)
5. `lib/onboarding/observability/activity.ts` (partagé)
6. `lib/onboarding/observability/health.ts` (partagé)
7. `app/middleware.ts` (route guard Next.js)
8. `app/dashboard/layout.tsx` (intégrer guard)

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Créer le plan (ce document)
2. ⏭️ Implémenter le système mobile (exemple complet)
3. ⏭️ Adapter pour web (après validation mobile)
4. ⏭️ Créer les scripts SQL pour les tables de logs
5. ⏭️ Tester le flow complet

---

**Plan validé. Passage à l'implémentation mobile.**

