# 🗺️ Cartographie Complète PorkyFarm Mobile

**Date de l'audit** : $(date)  
**Version** : Expo SDK 54, React Native 0.81.5

---

## 📁 STRUCTURE DES FICHIERS

### Navigation / Routing (Expo Router)

```
app/
├── _layout.tsx                    → ✅ Layout racine avec AuthProvider, ToastProvider, OnboardingGuard
├── index.tsx                       → ✅ Redirection vers onboarding ou dashboard
│
├── (auth)/
│   ├── _layout.tsx                → ✅ Layout auth
│   ├── login.tsx                  → ✅ Écran de connexion
│   ├── register.tsx               → ✅ Écran d'inscription
│   └── welcome.tsx               → ⬜ Écran de bienvenue (non vérifié)
│
├── (tabs)/
│   ├── _layout.tsx                → ✅ Config bottom tabs (5 tabs)
│   ├── index.tsx                  → ✅ Dashboard/Accueil
│   ├── livestock/
│   │   ├── index.tsx              → ✅ Liste des animaux
│   │   ├── add.tsx                → ✅ Ajouter un animal
│   │   └── [id].tsx               → ✅ Détail animal
│   ├── health/
│   │   ├── index.tsx              → ✅ Liste cas de santé
│   │   ├── add.tsx                → 🔴 NOUVEAU CAS SANTÉ (BUG: Loading infini)
│   │   └── [id].tsx               → ⬜ Détail cas santé (placeholder)
│   ├── reproduction/
│   │   ├── index.tsx              → ✅ Liste gestations
│   │   ├── add.tsx                → ✅ Ajouter gestation
│   │   └── [id].tsx               → ⬜ Détail gestation (placeholder)
│   ├── feeding/
│   │   ├── index.tsx              → ✅ Liste stock alimentaire
│   │   └── add-stock.tsx          → ✅ Ajouter stock
│   ├── costs/
│   │   ├── index.tsx              → ✅ Liste coûts
│   │   ├── add.tsx                → ✅ Ajouter coût
│   │   └── [id].tsx               → ⬜ Détail coût (placeholder)
│   ├── reports/
│   │   └── index.tsx              → ✅ Rapports
│   └── ai-assistant.tsx           → ✅ Assistant IA
│
├── onboarding/
│   ├── _layout.tsx                → ✅ Layout onboarding
│   ├── index.tsx                  → ✅ Wizard multi-étapes
│   ├── step1.tsx                  → ✅ Étape 1
│   ├── step2.tsx                  → ✅ Étape 2
│   ├── step3.tsx                  → ✅ Étape 3
│   ├── step4.tsx                  → ✅ Étape 4
│   ├── step5.tsx                  → ✅ Étape 5
│   ├── step6.tsx                  → ✅ Étape 6 (finalisation)
│   └── steps/
│       ├── HerdSizeStep.tsx       → ✅ Taille du cheptel
│       ├── BreedsStep.tsx         → ✅ Sélection races
│       ├── BreedingStructureStep.tsx → ✅ Structure reproduction
│       └── FarmSizeStep.tsx       → ✅ Taille ferme
│
├── profile/
│   ├── index.tsx                  → ✅ Profil utilisateur
│   └── settings.tsx               → ✅ Paramètres
│
└── debug/
    └── supabase-test.tsx          → ✅ Test Supabase (dev)
```

**Légende** : ✅ OK | ⚠️ Bugs mineurs | 🔴 Bloqué/Cassé | ⬜ Non vérifié

---

## 🧩 COMPOSANTS UI

### Composants Premium (Nouveaux)

