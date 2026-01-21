# 🔍 AUDIT COMPLET - PORKYFARM MOBILE

**Date:** $(date)  
**Version:** 1.0.0  
**Objectif:** Identifier tous les éléments à corriger ou améliorer

---

## 🔴 PRIORITÉ 1 - CRITIQUE (À corriger immédiatement)

### 1.1 Console.log en production
**Impact:** Performance, sécurité, logs sensibles  
**Fichiers affectés:** 56 occurrences dans `app/`

```typescript
// ❌ PROBLÈME
console.log('[Dashboard] Début du chargement...')
console.error('[AddHealthCase] Error:', error)

// ✅ SOLUTION
// Utiliser un logger conditionnel
if (__DEV__) {
  console.log('[Dashboard] Début du chargement...')
}
// OU utiliser Sentry pour les erreurs
```

**Action:** Créer un logger utilitaire avec niveau de log

---

### 1.2 Types `any` utilisés
**Impact:** Perte de sécurité TypeScript  
**Fichiers affectés:** 17 occurrences

```typescript
// ❌ PROBLÈME
catch (err: any) { ... }
filter((g: any) => g.status === 'en_cours')
router.push(route as any)

// ✅ SOLUTION
catch (err: unknown) {
  const error = err instanceof Error ? err : new Error('Erreur inconnue')
}
filter((g: Gestation) => g.status === 'en_cours')
```

**Action:** Remplacer tous les `any` par des types appropriés

---

### 1.3 Gestion d'erreurs silencieuse
**Impact:** Bugs difficiles à déboguer  
**Fichiers affectés:** `services/healthCases.ts`, `services/animals.ts`

```typescript
// ❌ PROBLÈME
catch (err: unknown) {
  return { data: [], error: null } // Erreur ignorée !
}

// ✅ SOLUTION
catch (err: unknown) {
  const error = err instanceof Error ? err : new Error('Erreur inconnue')
  console.error('[Service] Error:', error)
  return { data: [], error }
}
```

**Action:** Toujours retourner l'erreur, jamais `null`

---

### 1.4 Variables d'environnement non validées
**Impact:** Crash silencieux en production  
**Fichier:** `services/supabase/client.ts`

```typescript
// ❌ PROBLÈME
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || ''

// ✅ SOLUTION
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables Supabase manquantes. Vérifiez eas.json')
}
```

**Action:** Valider les variables d'environnement au démarrage

---

## ⚠️ PRIORITÉ 2 - MAJEUR (À corriger rapidement)

### 2.1 Duplication de code dans les services
**Impact:** Maintenance difficile, bugs répétés  
**Fichiers:** Tous les services suivent le même pattern

**Pattern répété:**
```typescript
// Répété dans: animals.ts, healthCases.ts, gestations.ts, costs.ts, etc.
try {
  const targetFarmId = farmId || await getCurrentFarmId()
  if (!targetFarmId) {
    return { data: [], error: new Error('Aucune ferme trouvée') }
  }
  return safeSupabaseQuery<T[]>(...)
} catch (err) {
  console.error('[Service] Error:', err)
  return { data: [], error: err instanceof Error ? err : new Error('Erreur inconnue') }
}
```

**Solution:** Créer un helper `withFarmId<T>()` pour factoriser

---

### 2.2 Imports relatifs longs
**Impact:** Lisibilité, maintenance  
**Fichiers:** Tous les écrans dans `app/(tabs)/`

```typescript
// ❌ PROBLÈME
import { animalsService } from '../../../services/animals'
import { colors } from '../../../lib/designTokens'

// ✅ SOLUTION (avec tsconfig paths)
import { animalsService } from '@/services/animals'
import { colors } from '@/lib/designTokens'
```

**Action:** Utiliser les paths `@/*` déjà configurés dans tsconfig.json

---

### 2.3 TODO non résolus
**Impact:** Fonctionnalités incomplètes  
**Fichiers:**
- `app/(tabs)/health/index.tsx:130` - Écran détail health/[id]
- `app/(tabs)/reproduction/index.tsx:137` - Écran détail reproduction/[id]
- `components/WeatherWidget.tsx:85` - Géolocalisation native

**Action:** Implémenter ou supprimer les TODOs

---

### 2.4 Fichiers de debug en production
**Impact:** Sécurité, performance  
**Fichier:** `app/debug/supabase-test.tsx`

**Action:** 
- Supprimer en production
- OU conditionner avec `__DEV__`
- OU créer un build séparé pour dev

---

### 2.5 Pas de tests
**Impact:** Pas de garantie de qualité  
**Fichiers:** Aucun fichier `.test.ts` ou `.spec.ts`

