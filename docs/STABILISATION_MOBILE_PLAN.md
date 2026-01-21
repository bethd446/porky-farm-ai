# 📋 PLAN DE STABILISATION & POLISH - PorkyFarm Mobile

**Date :** 28 Décembre 2024  
**Objectif :** Stabiliser à 100% et polir visuellement pour beta utilisateur sérieuse

---

## 🔍 AUDIT INITIAL

### Services - État Actuel

#### ✅ **healthCases.ts** - Aligné
- Table : `health_records` ✅
- Colonnes : `pig_id`, `title`, `severity`, `status`, `start_date` ✅
- Jointures : `pigs:pig_id` pour `pig_name`, `pig_identifier` ✅

#### ✅ **gestations.ts** - Aligné
- Table : `gestations` ✅
- Colonnes : `sow_id`, `boar_id`, `mating_date`, `expected_farrowing_date`, `status` ✅
- Calcul automatique : `expected_farrowing_date = mating_date + 114 jours` ✅
- Jointures : `sow:pigs!gestations_sow_id_fkey`, `boar:pigs!gestations_boar_id_fkey` ✅

#### ✅ **feeding.ts** - Aligné
- Table : `feed_stock` ✅
- Colonnes : `feed_type`, `quantity_kg`, `unit_price`, `supplier`, `purchase_date`, `expiry_date` ✅

#### ✅ **costs.ts** - Aligné
- Table : `transactions` ✅
- Colonnes : `type` (income/expense), `category`, `amount`, `transaction_date`, `description` ✅
- Méthodes : `getAll`, `getByPeriod`, `create`, `update`, `delete`, `getSummary` ✅

#### ⚠️ **animals.ts** - DÉCALAGE SCHÉMA
- **Schéma SQL** : `identifier`, `category`
- **Service mobile** : `tag_number`, `sex`
- **Action** : Vérifier le schéma réel Supabase et aligner

### Écrans - État Actuel

#### ✅ **health/index.tsx** - Fonctionnel mais à polir
- Liste des cas ✅
- Styles hardcodés ⚠️
- Pas de LoadingSkeleton ⚠️
- EmptyState basique ⚠️
- Pas de Toast ⚠️

#### ✅ **health/add.tsx** - Fonctionnel mais à polir
- Formulaire complet ✅
- Support offline ✅
- Styles hardcodés ⚠️
- Alert au lieu de Toast ⚠️

#### ✅ **reproduction/index.tsx** - Fonctionnel mais à polir
- Liste des gestations ✅
- Styles hardcodés ⚠️
- Pas de LoadingSkeleton ⚠️
- EmptyState basique ⚠️

#### ✅ **reproduction/add.tsx** - Fonctionnel mais à polir
- Formulaire complet ✅
- Calcul automatique date mise-bas ✅
- Styles hardcodés ⚠️
- Alert au lieu de Toast ⚠️

#### ✅ **feeding/index.tsx** - Fonctionnel mais à polir
- Liste du stock ✅
- Calculateur de ration ✅
- Styles hardcodés ⚠️
- Pas d'alerte stock faible ⚠️

#### ✅ **costs/index.tsx** - Déjà bien fait
- Liste avec filtres ✅
- Résumé financier ✅
- LoadingSkeleton ✅
- EmptyState ✅
- Styles avec designTokens ✅

#### ⚠️ **Dashboard (index.tsx)** - À améliorer
- Stats de base ✅
- Pas de section finances ⚠️
- Styles partiellement hardcodés ⚠️

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### Phase 1 : Composants & Infrastructure (Priorité 1)

1. **Créer ToastProvider global** ✅
   - Composant `Toast.tsx` ✅
   - Hook `useToast.ts` ✅
   - Provider à intégrer dans `_layout.tsx`

2. **Créer composant OfflineIndicator**
   - Badge/bannière simple
   - Utiliser `useSyncQueue` pour état réseau

3. **Vérifier alignement schéma `pigs`**
   - Confirmer colonnes réelles (identifier vs tag_number, category vs sex)
   - Aligner service si nécessaire

### Phase 2 : Unification Styles (Priorité 2)

4. **Remplacer styles hardcodés dans :**
   - `health/index.tsx` et `health/add.tsx`
   - `reproduction/index.tsx` et `reproduction/add.tsx`
   - `feeding/index.tsx` et `feeding/add-stock.tsx`
   - `dashboard/index.tsx`

5. **Standardiser :**
   - Couleurs → `colors.*`
   - Espacements → `spacing.*`
   - Typographie → `typography.*`
   - Radius → `radius.*`
   - Shadows → `shadows.*`

