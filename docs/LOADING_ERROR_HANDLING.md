# 🔄 Gestion Loading / Error / Timeout - Écran Initial

## 📋 Problème identifié

L'écran initial affichait un spinner vert indéfiniment si :
- La session Supabase ne se chargeait pas (timeout réseau)
- La vérification onboarding échouait ou prenait trop de temps
- Aucune gestion d'erreur n'était présente

## ✅ Solution implémentée

### 1. **AuthContext** (`porkyfarm-mobile/contexts/AuthContext.tsx`)

**Modifications** :
- ✅ Ajout d'un **timeout de 10 secondes** sur `getSession()`
- ✅ Ajout d'un state `error` pour capturer les erreurs
- ✅ Fonction `retryAuth()` pour réessayer le chargement
- ✅ Logs console pour debug (`[AuthContext]`)

**Logique** :
```typescript
const loadSession = async () => {
  setLoading(true)
  setError(null)
  
  try {
    // Timeout de 10 secondes
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La connexion prend trop de temps')), 10000)
    })

    const sessionPromise = authService.getSession()
    const { data, error } = await Promise.race([sessionPromise, timeoutPromise])

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    // Succès : mettre à jour session/user
    if (data?.session) {
      setSession(data.session)
      setUser(data.session.user)
    }
    setLoading(false)
  } catch (err) {
    // Timeout ou exception
    setError(err)
    setLoading(false)
  }
}
```

**Interface mise à jour** :
```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null        // NOUVEAU
  retryAuth: () => Promise<void>  // NOUVEAU
  signIn: ...
  signUp: ...
  signOut: ...
}
```

---

### 2. **OnboardingGuard** (`porkyfarm-mobile/app/_layout.tsx`)

**Modifications** :
- ✅ Ajout d'un **timeout de 8 secondes** sur `checkOnboardingStatus()`
- ✅ Ajout d'un state `onboardingError` pour capturer les erreurs
- ✅ Affichage `ErrorState` avec bouton "Réessayer"
- ✅ Nettoyage du timeout avec `useRef`
- ✅ Message de chargement avec texte "Chargement..."

**Logique** :
```typescript
const checkOnboarding = async () => {
  setCheckingOnboarding(true)
  setOnboardingError(null)

  try {
    // Timeout de 8 secondes
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject(new Error('Timeout: La vérification prend trop de temps'))
      }, 8000)
    })

    const onboardingPromise = onboardingService.checkOnboardingStatus()
    const { hasCompleted, error } = await Promise.race([
      onboardingPromise,
      timeoutPromise,
    ])

    // Nettoyage timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (error) {
      setOnboardingError(error)
      setNeedsOnboarding(false)
    } else {
      setNeedsOnboarding(!hasCompleted)
    }
  } catch (err) {
    // Timeout ou exception
    setOnboardingError(err)
    setNeedsOnboarding(false)
  } finally {
    setCheckingOnboarding(false)
  }
}
```

**Gestion des états d'affichage** :
1. **Erreur** : `ErrorState` avec message + bouton "Réessayer"
2. **Loading** : Spinner + texte "Chargement..."
3. **Success** : Redirection vers `/onboarding` ou `/(tabs)`

---

## 🔄 Flux complet

```
App démarre
    ↓
AuthProvider charge session (timeout 10s)
    ↓
┌─────────────────────────────────────┐
│  Succès ?                           │
└─────────────────────────────────────┘
    │                    │
   OUI                  NON
    │                    │
    ↓                    ↓
OnboardingGuard      ErrorState
vérifie onboarding   (bouton Réessayer)
(timeout 8s)              │
    │                    │
┌─────────────────────────────────────┐
│  Succès ?                           │
└─────────────────────────────────────┘
    │                    │
   OUI                  NON
    │                    ↓
    ↓              ErrorState
Redirection        (bouton Réessayer)
(onboarding ou tabs)
```

---