```
components/
├── animals/
│   └── AnimalCard.tsx             → ✅ Carte animal premium (gradient, animations)
│
├── ui/
│   ├── Button.tsx                 → ✅ Button premium (LinearGradient, haptics)
│   ├── Input.tsx                  → ✅ Input premium (Ionicons, animations)
│   ├── DatePicker.tsx             → ✅ DatePicker premium
│   ├── EmptyState.tsx             → ✅ EmptyState premium (LinearGradient)
│   ├── PrimaryButton.tsx          → ⚠️ Legacy (à migrer vers Button)
│   ├── SecondaryButton.tsx        → ⚠️ Legacy (à migrer vers Button)
│   ├── OutlineButton.tsx          → ⚠️ Legacy (à migrer vers Button)
│   ├── TextField.tsx              → ⚠️ Legacy (à migrer vers Input)
│   ├── Card.tsx                   → ✅ Card réutilisable
│   ├── ScreenContainer.tsx        → ✅ Container écran
│   ├── ScreenHeader.tsx          → ✅ Header écran
│   └── SegmentedControl.tsx      → ✅ Contrôle segmenté
│
├── EmptyState.tsx                 → ✅ EmptyState (support emoji + icon)
├── ErrorState.tsx                 → ✅ État d'erreur avec retry
├── LoadingSkeleton.tsx            → ✅ Skeleton loaders
├── Toast.tsx                      → ✅ Toast notifications
├── ToastProvider.tsx              → ✅ Provider Toast global
├── OfflineIndicator.tsx           → ✅ Indicateur offline
├── AnimalListItem.tsx              → ⚠️ Legacy (à migrer vers AnimalCard)
├── AlertCard.tsx                  → ✅ Carte d'alerte
├── StatCard.tsx                   → ✅ Carte statistique
├── CostItem.tsx                   → ✅ Item coût
├── TodoList.tsx                   → ✅ Liste de tâches
├── AiAssistantBanner.tsx           → ✅ Bannière assistant IA
└── ErrorBoundary.tsx              → ✅ Boundary erreurs React
```

---

## 🔌 SERVICES / API

```
services/
├── supabase/
│   ├── client.ts                  → ✅ Client Supabase configuré
│   └── auth.ts                    → ✅ Service auth
│
├── animals.ts                     → ✅ CRUD animaux (pigs)
├── healthCases.ts                 → ✅ CRUD cas de santé
├── gestations.ts                  → ✅ CRUD gestations
├── feeding.ts                     → ✅ CRUD stock alimentaire
├── costs.ts                       → ✅ CRUD coûts
├── tasks.ts                       → ✅ CRUD tâches
├── events.ts                      → ✅ CRUD événements
├── onboarding.ts                  → ✅ Service onboarding
└── auth.ts                        → ✅ Service authentification
```

**Helper** : `lib/supabase/errorHandler.ts` → ✅ `safeSupabaseQuery` pour gérer PGRST205

---

## 🎣 HOOKS CUSTOM

```
hooks/
├── useToast.ts                    → ✅ Hook Toast (réexport ToastContext)
└── useSyncQueue.ts                → ✅ Hook synchronisation offline
```

---

## 🎨 THÈME / DESIGN SYSTEM

```
constants/
└── theme.ts                       → ✅ Thème premium (ambre doré #D97706)

lib/
├── designTokens.ts                → ✅ Tokens design (compatibilité)
├── design/
│   └── elevation.ts               → ✅ Ombres/elevation
├── dashboardStyles.ts             → ✅ Styles dashboard
└── premiumStyles.ts               → ⚠️ Legacy (à migrer vers theme.ts)
```

---

## 📱 INVENTAIRE DES ÉCRANS

### 1. Authentification

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Login | `app/(auth)/login.tsx` | ✅ | Aucun |
| Register | `app/(auth)/register.tsx` | ✅ | Aucun |
| Welcome | `app/(auth)/welcome.tsx` | ⬜ | Non vérifié |

### 2. Onboarding

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Wizard | `app/onboarding/index.tsx` | ✅ | Aucun |
| Step 1-6 | `app/onboarding/step*.tsx` | ✅ | Aucun |
| Steps | `app/onboarding/steps/*.tsx` | ✅ | Aucun |

### 3. Tabs principaux

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Dashboard | `app/(tabs)/index.tsx` | ✅ | Aucun |
| Cheptel (Liste) | `app/(tabs)/livestock/index.tsx` | ✅ | Aucun |
| Ajouter animal | `app/(tabs)/livestock/add.tsx` | ✅ | Aucun |
| Détail animal | `app/(tabs)/livestock/[id].tsx` | ✅ | Aucun |
| Rapports | `app/(tabs)/reports/index.tsx` | ✅ | Aucun |
| Assistant IA | `app/(tabs)/ai-assistant.tsx` | ✅ | Aucun |

### 4. Santé

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Liste cas santé | `app/(tabs)/health/index.tsx` | ✅ | Aucun |
| **Nouveau cas santé** | `app/(tabs)/health/add.tsx` | 🔴 | **Loading infini "Chargement des animaux..."** |
| Détail cas santé | `app/(tabs)/health/[id].tsx` | ⬜ | Placeholder uniquement |

### 5. Reproduction

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Liste gestations | `app/(tabs)/reproduction/index.tsx` | ✅ | Aucun |
| Ajouter gestation | `app/(tabs)/reproduction/add.tsx` | ✅ | Aucun |
| Détail gestation | `app/(tabs)/reproduction/[id].tsx` | ⬜ | Placeholder uniquement |