### Phase 3 : Feedback Utilisateur (Priorité 2)

6. **Ajouter Toasts partout :**
   - Succès après création/modification
   - Erreur avec message clair
   - Info pour actions importantes

7. **Améliorer LoadingSkeleton :**
   - Remplacer `ActivityIndicator` par `LoadingSkeleton` dans listes
   - Créer `HealthCaseSkeleton`, `GestationSkeleton`, etc.

8. **Améliorer EmptyState :**
   - Utiliser composant `EmptyState` partout
   - Messages pédagogiques en français
   - CTA clairs

### Phase 4 : Features Manquantes (Priorité 3)

9. **Section Finances au Dashboard :**
   - 3 KPIs : Revenus, Dépenses, Balance
   - Icônes Lucide
   - Clic → navigation vers `costs/index`

10. **Alertes Stock Faible :**
    - Badge "Stock faible" si `quantity_kg < seuil`
    - Seuil configurable (ex: 50kg)

11. **Améliorer Navigation :**
    - Vérifier icônes cohérentes
    - Titres d'écran clairs
    - Maximum 3 niveaux de profondeur

### Phase 5 : Offline & Robustesse (Priorité 3)

12. **Intégrer OfflineIndicator :**
    - Badge dans header
    - Message clair si offline

13. **Améliorer gestion erreurs :**
    - Différencier erreur réseau vs absence de données
    - Timeout systématique (8s)
    - ErrorState avec retry

---

## 📝 FICHIERS À MODIFIER

### Composants
- ✅ `components/Toast.tsx` (créé)
- ✅ `components/ToastProvider.tsx` (créé)
- ✅ `hooks/useToast.ts` (créé)
- ⚠️ `components/OfflineIndicator.tsx` (à créer)

### Services
- ⚠️ `services/animals.ts` (vérifier alignement schéma)

### Écrans
- ⚠️ `app/(tabs)/health/index.tsx` (unifier styles, ajouter LoadingSkeleton, Toast)
- ⚠️ `app/(tabs)/health/add.tsx` (unifier styles, remplacer Alert par Toast)
- ⚠️ `app/(tabs)/reproduction/index.tsx` (unifier styles, ajouter LoadingSkeleton, Toast)
- ⚠️ `app/(tabs)/reproduction/add.tsx` (unifier styles, remplacer Alert par Toast)
- ⚠️ `app/(tabs)/feeding/index.tsx` (unifier styles, ajouter alerte stock faible)
- ⚠️ `app/(tabs)/feeding/add-stock.tsx` (unifier styles, Toast)
- ⚠️ `app/(tabs)/index.tsx` (ajouter section finances, unifier styles)
- ✅ `app/(tabs)/costs/index.tsx` (déjà bien fait)

### Layout
- ⚠️ `app/_layout.tsx` (intégrer ToastProvider)

---

## 🎨 STANDARDS DE DESIGN

### Couleurs
- Primary : `colors.primary` (#2d6a4f)
- Success : `colors.success` (#10b981)
- Error : `colors.error` (#ef4444)
- Warning : `colors.warning` (#f59e0b)
- Info : `colors.info` (#3b82f6)

### Espacements
- Padding cards : `spacing.base` (16px)
- Gap entre éléments : `spacing.sm` (8px)
- Section padding : `spacing.lg` (20px)

### Typographie
- Titres écran : `typography.fontSize.h2` (20px), `typography.fontWeight.bold`
- Titres cartes : `typography.fontSize.h4` (16px), `typography.fontWeight.semibold`
- Corps : `typography.fontSize.body` (16px)
- Captions : `typography.fontSize.caption` (12px)

### Radius
- Cards : `radius.lg` (12px)
- Buttons : `radius.md` (8px)
- Badges : `radius.full` (999px)

---

## ✅ CHECKLIST FINALE

### Fonctionnel
- [ ] Tous les services alignés avec schéma Supabase
- [ ] Tous les écrans fonctionnels (CRUD)
- [ ] Support offline basique (queue)
- [ ] Gestion erreurs robuste

### UX/UI
- [ ] Styles unifiés (designTokens partout)
- [ ] Toasts partout (succès/erreur)
- [ ] LoadingSkeleton dans toutes les listes
- [ ] EmptyState partout avec CTA
- [ ] Navigation cohérente (icônes, titres)
- [ ] Section finances au dashboard

### Robustesse
- [ ] Indicateur offline visible
- [ ] Timeout systématique (8s)
- [ ] ErrorState avec retry
- [ ] Pas de spinner infini

---

**Prochaine étape :** Commencer les corrections par les fichiers prioritaires

