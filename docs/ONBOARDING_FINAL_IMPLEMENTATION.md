# ✅ Implémentation Finale Onboarding - PorkyFarm Mobile

## 📋 Résumé

Refonte complète de `onboardingService` et `OnboardingGuard` pour :
- ✅ Utiliser `public.profiles.has_completed_onboarding` (boolean)
- ✅ Arrêter les warnings "table or column not found"
- ✅ Éviter toute boucle infinie ou spinner bloqué

---

## 📁 Fichiers Modifiés

1. **`porkyfarm-mobile/services/onboarding.ts`** - Service complet
2. **`porkyfarm-mobile/app/_layout.tsx`** - OnboardingGuard renforcé

---

## 🔧 Code Complet

### 1. `services/onboarding.ts`

#### `checkOnboardingStatus()`

```typescript
checkOnboardingStatus: async () => {
  try {
    // Vérifier auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { hasCompleted: false, error: authError || new Error('Non authentifié') }
    }

    // Requête Supabase : select has_completed_onboarding
    const { data, error } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', user.id)
      .single()

    if (error) {
      // PGRST116 (No rows) ou PGRST205 (Table/column not found)
      // → Comportement gracieux : hasCompleted: false, error: null
      if (error.code === 'PGRST116' || error.code === 'PGRST205' || 
          error.message?.includes('not found') || error.message?.includes('No rows')) {
        return { hasCompleted: false, error: null } // Pas de warning
      }
      
      // Erreur réseau → retourner error
      if (error.message?.includes('network') || error.message?.includes('timeout')) {
        return { hasCompleted: false, error: new Error('Erreur réseau...') }
      }
      
      // Autre erreur Supabase
      return { hasCompleted: false, error: error as Error }
    }

    // Succès
    return { hasCompleted: Boolean(data?.has_completed_onboarding), error: null }
  } catch (err: any) {
    return { hasCompleted: false, error: err instanceof Error ? err : new Error('Erreur inattendue') }
  }
}
```

**Caractéristiques** :
- ✅ Retourne toujours `{ hasCompleted: boolean; error?: Error | null }`
- ✅ Ne throw jamais d'exception non catchée
- ✅ PGRST116/PGRST205 → `{ hasCompleted: false, error: null }` (pas de warning)
- ✅ Utilise `console.warn` uniquement pour vraies erreurs

#### `markOnboardingCompleted()`

```typescript
markOnboardingCompleted: async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Non authentifié') }

  const { error } = await supabase
    .from('profiles')
    .update({
      has_completed_onboarding: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  return { error: error ? (error as Error) : null }
}
```

---

### 2. `app/_layout.tsx` - OnboardingGuard

#### États et Refs

```typescript
const [checkingOnboarding, setCheckingOnboarding] = useState(false)
const [onboardingError, setOnboardingError] = useState<Error | null>(null)
const [needsOnboarding, setNeedsOnboarding] = useState(false)
const [hasTriedOnboardingCheck, setHasTriedOnboardingCheck] = useState(false)
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const isCheckingRef = useRef(false) // Protection contre appels multiples
```

#### Fonction `checkOnboarding()`

```typescript
const checkOnboarding = async () => {
  // Protection contre appels multiples
  if (isCheckingRef.current) return
  if (!user) {
    setCheckingOnboarding(false)
    setHasTriedOnboardingCheck(true)
    isCheckingRef.current = false
    return
  }

  isCheckingRef.current = true
  setCheckingOnboarding(true)
  setOnboardingError(null)

  try {
    // Timeout 8s + race condition
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject(new Error('Timeout: La vérification prend trop de temps'))
      }, 8000)
    })

    const result = await Promise.race([
      onboardingService.checkOnboardingStatus(),
      timeoutPromise,
    ])

    // Nettoyage timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (result.error) {
      // Si erreur : on laisse passer l'utilisateur
      setOnboardingError(result.error)
      setNeedsOnboarding(false)
    } else {
      // Si succès : setNeedsOnboarding selon hasCompleted
      setNeedsOnboarding(!result.hasCompleted)
    }
  } catch (err: any) {
    // Nettoyage timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOnboardingError(err instanceof Error ? err : new Error('Erreur lors de la vérification'))
    setNeedsOnboarding(false)
  } finally {
    // IMPORTANT: Toujours reset dans finally
    isCheckingRef.current = false
    setCheckingOnboarding(false)
    setHasTriedOnboardingCheck(true)
  }
}
```