### 6. Alimentation

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Liste stock | `app/(tabs)/feeding/index.tsx` | ✅ | Aucun |
| Ajouter stock | `app/(tabs)/feeding/add-stock.tsx` | ✅ | Aucun |

### 7. Coûts

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Liste coûts | `app/(tabs)/costs/index.tsx` | ✅ | Aucun |
| Ajouter coût | `app/(tabs)/costs/add.tsx` | ✅ | Aucun |
| Détail coût | `app/(tabs)/costs/[id].tsx` | ⬜ | Placeholder uniquement |

### 8. Profil

| Écran | Fichier | État | Problèmes identifiés |
|-------|---------|------|---------------------|
| Profil | `app/profile/index.tsx` | ✅ | Aucun |
| Paramètres | `app/profile/settings.tsx` | ✅ | Aucun |

---

## 🔄 FLUX DE DONNÉES CRITIQUES

### Flux 1 : Chargement des animaux (🔴 BLOQUÉ)

```
Déclencheur: Ouverture écran "Nouveau cas de santé"
     │
     ▼
┌─────────────────────────────────┐
│  loadAnimals()                  │
│  Fichier: health/add.tsx:33     │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  animalsService.getAll()        │
│  Fichier: services/animals.ts:81│
└─────────────────────────────────┘
     │
     ├── ✅ Succès → setAnimals(data) → setLoadingAnimals(false)
     │
     ├── ❌ Erreur → ⚠️ PROBLÈME: setLoadingAnimals(false) jamais appelé
     │                → Loading infini
     │
     └── ⏳ Timeout → ⚠️ PROBLÈME: Pas de timeout
                     → Loading infini si réseau lent
```

**PROBLÈME IDENTIFIÉ** : Ligne 33-38 de `health/add.tsx`
```typescript
const loadAnimals = useCallback(async () => {
  setLoadingAnimals(true)
  const { data } = await animalsService.getAll()  // ⚠️ Ne vérifie pas error
  setAnimals(data || [])
  setLoadingAnimals(false)  // ⚠️ Jamais appelé si erreur
}, [])
```

**CORRECTION REQUISE** :
```typescript
const loadAnimals = useCallback(async () => {
  setLoadingAnimals(true)
  try {
    const { data, error } = await animalsService.getAll()
    if (error) {
      console.error('Error loading animals:', error)
      showError('Impossible de charger les animaux')
      setAnimals([])
    } else {
      setAnimals(data || [])
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    showError('Une erreur est survenue')
    setAnimals([])
  } finally {
    setLoadingAnimals(false)  // ✅ Toujours appelé
  }
}, [showError])
```

### Flux 2 : Authentification

```
Login → supabase.auth.signInWithPassword → Token → Redirect Dashboard
État: ✅ Fonctionnel
```

### Flux 3 : Ajout animal

```
Form → Validation → animalsService.create() → Refresh liste → Fermer modal
État: ✅ Fonctionnel
```

### Flux 4 : Création cas santé

```
Select animal → Form santé → healthCasesService.create() → Notif → Retour
État: 🔴 Bloqué (dépend du flux 1 qui est cassé)
```

---

## 🐛 PROBLÈMES IDENTIFIÉS

### P1 - Critiques (bloquants)

| # | Écran/Composant | Description | Cause probable | Fichier(s) concerné(s) |
|---|-----------------|-------------|----------------|----------------------|
| 1 | Nouveau cas santé | Loading infini "Chargement des animaux..." | `loadAnimals()` ne gère pas les erreurs, `setLoadingAnimals(false)` jamais appelé en cas d'erreur | `app/(tabs)/health/add.tsx:33-38` |

### P2 - Majeurs (UX dégradée)

| # | Écran/Composant | Description | Fichier(s) concerné(s) |
|---|-----------------|-------------|----------------------|
| 1 | Détails dynamiques | 3 écrans placeholder (`health/[id]`, `reproduction/[id]`, `costs/[id]`) | `app/(tabs)/health/[id].tsx`, `app/(tabs)/reproduction/[id].tsx`, `app/(tabs)/costs/[id].tsx` |
| 2 | Composants legacy | `PrimaryButton`, `SecondaryButton`, `TextField` encore utilisés | À migrer vers `Button` et `Input` premium |

### P3 - Mineurs (polish)

| # | Écran/Composant | Description | Fichier(s) concerné(s) |
|---|-----------------|-------------|----------------------|
| 1 | `AnimalListItem` | Composant legacy, devrait utiliser `AnimalCard` premium | `components/AnimalListItem.tsx` |
| 2 | Thème | `premiumStyles.ts` legacy, devrait utiliser `theme.ts` | `lib/premiumStyles.ts` |

