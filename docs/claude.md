# 🐷 PORKYFARM — MÉMOIRE PROJET

## 📅 Dernière MAJ: 2026-01-18

## 📊 Résumé Audit (18/01/2026)

### Erreurs TypeScript
- [x] 16 erreurs `primarySurface` manquant → **CORRIGÉ**
- [x] 7 casts `error as Error` dangereux (auth.ts) → **CORRIGÉ**
- [x] Types `any` dans auth.ts → **CORRIGÉ** (User | null)

### Logging
- [x] 44 console.error migrés vers logger → **CORRIGÉ**

### Code Mort - **SUPPRIMÉ**
- [x] `src/` (17 fichiers) → **SUPPRIMÉ**
- [x] `utils/` directory → **SUPPRIMÉ**
- [x] `components/WeatherWidget.tsx` → **SUPPRIMÉ**
- [x] `components/OfflineIndicator.tsx` → **SUPPRIMÉ**

### Composants Dupliqués - **SUPPRIMÉS**
- [x] `components/AlertCard.tsx` → **SUPPRIMÉ** (garder ui/)
- [x] `components/StatCard.tsx` → **SUPPRIMÉ** (garder ui/)
- [x] `components/AnimalAvatar.tsx` → **SUPPRIMÉ** (garder animals/)
- [x] `components/ErrorState.tsx` → **SUPPRIMÉ** (garder ui/)

## ✅ Corrections Appliquées

### 2026-01-18 - Session Audit V7
- [x] `primarySurface` ajouté aux tokens (light: #ECFDF5, dark: #064E3B)
- [x] `lib/utils/errors.ts` créé avec `normalizeError()`, `getErrorMessage()`, `translateSupabaseError()`
- [x] 7 casts corrigés dans `services/auth.ts` avec `normalizeError()`
- [x] Types `any` remplacés par `User | null` dans auth.ts
- [x] Migration `console.error` → `logger` dans 6 services (44 occurrences)
- [x] 4 composants dupliqués supprimés
- [x] Code mort supprimé (src/, utils/, WeatherWidget, OfflineIndicator)
- [x] Imports ErrorState mis à jour (11 fichiers)
- [x] `retryLabel` prop ajouté à ErrorState pour compatibilité
- [x] Import AnimalAvatar corrigé dans AnimalCard.tsx
- [x] **0 erreur TypeScript** ✅

## 📋 Règles à NE PLUS VIOLER

1. **Pas de `any` TypeScript** - Typer tous les props
2. **Pas de couleurs hardcodées** - Utiliser tokens uniquement
3. **Pas de `error as Error`** - Utiliser `normalizeError()`
4. **Pas de `console.error`** - Utiliser `logger.error()`
5. **Pas d'emojis dans l'UI** - Utiliser icônes vectorielles
6. **farm_id partout** - Jamais user_id pour les données métier
7. **Timeout 15s** - Sur tous les chargements de données

## 🗺️ Roadmap

### PRIORITÉ 1 - Critiques ✅ TERMINÉ
- [x] Corriger erreurs TypeScript (0 erreurs)
- [x] Sécuriser les casts d'erreur (normalizeError)

### PRIORITÉ 2 - Important ✅ TERMINÉ
- [x] Supprimer composants dupliqués (4 fichiers)
- [x] Supprimer code mort (src/, utils/, composants inutilisés)
- [x] Migrer console.error → logger (44 occurrences, 6 services)

### PRIORITÉ 3 - Qualité (Prochain Sprint)
- [ ] Emojis → icônes vectorielles (AlertCard, CostItem, AnimalListItem)
- [ ] Couleurs hardcodées → tokens (EmptyState, ErrorBoundary)
- [ ] Validation formulaires complète (register.tsx - toutes erreurs simultanées)

### PRIORITÉ 4 - Cleanup (Maintenance)
- [ ] Factoriser `supabase.auth.getUser()` → `useCurrentUser()`
- [ ] Nettoyer TODO/FIXME restants
- [ ] Supprimer App.tsx racine
- [ ] Supprimer lib/designTokens.ts legacy

## 📁 Structure Validée

```
porkyfarm-mobile/
├── app/              # Expo Router screens (52 fichiers)
├── components/
│   ├── ui/           # Design system (source de vérité)
│   ├── animals/      # Composants animaux
│   ├── feedback/     # Animations feedback
│   └── reproduction/ # Composants reproduction
├── services/         # Logique métier (15 services)
├── lib/
│   ├── theme/        # Tokens + ThemeContext
│   ├── utils/        # Utilitaires (errors, etc.)
│   └── logger.ts     # Logger centralisé
├── hooks/            # Custom hooks (5)
└── contexts/         # React contexts (4)
```

## 🔐 Sécurité Supabase

- RLS activé sur toutes les tables
- 1 policy par table (FOR ALL avec farm_id check)
- Storage bucket 'animals' configuré
- Index performance créés (15 index)

## 📝 Notes Techniques

- **Timeout useData:** 15 secondes
- **Design tokens:** `lib/theme/tokens.ts`
- **Logger:** `lib/logger.ts`
- **Normalisation erreurs:** `lib/utils/errors.ts`