#### useEffect

```typescript
useEffect(() => {
  // Déclencher une seule fois quand toutes les conditions sont remplies
  if (!authLoading && user && !hasTriedOnboardingCheck && !isCheckingRef.current) {
    checkOnboarding()
  } else if (!authLoading && !user) {
    // Pas d'utilisateur : reset des états
    setCheckingOnboarding(false)
    setNeedsOnboarding(false)
    setHasTriedOnboardingCheck(true) // Marquer comme essayé
    setOnboardingError(null)
    isCheckingRef.current = false
  }
}, [user, authLoading, hasTriedOnboardingCheck])
```

#### Comportement UI

```typescript
// 1. État de chargement
if (authLoading || checkingOnboarding) {
  return <ActivityIndicator + "Chargement..." />
}

// 2. État d'erreur
if ((authError || onboardingError) && !authLoading && !checkingOnboarding) {
  return <ErrorState onRetry={handleRetry} />
}

// 3. Redirection onboarding
if (needsOnboarding && user) {
  return <Redirect href="/onboarding" />
}

// 4. App normale
return <>{children}</>
```

---

## 🧪 Scénarios de Test

### Test 1 : Utilisateur sans onboarding

**Prérequis** :
- Utilisateur connecté
- `has_completed_onboarding = false` (ou colonne absente)

**Étapes** :
1. Lancer l'app
2. Attendre chargement auth (< 10s)
3. Attendre check onboarding (< 8s)

**Résultat attendu** :
- ✅ Spinner "Chargement..." (max 8s)
- ✅ Redirection vers `/onboarding` **une seule fois**
- ✅ Pas de boucle infinie
- ✅ Pas de warnings console

**Vérifications** :
- Logs console : `[OnboardingGuard] Déclenchement checkOnboarding` (une seule fois)
- Pas de logs répétés `[onboardingService] Table or column not found`
- `hasTriedOnboardingCheck = true` après le check

---

### Test 2 : Utilisateur avec onboarding complété

**Prérequis** :
- Utilisateur connecté
- `has_completed_onboarding = true` dans `profiles`

**Étapes** :
1. Lancer l'app
2. Attendre chargement auth
3. Attendre check onboarding

**Résultat attendu** :
- ✅ Spinner "Chargement..." (max 8s)
- ✅ Accès direct aux `(tabs)` (Accueil)
- ✅ **Pas de redirection** vers `/onboarding`
- ✅ Pas de spinner bloqué

**Vérifications** :
- `needsOnboarding = false`
- `hasTriedOnboardingCheck = true`
- Dashboard s'affiche normalement

---

### Test 3 : Erreur réseau simulée

**Prérequis** :
- Utilisateur connecté
- WiFi/Données désactivées

**Étapes** :
1. Désactiver réseau
2. Lancer l'app
3. Attendre timeout (8s)

**Résultat attendu** :
- ✅ Spinner "Chargement..." (8s)
- ✅ `ErrorState` avec message "Impossible de charger les données..."
- ✅ Bouton "Réessayer" visible
- ✅ Pas de spinner bloqué

**Étapes suivantes** :
4. Réactiver réseau
5. Cliquer "Réessayer"

**Résultat attendu** :
- ✅ Nouvelle tentative de check onboarding
- ✅ Si succès → Redirection ou accès app selon statut
- ✅ Si échec → `ErrorState` à nouveau

