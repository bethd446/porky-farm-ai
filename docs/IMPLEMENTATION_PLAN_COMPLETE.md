# 📋 PLAN D'IMPLÉMENTATION COMPLET – PORKYFARM

**Date** : 2025-01-27  
**Objectif** : Mettre en production le design system + Module Coûts & Finances

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Fichiers à créer/modifier

#### **1. Design System Web (P0)**
- ✅ `lib/design-tokens.ts` (existe)
- ✅ `components/common/EmptyState.tsx` (existe)
- 🔄 `components/common/StatCard.tsx` (à créer)
- 🔄 `lib/toast.ts` (à créer)
- 🔄 Remplacer couleurs hardcodées dans :
  - `components/health/health-cases.tsx`
  - `components/reproduction/gestation-tracker.tsx`
  - `components/livestock/add-animal-form.tsx`

#### **2. Design System Mobile (P0)**
- ✅ `porkyfarm-mobile/lib/designTokens.ts` (existe)
- ✅ `porkyfarm-mobile/components/EmptyState.tsx` (existe)
- ✅ `porkyfarm-mobile/components/LoadingSkeleton.tsx` (existe)
- ✅ `porkyfarm-mobile/components/ErrorState.tsx` (existe)
- 🔄 Remplacer couleurs hardcodées dans :
  - `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`
  - `porkyfarm-mobile/app/(tabs)/index.tsx`
  - `porkyfarm-mobile/app/(tabs)/_layout.tsx`

#### **3. Module Coûts & Finances**

**Backend (Supabase)**
- ✅ Table `transactions` existe déjà
- 🔄 Vérifier/mettre à jour RLS policies
- 🔄 Créer service Supabase : `lib/supabase/costs.ts`

**Mobile**
- 🔄 `porkyfarm-mobile/services/costs.ts`
- 🔄 `porkyfarm-mobile/app/(tabs)/costs/index.tsx`
- 🔄 `porkyfarm-mobile/app/(tabs)/costs/add.tsx`
- 🔄 `porkyfarm-mobile/components/CostItem.tsx`
- 🔄 Ajouter tab "Coûts" dans `porkyfarm-mobile/app/(tabs)/_layout.tsx`
- 🔄 Intégrer dans offline queue

**Web**
- 🔄 `components/dashboard/CostsWidget.tsx`
- 🔄 `app/dashboard/costs/page.tsx`
- 🔄 `components/costs/CostsList.tsx`
- 🔄 `components/costs/AddCostForm.tsx`
- 🔄 Ajouter dans sidebar navigation

#### **4. Navigation & UX**
- 🔄 Améliorer flows critiques (feedback, empty states)
- 🔄 Ajouter toasts partout
- 🔄 Indicateurs offline visibles

---

## 📝 DÉTAILS PAR FICHIER

### **A. Design System Web**

#### `components/common/StatCard.tsx`
**Objectif** : Carte de statistique réutilisable avec design system

**Props** :
```typescript
interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  colorClass?: string
  onClick?: () => void
}
```

**Styles** : Utiliser `lib/design-tokens.ts` :
- `colors.card`, `colors.border`
- `spacing.cardPadding`
- `shadows.md`
- `typography.h3`, `typography.caption`

---

#### `lib/toast.ts`
**Objectif** : Helper pour toasts (utiliser `sonner` ou `@radix-ui/react-toast`)

**Fonctions** :
```typescript
export const toast = {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}
```

---

### **B. Module Coûts Mobile**

#### `porkyfarm-mobile/services/costs.ts`
**Objectif** : Service CRUD pour transactions financières

**Interface** :
```typescript
export interface CostEntry {
  id: string
  user_id: string
  type: 'expense' | 'income'
  category: 'pig_purchase' | 'feed' | 'vitamins' | 'medication' | 'transport' | 'veterinary' | 'labor' | 'misc' | 'sale' | 'subsidy' | 'other'
  amount: number
  description?: string
  transaction_date: string
  pig_id?: string
  notes?: string
  created_at: string
}

export interface CostsService {
  getAll: () => Promise<{ data: CostEntry[] | null; error: Error | null }>
  getByPeriod: (startDate: string, endDate: string) => Promise<{ data: CostEntry[] | null; error: Error | null }>
  create: (entry: Omit<CostEntry, 'id' | 'user_id' | 'created_at'>) => Promise<{ data: CostEntry | null; error: Error | null }>
  update: (id: string, updates: Partial<CostEntry>) => Promise<{ data: CostEntry | null; error: Error | null }>
  delete: (id: string) => Promise<{ data: null; error: Error | null }>
  getSummary: (period?: 'week' | 'month' | 'year') => Promise<{ data: { totalExpenses: number; totalIncome: number; balance: number } | null; error: Error | null }>
}
```

**Implémentation** : Pattern identique à `animals.ts`, utiliser `supabase.from('transactions')`

---

#### `porkyfarm-mobile/app/(tabs)/costs/index.tsx`
**Objectif** : Écran liste des mouvements financiers

**Structure** :
1. Header : Titre "Coûts & Finances" + Bouton "+ Ajouter"
2. Filtres rapides : Toggle "Dépenses / Entrées / Tous"
3. Liste : `FlatList` avec `CostItem`
4. Empty state : `EmptyState` si aucune donnée
5. Loading : `LoadingSkeleton` pendant chargement
6. Error : `ErrorState` si erreur réseau