## 📁 Fichiers modifiés

### 1. `porkyfarm-mobile/contexts/AuthContext.tsx`

**Changements** :
- Ajout state `error: Error | null`
- Fonction `loadSession()` avec timeout 10s
- Fonction `retryAuth()` exportée
- Logs console pour debug
- Gestion Promise.race pour timeout

**Lignes clés** :
- Ligne 19 : `const [error, setError] = useState<Error | null>(null)`
- Ligne 22-60 : `loadSession()` avec timeout
- Ligne 62 : Export `retryAuth` dans le context

---

### 2. `porkyfarm-mobile/app/_layout.tsx`

**Changements** :
- Ajout state `onboardingError: Error | null`
- Ajout `useRef` pour nettoyer timeout
- Fonction `checkOnboarding()` avec timeout 8s
- Fonction `handleRetry()` pour réessayer
- Affichage conditionnel : ErrorState / Loading / Success

**Lignes clés** :
- Ligne 12 : `const [onboardingError, setOnboardingError] = useState<Error | null>(null)`
- Ligne 13 : `const timeoutRef = useRef<NodeJS.Timeout | null>(null)`
- Ligne 30-70 : `checkOnboarding()` avec timeout
- Ligne 72-76 : `handleRetry()` pour réessayer
- Ligne 78-88 : Affichage ErrorState si erreur
- Ligne 90-98 : Affichage Loading avec texte
- Ligne 100-102 : Redirection si succès

---

## 🧪 Scénarios de test

### Scénario 1 : Chargement normal (succès)
1. App démarre
2. Session Supabase se charge (< 10s)
3. Onboarding vérifié (< 8s)
4. Redirection vers `/onboarding` ou `/(tabs)`
5. ✅ **Résultat** : Pas de spinner bloqué

### Scénario 2 : Timeout session (10s)
1. App démarre
2. Session Supabase ne répond pas
3. Timeout après 10s
4. ✅ **Résultat** : `ErrorState` avec message "Impossible de charger les données" + bouton "Réessayer"

### Scénario 3 : Timeout onboarding (8s)
1. Session chargée avec succès
2. Vérification onboarding ne répond pas
3. Timeout après 8s
4. ✅ **Résultat** : `ErrorState` avec bouton "Réessayer"

### Scénario 4 : Erreur réseau
1. Pas de connexion Internet
2. `getSession()` échoue immédiatement
3. ✅ **Résultat** : `ErrorState` avec message clair + bouton "Réessayer"

### Scénario 5 : Réessayer après erreur
1. Erreur affichée
2. Utilisateur clique "Réessayer"
3. `retryAuth()` ou `checkOnboarding()` relancé
4. ✅ **Résultat** : Nouvelle tentative, spinner affiché pendant le chargement

---

## 🔍 Logs de debug

Tous les erreurs sont loggées dans la console avec des préfixes :
- `[AuthContext]` : Erreurs de chargement de session
- `[OnboardingGuard]` : Erreurs de vérification onboarding

**Exemples** :
```
[AuthContext] Error loading session: Error: Timeout: La connexion prend trop de temps
[OnboardingGuard] Error checking onboarding: Error: PGRST205: Could not find the table...
```

---

## ✅ Garanties

1. **Pas de spinner infini** : `loading` et `checkingOnboarding` passent toujours à `false` en cas d'erreur/timeout
2. **Timeout raisonnable** : 10s pour session, 8s pour onboarding
3. **Feedback utilisateur** : Message clair + bouton actionnable
4. **Possibilité de réessayer** : Bouton "Réessayer" relance le processus
5. **Logs pour debug** : Toutes les erreurs sont loggées dans la console

---

## 🎯 Résultat attendu

L'utilisateur ne verra plus jamais un spinner bloqué. En cas de problème :
- Affichage d'un message d'erreur clair
- Bouton "Réessayer" pour relancer
- Logs dans la console pour debug technique