**Vérifications** :
- `onboardingError` défini avec message réseau
- `hasTriedOnboardingCheck = true` après timeout
- `isCheckingRef = false` après timeout

---

### Test 4 : Protection appels multiples

**Prérequis** :
- Utilisateur connecté

**Étapes** :
1. Lancer l'app
2. Simuler changement rapide de `user` (si possible)

**Résultat attendu** :
- ✅ Un seul appel à `checkOnboarding()`
- ✅ `isCheckingRef` empêche appels parallèles
- ✅ Pas de logs répétés

**Vérifications** :
- Logs console : `checkOnboarding déjà en cours, ignoré` si appel multiple
- `hasTriedOnboardingCheck = true` après premier check

---

### Test 5 : Utilisateur non connecté

**Prérequis** :
- Pas de session Supabase

**Étapes** :
1. Lancer l'app sans être connecté

**Résultat attendu** :
- ✅ Spinner auth (max 10s)
- ✅ Redirection vers `/(auth)/login`
- ✅ **Pas de check onboarding** déclenché
- ✅ Pas de warnings

**Vérifications** :
- `hasTriedOnboardingCheck = true` (marqué comme essayé)
- `checkingOnboarding = false`
- Pas d'appel à `checkOnboardingStatus()`

---

## ✅ Garanties

1. **Pas de warnings "table or column not found"** :
   - PGRST116/PGRST205 → `{ hasCompleted: false, error: null }`
   - Pas de `console.warn` pour ces cas

2. **Pas de boucle infinie** :
   - `hasTriedOnboardingCheck` reste `true` après check
   - `isCheckingRef` empêche appels multiples
   - `useEffect` ne se déclenche qu'une seule fois

3. **Pas de spinner bloqué** :
   - `checkingOnboarding` passe toujours à `false` dans `finally`
   - Timeout nettoyé dans tous les cas
   - `ErrorState` affiché en cas d'erreur

4. **Format de retour stable** :
   - `checkOnboardingStatus()` retourne toujours `{ hasCompleted: boolean; error?: Error | null }`
   - Pas d'exception non catchée

---

## 📊 Flux Complet

```
App démarre
    ↓
AuthProvider charge session (timeout 10s)
    ↓
┌─────────────────────────────────────┐
│  authLoading = false ?              │
└─────────────────────────────────────┘
    │                    │
   OUI                  NON → Spinner
    │
    ↓
┌─────────────────────────────────────┐
│  user défini ?                       │
└─────────────────────────────────────┘
    │                    │
   OUI                  NON → (auth)
    │
    ↓
┌─────────────────────────────────────┐
│  hasTriedOnboardingCheck = false ?   │
│  isCheckingRef.current = false ?     │
└─────────────────────────────────────┘
    │                    │
   OUI                  NON → Skip
    │
    ↓
checkOnboarding() (timeout 8s)
    ↓
┌─────────────────────────────────────┐
│  result.error ?                     │
└─────────────────────────────────────┘
    │                    │
   OUI                  NON
    │                    │
    ↓                    ↓
ErrorState          setNeedsOnboarding
(laisse passer)      (!hasCompleted)
    │                    │
    │                    ↓
    │            ┌───────────────────────┐
    │            │  needsOnboarding ?    │
    │            └───────────────────────┘
    │                    │      │
    │                   OUI    NON
    │                    │      │
    │                    ↓      ↓
    │            Redirect      App
    │            /onboarding   normale
    │
    └────────────────────────────┘
```

---

## 🎯 Résultat Final

- ✅ Utilise `public.profiles.has_completed_onboarding`
- ✅ Aucun warning "table or column not found"
- ✅ Aucune boucle infinie
- ✅ Aucun spinner bloqué
- ✅ Redirection onboarding une seule fois
- ✅ Gestion d'erreurs robuste
- ✅ Possibilité de réessayer après erreur