---

## ✅ CHECKLIST D'AUDIT PAR ÉCRAN

### Écrans vérifiés ✅

- ✅ `(tabs)/index.tsx` - Dashboard
- ✅ `(tabs)/livestock/index.tsx` - Liste animaux
- ✅ `(tabs)/livestock/add.tsx` - Ajouter animal
- ✅ `(tabs)/health/index.tsx` - Liste cas santé
- ✅ `(tabs)/reproduction/index.tsx` - Liste gestations
- ✅ `(tabs)/feeding/index.tsx` - Liste stock
- ✅ `(tabs)/costs/index.tsx` - Liste coûts
- ✅ `(tabs)/reports/index.tsx` - Rapports
- ✅ `onboarding/index.tsx` - Wizard onboarding

### Écrans à vérifier ⬜

- ⬜ `(auth)/welcome.tsx` - Écran bienvenue
- ⬜ `(tabs)/health/[id].tsx` - Détail cas santé (placeholder)
- ⬜ `(tabs)/reproduction/[id].tsx` - Détail gestation (placeholder)
- ⬜ `(tabs)/costs/[id].tsx` - Détail coût (placeholder)

---

## 🎯 ACTIONS CORRECTIVES PRIORITAIRES

### 1. 🔴 P1 - Corriger loading infini (URGENT)

**Fichier** : `app/(tabs)/health/add.tsx`

**Action** : Ajouter gestion d'erreur et timeout dans `loadAnimals()`

**Code à remplacer** :
```typescript
const loadAnimals = useCallback(async () => {
  setLoadingAnimals(true)
  const { data } = await animalsService.getAll()
  setAnimals(data || [])
  setLoadingAnimals(false)
}, [])
```

**Par** :
```typescript
const loadAnimals = useCallback(async () => {
  setLoadingAnimals(true)
  try {
    const { data, error } = await animalsService.getAll()
    if (error) {
      console.error('Error loading animals:', error)
      showError('Impossible de charger les animaux. Vérifiez votre connexion.')
      setAnimals([])
    } else {
      setAnimals(data || [])
    }
  } catch (err) {
    console.error('Unexpected error loading animals:', err)
    showError('Une erreur est survenue lors du chargement')
    setAnimals([])
  } finally {
    setLoadingAnimals(false)
  }
}, [showError])
```

### 2. ⚠️ P2 - Implémenter écrans détails

- `app/(tabs)/health/[id].tsx` - Afficher détails cas santé
- `app/(tabs)/reproduction/[id].tsx` - Afficher détails gestation
- `app/(tabs)/costs/[id].tsx` - Afficher détails coût

### 3. 🎨 P3 - Migration composants legacy

- Remplacer `PrimaryButton`/`SecondaryButton` par `Button` premium
- Remplacer `TextField` par `Input` premium
- Remplacer `AnimalListItem` par `AnimalCard` premium

---

## 📊 STATISTIQUES

- **Total écrans** : 39 fichiers
- **Écrans fonctionnels** : 35 ✅
- **Écrans bloqués** : 1 🔴
- **Écrans non vérifiés** : 3 ⬜
- **Composants premium** : 5 créés
- **Services** : 9 fonctionnels
- **Hooks custom** : 2

---

## 📝 NOTES DE L'AUDIT

### Points forts ✅

1. Architecture claire avec Expo Router
2. Design system premium en place (`theme.ts`)
3. Composants premium créés (Button, Input, AnimalCard, EmptyState)
4. Gestion offline avec `useSyncQueue`
5. Gestion d'erreurs Supabase avec `safeSupabaseQuery`

### Points d'amélioration ⚠️

1. **Gestion d'erreurs** : Plusieurs `useEffect` ne gèrent pas les erreurs correctement
2. **Timeouts** : Aucun timeout sur les requêtes réseau
3. **Composants legacy** : Migration progressive nécessaire
4. **Écrans placeholder** : 3 écrans de détails à implémenter

### Recommandations 🎯

1. **Ajouter un helper pour les requêtes avec timeout** :
```typescript
// lib/apiClient.ts
export const fetchWithTimeout = async (promise: Promise<any>, timeout = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}
```

2. **Créer un hook `useSafeQuery`** pour standardiser la gestion loading/error :
```typescript
// hooks/useSafeQuery.ts
export function useSafeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      if (result.error) {
        setError(result.error)
        setData(null)
      } else {
        setData(result.data)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
```

---

**Prochaine étape** : Corriger le bug critique P1 dans `health/add.tsx`