**Action:** Ajouter des tests unitaires pour :
- Services (animals, healthCases, gestations)
- Hooks (useData, useFocusRefresh)
- Utilitaires (dateUtils, animalHelpers)

---

## 📊 PRIORITÉ 3 - AMÉLIORATION (À planifier)

### 3.1 Structure de fichiers
**Problème:** Mélange ancienne/nouvelle structure  
**Solution:** Finaliser la migration vers `src/`

**État actuel:**
```
✅ src/ créé (structure moderne)
⚠️ Anciens fichiers toujours utilisés (services/, hooks/, components/)
```

**Action:** Migrer progressivement vers `src/`

---

### 3.2 Gestion d'état
**Problème:** Multiple contexts (AuthContext, RefreshContext, ThemeContext, ToastContext)  
**Solution:** Considérer un state manager (Zustand, Redux Toolkit)

**Fichiers:** `contexts/*.tsx`

---

### 3.3 Performance
**Problèmes identifiés:**
- Pas de memoization des composants lourds
- Re-renders inutiles
- Pas de lazy loading des écrans

**Action:** 
- Ajouter `React.memo()` sur les composants lourds
- Utiliser `useMemo()` pour les calculs coûteux
- Lazy load les écrans avec `React.lazy()`

---

### 3.4 Accessibilité
**Problème:** Pas de labels accessibilité  
**Action:** Ajouter `accessibilityLabel` sur tous les éléments interactifs

---

### 3.5 Internationalisation
**Problème:** Textes en dur en français  
**Action:** Préparer la structure i18n (react-i18next)

---

### 3.6 Documentation
**Problème:** Pas de JSDoc sur les fonctions publiques  
**Action:** Ajouter JSDoc sur :
- Services
- Hooks
- Composants UI

---

## 🔧 AMÉLIORATIONS TECHNIQUES

### 4.1 Configuration ESLint
**Problème:** Pas de fichier `.eslintrc.js`  
**Action:** Créer configuration ESLint avec règles strictes

---

### 4.2 Prettier
**Problème:** Pas de configuration Prettier  
**Action:** Ajouter `.prettierrc` pour formatage automatique

---

### 4.3 Git Hooks
**Problème:** Pas de pre-commit hooks  
**Action:** Ajouter Husky pour :
- Lint automatique
- Format automatique
- Tests avant commit

---

### 4.4 Variables d'environnement
**Problème:** Pas de `.env.example`  
**Action:** Créer `.env.example` avec toutes les variables nécessaires

---

### 4.5 Scripts package.json
**Problème:** Scripts limités  
**Action:** Ajouter :
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## 📋 CHECKLIST DE CORRECTION

### Phase 1: Critiques (Cette semaine)
- [ ] Créer logger utilitaire et remplacer console.log
- [ ] Remplacer tous les `any` par des types appropriés
- [ ] Corriger gestion d'erreurs silencieuses
- [ ] Valider variables d'environnement au démarrage

### Phase 2: Majeurs (Cette semaine)
- [ ] Factoriser duplication dans services
- [ ] Utiliser paths `@/*` dans tous les imports
- [ ] Résoudre ou supprimer TODOs
- [ ] Supprimer/conditionner fichiers debug

### Phase 3: Améliorations (Ce mois)
- [ ] Finaliser migration vers `src/`
- [ ] Ajouter tests unitaires (minimum 50% coverage)
- [ ] Optimiser performance (memoization, lazy loading)
- [ ] Ajouter ESLint + Prettier
- [ ] Créer `.env.example`

### Phase 4: Long terme
- [ ] Internationalisation (i18n)
- [ ] Accessibilité complète
- [ ] Documentation JSDoc
- [ ] Git hooks (Husky)

---

## 📊 STATISTIQUES

| Catégorie | Nombre | Priorité |
|-----------|--------|----------|
| Console.log | 56 | 🔴 P1 |
| Types `any` | 17 | 🔴 P1 |
| Erreurs silencieuses | 8 | 🔴 P1 |
| TODOs | 3 | ⚠️ P2 |
| Duplications | 5+ | ⚠️ P2 |
| Tests manquants | 100% | 📊 P3 |
| ESLint config | 0 | 📊 P3 |

---

## 🎯 RECOMMANDATIONS PRIORITAIRES

1. **Créer un logger utilitaire** (30 min)
2. **Remplacer les `any`** (2h)
3. **Factoriser les services** (3h)
4. **Ajouter ESLint** (1h)
5. **Créer `.env.example`** (15 min)

**Temps estimé total P1+P2:** ~7h

---

## 📝 NOTES

- L'app fonctionne actuellement ✅
- Les problèmes identifiés ne cassent pas l'app
- Migration peut se faire progressivement
- Prioriser selon l'impact utilisateur

