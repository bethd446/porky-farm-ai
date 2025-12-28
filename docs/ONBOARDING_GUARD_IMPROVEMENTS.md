# 🔒 Renforcement OnboardingGuard & onboardingService

## 📋 Résumé des améliorations

### 1. **OnboardingGuard** (`app/_layout.tsx`)

#### Protection contre appels multiples
- ✅ `isCheckingRef` : Empêche les appels parallèles à `checkOnboarding()`
- ✅ `hasTriedOnboardingCheck` : Flag pour éviter les boucles infinies
- ✅ Mémoïsation avec `useCallback` pour éviter les re-créations

#### Gestion des états
- ✅ Nettoyage timeout au unmount
- ✅ Conditions strictes pour redirection : `needsOnboarding && user && !onboardingError && !authError`
- ✅ Logs console détaillés (`[OnboardingGuard]`)

#### Flux de vérification
```typescript
// Ne vérifie que si :
// - Auth n'est plus en chargement
// - User est défini
// - On n'a pas déjà essayé (ou on réessaie après erreur)
if (!authLoading && user && !hasTriedOnboardingCheck) {
  checkOnboarding()
}
```

---

### 2. **onboardingService.checkOnboardingStatus()**

#### Gestion robuste des erreurs Supabase

**Codes d'erreur gérés** :
- `PGRST116` : No rows returned → Profil n'existe pas → `hasCompleted: false, error: null`
- `PGRST205` : Table not found → Schéma pas migré → `hasCompleted: false, error: null`
- Erreurs réseau : Détectées via message → `error: new Error('Erreur réseau...')`
- Autres erreurs Supabase : Retournées telles quelles

**Format de retour stable** :
```typescript
{ hasCompleted: boolean; error: Error | null }
```

**Logs console** :
- `[onboardingService]` : Tous les cas loggés (succès, erreurs, exceptions)

---

## 🧪 Scénarios de test

### Scénario 1 : Nouvel utilisateur (pas d'onboarding)
1. ✅ Inscription → Connexion
2. ✅ `checkOnboardingStatus()` retourne `{ hasCompleted: false, error: null }`
3. ✅ `needsOnboarding = true`
4. ✅ Redirection vers `/onboarding`
5. ✅ Pas de spinner infini

### Scénario 2 : Utilisateur déjà onboardé
1. ✅ Connexion utilisateur existant
2. ✅ `checkOnboardingStatus()` retourne `{ hasCompleted: true, error: null }`
3. ✅ `needsOnboarding = false`
4. ✅ Pas de redirection → Accès direct à `(tabs)`
5. ✅ Pas de spinner infini

### Scénario 3 : Erreur réseau (Supabase inaccessible)
1. ✅ Désactiver WiFi/Données
2. ✅ `checkOnboardingStatus()` timeout ou erreur réseau
3. ✅ `onboardingError` défini
4. ✅ Affichage `ErrorState` avec bouton "Réessayer"
5. ✅ Pas de spinner infini
6. ✅ Clic "Réessayer" → Relance `checkOnboarding()`

### Scénario 4 : Table/colonne manquante (PGRST205)
1. ✅ Simuler colonne `has_completed_onboarding` absente
2. ✅ `checkOnboardingStatus()` retourne `{ hasCompleted: false, error: null }`
3. ✅ `needsOnboarding = true`
4. ✅ Redirection vers `/onboarding` (comportement gracieux)

### Scénario 5 : Utilisateur non connecté
1. ✅ Pas de session Supabase
2. ✅ `checkOnboardingStatus()` retourne `{ hasCompleted: false, error: new Error('Non authentifié') }`
3. ✅ Pas de vérification onboarding déclenchée
4. ✅ Affichage écrans `(auth)` sans warning

### Scénario 6 : Protection appels multiples
1. ✅ `user` change rapidement plusieurs fois
2. ✅ `isCheckingRef` empêche appels parallèles
3. ✅ Un seul `checkOnboarding()` exécuté
4. ✅ Pas de race condition

---

## 📁 Fichiers modifiés

### 1. `porkyfarm-mobile/app/_layout.tsx`

**Changements clés** :
- Ligne 15 : `timeoutRef` avec type React Native (`ReturnType<typeof setTimeout>`)
- Ligne 16 : `isCheckingRef` pour protection appels multiples
- Ligne 17 : `hasTriedOnboardingCheck` pour éviter boucles
- Ligne 19-30 : `checkOnboarding()` mémoïsé avec `useCallback`
- Ligne 32-35 : Protection contre appels multiples
- Ligne 36-60 : Gestion timeout + nettoyage
- Ligne 62-75 : Effect avec conditions strictes
- Ligne 77-82 : Nettoyage timeout au unmount
- Ligne 84-95 : `handleRetry()` avec reset flags
- Ligne 97-107 : Affichage ErrorState
- Ligne 109-117 : Affichage Loading
- Ligne 119-122 : Redirection avec conditions strictes

### 2. `porkyfarm-mobile/services/onboarding.ts`

**Changements clés** :
- Ligne 29-90 : `checkOnboardingStatus()` complètement réécrit
- Ligne 35-40 : Vérification auth avec gestion erreur
- Ligne 42-75 : Gestion robuste erreurs Supabase
  - PGRST116 : Profil inexistant → `error: null`
  - PGRST205 : Table absente → `error: null`
  - Erreurs réseau : Détection + message clair
  - Autres erreurs : Retournées telles quelles
- Ligne 77-80 : Format retour stable
- Logs console à chaque étape

---

## ✅ Garanties

1. **Pas de spinner infini** :
   - `checkingOnboarding` passe toujours à `false` dans `finally`
   - Timeout nettoyé dans tous les cas
   - `hasTriedOnboardingCheck` empêche les boucles

2. **Pas d'appels multiples** :
   - `isCheckingRef` protège contre race conditions
   - `useCallback` évite re-créations inutiles

3. **Gestion d'erreurs robuste** :
   - Toutes les erreurs Supabase catchées
   - Format de retour stable
   - Logs pour debug

4. **Redirection sécurisée** :
   - Conditions strictes : `needsOnboarding && user && !onboardingError && !authError`
   - Pas de redirection intempestive

---

## 🔍 Logs de debug

Tous les logs sont préfixés pour faciliter le debug :

- `[OnboardingGuard]` : Logs du guard (début check, erreurs, redirections)
- `[onboardingService]` : Logs du service (requêtes, erreurs Supabase, résultats)

**Exemples** :
```
[OnboardingGuard] checkOnboarding déjà en cours, ignoré
[onboardingService] Profile not found, considering onboarding not completed
[OnboardingGuard] Onboarding status: not completed
[OnboardingGuard] Retry onboarding check
```

---

## 🎯 Résultat attendu

- ✅ Aucun warning Expo Router
- ✅ Pas de spinner infini
- ✅ Onboarding déclenché uniquement quand nécessaire
- ✅ Gestion d'erreurs gracieuse
- ✅ Possibilité de réessayer après erreur
- ✅ Logs clairs pour debug

