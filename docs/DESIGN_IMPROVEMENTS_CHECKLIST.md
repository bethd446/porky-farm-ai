# ✅ CHECKLIST D'AMÉLIORATIONS UI – PORKYFARM

**Date** : 2025-01-27  
**Objectif** : Liste d'actions concrètes pour professionnaliser le design

---

## 🔴 PRIORITÉ CRITIQUE (P0) – À Faire Immédiatement

### Web

#### 1. Unifier Palette de Couleurs

- [ ] **Créer fichier tokens** : `lib/design-tokens.ts` avec toutes les couleurs
- [ ] **Remplacer hardcodés** :
  - [ ] `bg-red-500` → `bg-destructive` (components/health/health-cases.tsx)
  - [ ] `bg-amber-500` → `bg-warning`
  - [ ] `bg-blue-500` → `bg-info`
  - [ ] `bg-green-500` → `bg-success`
- [ ] **Vérifier** : `grep -r "bg-.*-500" components/` retourne 0 résultats

**Fichiers à modifier** :
- `components/health/health-cases.tsx` (lignes 213, 215, 217, 237, 239, 241)
- Tous les fichiers avec couleurs hardcodées

---

#### 2. Standardiser Cartes Dashboard

- [ ] **Créer composant Card réutilisable** : `components/common/StatCard.tsx`
- [ ] **Unifier padding** : `p-4` ou `p-6` partout (pas de mix)
- [ ] **Unifier borders** : `border border-border` partout
- [ ] **Unifier shadows** : `shadow-md` pour cartes standards

**Fichiers à modifier** :
- `components/dashboard/dashboard-stats.tsx`
- `app/dashboard/page.tsx`

---

#### 3. Améliorer Hiérarchie Dashboard

- [ ] **Carte principale** : Plus grande (col-span-2), border-left accent
- [ ] **Actions secondaires** : Plus discrètes (ghost, outline)
- [ ] **Stats** : Tailles de police cohérentes (h1: 32px, h2: 24px)

---

#### 4. Empty States

- [ ] **Créer composant** : `components/common/EmptyState.tsx`
- [ ] **Implémenter pour** :
  - [ ] Cheptel vide (`app/dashboard/livestock/page.tsx`)
  - [ ] Aucun cas santé (`app/dashboard/health/page.tsx`)
  - [ ] Aucune gestation (`app/dashboard/reproduction/page.tsx`)
  - [ ] Stock vide (`app/dashboard/feeding/page.tsx`)

**Structure** :
```tsx
<EmptyState
  icon="🐷"
  title="Aucun animal enregistré"
  description="Commencez par ajouter vos premiers animaux..."
  action={<Button>Ajouter un animal</Button>}
/>
```

---

#### 5. Système de Toasts

- [ ] **Vérifier installation** : `sonner` ou `@radix-ui/react-toast`
- [ ] **Créer helper** : `lib/toast.ts` avec fonctions `toast.success()`, `toast.error()`
- [ ] **Ajouter toasts après** :
  - [ ] Ajout animal (`components/livestock/add-animal-form.tsx`)
  - [ ] Ajout cas santé (`components/health/health-cases.tsx`)
  - [ ] Ajout gestation (`components/reproduction/gestation-tracker.tsx`)

---

### Mobile

#### 1. Unifier Palette de Couleurs

- [ ] **Créer fichier** : `porkyfarm-mobile/lib/colors.ts`
- [ ] **Remplacer hardcodés** :
  - [ ] `#007AFF` → `colors.primary` (livestock/index.tsx ligne 112)
  - [ ] `#2d6a4f` → `colors.primary`
  - [ ] `#f9fafb` → `colors.background`
- [ ] **Importer partout** : `import { colors } from '../lib/colors'`

**Fichiers à modifier** :
- `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`
- `porkyfarm-mobile/app/(tabs)/index.tsx`
- Tous les fichiers avec couleurs hardcodées

---

#### 2. Standardiser StyleSheet des Cartes

- [ ] **Créer fichier** : `porkyfarm-mobile/lib/cardStyles.ts`
- [ ] **Styles unifiés** :
  - [ ] `cardContainer` : padding, border, shadow
  - [ ] `cardHeader` : flex, justify-between
  - [ ] `cardContent` : padding-top
- [ ] **Utiliser partout** : Dashboard, Livestock, Health, Reproduction