**Styles** : Utiliser `designTokens.ts` :
- `colors.*`
- `spacing.*`
- `commonStyles.card`, `commonStyles.listItem`

---

#### `porkyfarm-mobile/app/(tabs)/costs/add.tsx`
**Objectif** : Formulaire ajout dépense/entrée

**Champs** :
1. Type : Toggle `Dépense` / `Entrée` (boutons radio ou switch)
2. Catégorie : Picker natif (liste courte)
3. Montant : Input numérique (clavier numérique)
4. Date : DatePicker natif (défaut aujourd'hui)
5. Description : TextInput (optionnel)
6. Animal lié : Picker (optionnel, si type = expense lié à un animal)

**Validation** :
- Montant > 0
- Date valide
- Catégorie requise

**Feedback** :
- Toast "Dépense enregistrée" ou "Entrée enregistrée"
- Navigation retour liste
- Intégration offline queue si réseau absent

---

#### `porkyfarm-mobile/components/CostItem.tsx`
**Objectif** : Item de liste pour transaction

**Affichage** :
- Icône catégorie (💰, 🐷, 🌾, etc.)
- Montant (format FCFA, couleur selon type)
- Catégorie + Description
- Date (format court)
- Badge "En attente" si offline

**Styles** : `commonStyles.listItem`

---

### **C. Module Coûts Web**

#### `components/dashboard/CostsWidget.tsx`
**Objectif** : Widget synthèse coûts sur dashboard

**Affichage** :
- Total dépenses (30 derniers jours)
- Total entrées (30 derniers jours)
- Solde (entrées - dépenses)
- Graphique simple (optionnel, post-MVP)

**Styles** : Utiliser `StatCard` ou créer widget dédié

---

#### `app/dashboard/costs/page.tsx`
**Objectif** : Page dédiée coûts (web)

**Structure** :
1. Header : Titre + Bouton "Ajouter"
2. Filtres : Période, type, catégorie
3. Tableau : Liste transactions (filtrable)
4. Résumé : Totaux par période

---

### **D. Offline Queue Extension**

**Modifier** `porkyfarm-mobile/lib/offlineQueue.ts` :
- Ajouter `CREATE_COST_ENTRY`, `UPDATE_COST_ENTRY` dans `QueueActionType`

**Modifier** `porkyfarm-mobile/hooks/useSyncQueue.ts` (si existe) :
- Ajouter handler pour `CREATE_COST_ENTRY`

---

## 🔄 FLOWS DÉTAILLÉS

### **Flow 1 : Ajouter une dépense (Mobile)**

```
1. User ouvre tab "Coûts"
2. Tap "+ Ajouter"
3. Écran formulaire s'affiche
4. User sélectionne "Dépense"
5. User choisit catégorie (ex: "Aliments")
6. User saisit montant (ex: 50000 FCFA)
7. User sélectionne date (défaut aujourd'hui)
8. User saisit description (optionnel)
9. Tap "Enregistrer"
10. [Si online] → Toast "Dépense enregistrée" + Retour liste
11. [Si offline] → Toast "Enregistré, synchronisation à la reconnexion" + Badge "En attente" sur l'item
```

---

### **Flow 2 : Consulter synthèse (Dashboard Web)**

```
1. User ouvre Dashboard
2. Widget "Coûts & Finances" affiche :
   - Total dépenses : 150 000 FCFA (30j)
   - Total entrées : 200 000 FCFA (30j)
   - Solde : +50 000 FCFA
3. User peut cliquer pour voir détails (page /dashboard/costs)
```

---

### **Flow 3 : Synchronisation offline**

```
1. User ajoute dépense hors ligne
2. Action ajoutée à offline queue
3. Badge "En attente" visible sur l'item
4. Quand réseau revient :
   - Queue se synchronise automatiquement
   - Badge disparaît
   - Toast "Synchronisation réussie"
```

---

## ✅ CHECKLIST DE VALIDATION

### Design System
- [ ] Aucune couleur hardcodée (`bg-red-500`, `#007AFF`, etc.)
- [ ] Tous les composants utilisent `design-tokens.ts` / `designTokens.ts`
- [ ] Empty states présents partout
- [ ] Loading skeletons présents partout
- [ ] Error states avec retry partout
- [ ] Toasts après chaque action CRUD

### Module Coûts
- [ ] Service `costs.ts` fonctionne (CRUD complet)
- [ ] Écran liste mobile fonctionne (filtres, empty state, loading)
- [ ] Formulaire ajout mobile fonctionne (validation, feedback)
- [ ] Widget dashboard web fonctionne (synthèse 30j)
- [ ] Page coûts web fonctionne (tableau, filtres)
- [ ] Offline queue intégrée (création dépense hors ligne)
- [ ] Synchronisation automatique fonctionne

### Navigation & UX
- [ ] Tab "Coûts" visible dans navigation mobile
- [ ] Lien "Coûts" dans sidebar web
- [ ] Flows critiques < 3 écrans de profondeur
- [ ] Feedback immédiat partout (toasts, loading, errors)
- [ ] Touch targets ≥ 44px mobile
- [ ] Tailles texte ≥ 14px mobile

---

**Dernière mise à jour** : 2025-01-27