**Fichiers à modifier** :
- `porkyfarm-mobile/app/(tabs)/index.tsx` (statCard)
- `porkyfarm-mobile/app/(tabs)/livestock/index.tsx` (animalCard)

---

#### 3. Améliorer Listes

- [ ] **Hauteur minimum** : 64px par item (touch-friendly)
- [ ] **Séparateurs** : `borderBottomWidth: 1, borderBottomColor: '#e5e7eb'`
- [ ] **Badges de statut** : Composant réutilisable avec variantes

**Fichiers à modifier** :
- `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`
- `porkyfarm-mobile/app/(tabs)/health/index.tsx`
- `porkyfarm-mobile/app/(tabs)/reproduction/index.tsx`

---

#### 4. Empty States Mobile

- [ ] **Créer composant** : `porkyfarm-mobile/components/EmptyState.tsx`
- [ ] **Implémenter pour** :
  - [ ] Cheptel vide
  - [ ] Aucun cas santé
  - [ ] Aucune gestation
  - [ ] Stock vide

**Structure** :
```tsx
<EmptyState
  emoji="🐷"
  title="Aucun animal enregistré"
  description="Commencez par ajouter vos premiers animaux..."
  actionLabel="Ajouter un animal"
  onAction={() => router.push('/livestock/add')}
/>
```

---

#### 5. Loading States (Skeletons)

- [ ] **Créer composant** : `porkyfarm-mobile/components/LoadingSkeleton.tsx`
- [ ] **Implémenter pour** :
  - [ ] Liste d'animaux
  - [ ] Cartes dashboard
  - [ ] Liste gestations

---

#### 6. Error States

- [ ] **Créer composant** : `porkyfarm-mobile/components/ErrorState.tsx`
- [ ] **Gérer** :
  - [ ] Erreur réseau
  - [ ] Erreur chargement données
  - [ ] Erreur action (avec retry)

---

## 🟠 PRIORITÉ HAUTE (P1) – Semaine Prochaine

### Web + Mobile

#### 1. Système d'Icônes

- [ ] **Documenter usage Lucide** : Créer `docs/ICONS_USAGE.md`
- [ ] **Mapping par module** : Définir icônes standards (Cheptel, Santé, etc.)
- [ ] **Règles de taille** : 20px mobile, 24px desktop

---

#### 2. Badges de Statut

- [ ] **Créer composant Badge** : Variantes (success, warning, error, info, neutral)
- [ ] **Utiliser partout** : Statuts animaux, cas santé, gestations

---

#### 3. Formulaires

- [ ] **Labels toujours visibles** : Pas de placeholder-only
- [ ] **Messages d'erreur** : Sous chaque champ, couleur destructive
- [ ] **Asterisque obligatoire** : Rouge pour champs requis

---

#### 4. Modals

- [ ] **Structure standardisée** : Titre, description, actions (annuler + confirmer)
- [ ] **Utiliser pour** : Suppressions, actions critiques

---

### Mobile Spécifique

#### 1. Touch Targets

- [ ] **Vérifier tous les boutons** : Minimum 44x44px
- [ ] **Espacement** : Minimum 8px entre boutons

---

#### 2. Espacement Standardisé

- [ ] **Créer fichier** : `porkyfarm-mobile/lib/spacing.ts`
- [ ] **Utiliser partout** : Multiples de 4px uniquement

---

## 🟡 PRIORITÉ MOYENNE (P2) – Mois Prochain

- [ ] **Dark mode** : Tester et optimiser (si activé)
- [ ] **Accessibility** : Vérifier contrastes (WebAIM)
- [ ] **Animations** : Transitions subtiles (fade, slide)
- [ ] **Illustrations** : Créer ou utiliser emojis pour empty states

---

## 📝 NOTES D'IMPLÉMENTATION

### Ordre Recommandé

1. **Semaine 1** : Unifier palette (P0)
2. **Semaine 2** : Standardiser composants (P0)
3. **Semaine 3** : Empty states + Toasts (P0)
4. **Semaine 4** : Badges + Formulaires (P1)

### Tests à Effectuer

- [ ] **Contrastes** : Tous les textes ≥ 4.5:1
- [ ] **Tailles** : Minimum 14px mobile, 16px desktop
- [ ] **Touch targets** : Tous ≥ 44x44px mobile
- [ ] **Cohérence** : Même palette partout

---

**Dernière mise à jour** : 2025-01-27

