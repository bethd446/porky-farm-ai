# 🎨 DESIGN SYSTEM PORKYFARM – Spécification Complète

**Version** : 1.0  
**Date** : 2025-01-27  
**Rôle** : Senior Product Designer & Design System Architect  
**Objectif** : Définir un design system professionnel, mobile-first, adapté aux éleveurs ivoiriens

---

## 📋 TABLE DES MATIÈRES

1. [Audit UI/UX de Haut Niveau](#1-audit-uiux-de-haut-niveau)
2. [Direction Visuelle Proposée](#2-direction-visuelle-proposée)
3. [Spécification Design System](#3-spécification-design-system)
4. [Navigation & UX Flow](#4-navigation--ux-flow)
5. [Checklist d'Améliorations UI](#5-checklist-daméliorations-ui)
6. [Conseils Actionnables](#6-conseils-actionnables)

---

## 1. AUDIT UI/UX DE HAUT NIVEAU

### 1.1 Points Forts Actuels

✅ **Fonctionnellement solide** : Les modules principaux sont implémentés  
✅ **Architecture claire** : Séparation web/mobile bien pensée  
✅ **Base de design system** : `lib/design-system.ts` et palette CSS existent  
✅ **Composants shadcn/ui** : Base solide côté web  

### 1.2 Problèmes Identifiés (Priorité Haute)

#### 🔴 **Critique – Cohérence Visuelle**

**Problème** : Incohérences majeures entre web et mobile, couleurs hardcodées, styles variés.

**Exemples observés** :
- Mobile : `#2d6a4f` (vert), `#007AFF` (bleu iOS), `#f9fafb` (gris)
- Web : `bg-primary`, `text-primary`, mais aussi `bg-red-500`, `bg-amber-500` hardcodés
- Cartes : styles différents (borders, shadows, radius) selon les écrans

**Impact** : L'app ne donne pas l'impression d'un produit unifié, professionnel.

**Solution** : Unifier via tokens de design system, éliminer toutes les couleurs hardcodées.

---

#### 🟠 **Important – Hiérarchie Visuelle**

**Problème** : Hiérarchie peu claire, actions principales pas toujours évidentes.

**Exemples** :
- Dashboard mobile : 4 cartes stats de même taille, aucune ne ressort
- Listes d'animaux : pas de distinction visuelle entre statuts (actif, malade, en gestation)
- Boutons d'action : tailles et styles variés (`+ Ajouter`, `+ Animal`, `+ Cas santé`)

**Impact** : L'utilisateur ne sait pas où regarder en premier, perte de temps.

**Solution** : Système de hiérarchie clair (tailles, couleurs, espacements), CTA évidents.

---

#### 🟡 **Moyen – Feedback Utilisateur**

**Problème** : Feedback insuffisant après actions critiques.

**Exemples** :
- Ajout d'animal : pas de confirmation visuelle claire (toast ? modal ?)
- Synchronisation : pas d'indicateur de statut réseau/offline visible
- Erreurs : messages parfois techniques ou absents

**Impact** : L'utilisateur ne sait pas si son action a réussi, frustration.

**Solution** : Toasts, indicateurs de statut, messages d'erreur clairs en français simple.

---

#### 🟡 **Moyen – Empty States**

**Problème** : Empty states basiques, peu engageants.

**Exemples** :
- "Aucun animal enregistré" → pas d'illustration, pas de guidance
- "Aucun cas de santé" → pas d'explication de pourquoi c'est important

**Impact** : L'utilisateur ne comprend pas l'utilité du module, abandon possible.

**Solution** : Empty states avec illustrations, texte explicatif, CTA clair.

---

#### 🟢 **Mineur – Densité & Espacement**

**Problème** : Espacements incohérents, parfois trop serrés pour usage mobile.

**Exemples** :
- Cartes dashboard : `padding: 16` vs `padding: 20` selon les écrans
- Listes : pas assez d'espace entre items pour touch-friendly

**Impact** : Erreurs de tap, fatigue visuelle.

**Solution** : Système d'espacement standardisé (4/8/12/16/20/24px), minimum 44px pour zones tactiles.

---

### 1.3 Manques Identifiés

- ❌ **Système d'icônes unifié** : Lucide utilisé mais pas de règles d'usage
- ❌ **Loading states cohérents** : Skeleton loaders manquants
- ❌ **Error boundaries visuels** : Pas de composants d'erreur réutilisables
- ❌ **Accessibility** : Pas de vérification contrastes, tailles de texte minimales
- ❌ **Dark mode** : Défini mais pas testé/optimisé pour usage terrain

---

## 2. DIRECTION VISUELLE PROPOSÉE

### 2.1 Identité Visuelle

**Ton** : Professionnel, accessible, chaleureux mais sérieux  
**Sensation** : Outil de travail fiable, pas un gadget  
**Référence** : Applications agricoles pro (FarmLogs, AgriWebb) + simplicité mobile (WhatsApp, Instagram)

**Principes directeurs** :
1. **Clarté > Esthétique** : Toujours privilégier la lisibilité
2. **Simplicité** : Une action principale par écran
3. **Fiabilité** : Feedback immédiat, jamais d'état ambigu
4. **Accessibilité** : Contraste minimum 4.5:1, tailles de texte ≥ 14px mobile

---

### 2.2 Palette de Couleurs

#### **Couleurs Principales (Branding PorkyFarm)**

```css
/* Primary - Vert forêt (agriculture, nature, fiabilité) */
--primary: #2d6a4f;           /* oklch(0.45 0.12 145) */
--primary-light: #40916c;     /* oklch(0.55 0.12 145) - Hover */
--primary-dark: #1b4332;      /* oklch(0.35 0.12 145) - Pressed */
--primary-foreground: #ffffff;

/* Secondary - Gris ardoise (neutre, professionnel) */
--secondary: #f1f5f9;         /* oklch(0.94 0.01 260) */
--secondary-foreground: #334155; /* oklch(0.35 0.02 260) */

/* Accent - Ambre doré (highlights, badges, alertes) */
--accent: #d4a373;            /* oklch(0.82 0.14 75) */
--accent-foreground: #1a1a1a;
```

**Justification** :
- **Vert forêt** : Évoque agriculture, nature, croissance. Assez sombre pour contraste élevé au soleil.
- **Ambre doré** : Évoque terre, récolte. Utilisé pour highlights et badges (non critiques).

---

#### **Palette Neutre (Fonds, Bordures, Textes)**

```css
/* Backgrounds */
--background: #fafaf8;         /* Blanc cassé chaud - moins agressif que blanc pur */
--card: #ffffff;              /* Blanc pur pour cartes */
--muted: #f5f5f5;            /* Fond atténué */

/* Textes */
--foreground: #1a1a1a;       /* Quasi-noir - contraste 16:1+ */
--muted-foreground: #6b7280; /* Gris moyen - contraste 4.6:1 */
--subtle-foreground: #9ca3af; /* Gris clair - contraste 3:1 (légendes uniquement) */

/* Bordures */
--border: #e5e7eb;           /* Gris très clair */
--border-strong: #d1d5db;    /* Gris moyen - séparateurs */
```

**Règle** : Jamais de texte en dessous de `#6b7280` sur fond clair (sauf légendes).

---

#### **États Sémantiques (Succès, Warning, Erreur, Info)**

```css
/* Success - Vert franc (actions réussies, états positifs) */
--success: #10b981;           /* oklch(0.52 0.16 145) */
--success-foreground: #ffffff;
--success-light: #d1fae5;    /* Fond success (badges, toasts) */

/* Warning - Orange vif (alertes, attention requise) */
--warning: #f59e0b;           /* oklch(0.72 0.16 55) */
--warning-foreground: #1a1a1a; /* Texte sombre pour contraste */
--warning-light: #fef3c7;    /* Fond warning */

/* Error - Rouge franc (erreurs, actions destructives) */
--destructive: #ef4444;       /* oklch(0.55 0.16 25) */
--destructive-foreground: #ffffff;
--destructive-light: #fee2e2; /* Fond error */

/* Info - Bleu clair (informations, liens) */
--info: #3b82f6;              /* oklch(0.55 0.1 240) */
--info-foreground: #ffffff;
--info-light: #dbeafe;        /* Fond info */
```

**Règles d'usage** :
- **Success** : Confirmations, états positifs (animal ajouté, cas résolu)
- **Warning** : Alertes non critiques (stock faible, rappel vaccination)
- **Error** : Erreurs, actions destructives (suppression, échec réseau)
- **Info** : Informations neutres (météo, conseils IA)

---

#### **Stratégie Light Mode (Prioritaire)**

**Light mode obligatoire** pour usage terrain (soleil, écrans moyens de gamme).

**Contraintes** :
- Contraste minimum **4.5:1** pour texte normal, **3:1** pour texte large
- Fond jamais blanc pur (`#fafaf8` pour réduire fatigue)
- Bordures subtiles mais visibles (`#e5e7eb` minimum)

**Dark mode** : Préparé dans CSS mais **désactivé par défaut** (activation future optionnelle).

---

### 2.3 Typographie

#### **Familles de Police**

**Web (Next.js)** :
- **Primaire** : `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Fallback** : Système natif (meilleure performance)

**Mobile (React Native)** :
- **iOS** : `System` (San Francisco)
- **Android** : `Roboto` (système)

**Justification** :
- **Inter** : Moderne, lisible, excellente sur petits écrans
- **Système natif mobile** : Performance, cohérence OS, pas de téléchargement

---

#### **Échelle Typographique (Mobile-First)**

```typescript
// Mobile (base) → Desktop (responsive)
export const typography = {
  // Titres
  h1: {
    mobile: "text-2xl font-bold",      // 24px
    desktop: "text-4xl font-bold",      // 36px
    lineHeight: 1.2,
  },
  h2: {
    mobile: "text-xl font-bold",       // 20px
    desktop: "text-3xl font-bold",      // 30px
    lineHeight: 1.3,
  },
  h3: {
    mobile: "text-lg font-semibold",    // 18px
    desktop: "text-2xl font-semibold",  // 24px
    lineHeight: 1.4,
  },
  h4: {
    mobile: "text-base font-semibold",  // 16px
    desktop: "text-xl font-semibold",   // 20px
    lineHeight: 1.4,
  },

  // Corps de texte
  body: {
    mobile: "text-base",                // 16px (minimum recommandé)
    desktop: "text-lg",                  // 18px
    lineHeight: 1.6,
  },
  bodySmall: {
    mobile: "text-sm",                  // 14px (minimum absolu)
    desktop: "text-base",                // 16px
    lineHeight: 1.5,
  },

  // Utilitaires
  caption: {
    mobile: "text-xs",                  // 12px (légendes uniquement)
    desktop: "text-sm",
    lineHeight: 1.4,
    color: "text-muted-foreground",
  },
  label: {
    mobile: "text-sm font-medium",      // 14px
    desktop: "text-base font-medium",    // 16px
    lineHeight: 1.4,
  },
}
```

**Règles strictes** :
- **Jamais en dessous de 14px** pour texte lisible (mobile)
- **Interligne minimum 1.4** pour lisibilité
- **Poids de police** : Regular (400) pour corps, Medium (500) pour labels, Bold (700) pour titres

---

### 2.4 Système d'Icônes

#### **Bibliothèque Recommandée : Lucide React / Lucide React Native**

**Justification** :
- ✅ Style cohérent (outline, stroke 2px)
- ✅ Large bibliothèque (1000+ icônes)
- ✅ Compatible React + React Native
- ✅ Légère, performante
- ✅ Maintenue activement

**Alternative** : `@expo/vector-icons` (Ionicons, MaterialIcons) pour mobile si besoin.

---

#### **Règles d'Usage par Module**

```typescript
export const iconMapping = {
  // Modules principaux
  dashboard: "LayoutDashboard",      // Lucide
  livestock: "PiggyBank",            // Lucide (ou "Pig" si disponible)
  health: "Stethoscope",             // Lucide
  reproduction: "Baby",               // Lucide
  feeding: "Calculator",             // Lucide
  ai: "Brain",                       // Lucide
  profile: "User",                   // Lucide

  // Actions
  add: "Plus",
  edit: "Pencil",
  delete: "Trash2",
  save: "Check",
  cancel: "X",
  search: "Search",
  filter: "Filter",

  // États
  success: "CheckCircle",
  error: "AlertCircle",
  warning: "AlertTriangle",
  info: "Info",

  // Navigation
  chevronRight: "ChevronRight",
  chevronDown: "ChevronDown",
  menu: "Menu",
  close: "X",
}
```

**Règles de style** :
- **Taille standard** : 20px (mobile), 24px (desktop)
- **Couleur** : `text-foreground` par défaut, `text-primary` pour actions principales
- **Stroke** : 2px (Lucide par défaut)
- **Style** : Outline uniquement (jamais filled sauf badges)

---

### 2.5 Espacement & Layout

#### **Système d'Espacement (Basé sur 4px)**

```typescript
export const spacing = {
  // Base (4px)
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 12,   // 0.75rem
  base: 16, // 1rem
  lg: 20,   // 1.25rem
  xl: 24,   // 1.5rem
  "2xl": 32, // 2rem
  "3xl": 40, // 2.5rem
  "4xl": 48, // 3rem

  // Composants
  cardPadding: 16,        // Padding interne cartes
  cardGap: 12,            // Espacement entre cartes
  sectionPadding: 24,     // Padding sections
  inputPadding: 12,       // Padding inputs
  buttonPadding: 16,      // Padding boutons (horizontal)

  // Touch targets (mobile)
  touchTarget: 44,        // Minimum 44x44px pour zones tactiles
  touchTargetLarge: 56,   // 56x56px pour actions principales
}
```

**Règles** :
- **Multiples de 4px** uniquement (cohérence visuelle)
- **Touch targets minimum 44px** (Apple HIG, Material Design)
- **Espacement vertical** : `space-y-4` (16px) pour listes, `space-y-6` (24px) pour sections

---

#### **Grille & Breakpoints**

```typescript
export const breakpoints = {
  mobile: "0px",           // Mobile first
  tablet: "768px",         // iPad portrait
  desktop: "1024px",       // Desktop
  wide: "1280px",          // Large desktop
}

export const grid = {
  // Colonnes
  mobile: 1,               // 1 colonne mobile
  tablet: 2,               // 2 colonnes tablette
  desktop: 3,              // 3 colonnes desktop
  wide: 4,                 // 4 colonnes large

  // Gaps
  gap: 16,                 // 16px entre colonnes
  gapLarge: 24,            // 24px pour sections
}
```

---

### 2.6 Ombres, Profondeur, Gradients

#### **Ombres (Hiérarchie Visuelle)**

```css
/* Niveaux d'élévation */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);      /* Éléments discrets */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);    /* Cartes standards */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1); /* Modals, popovers */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);  /* Dropdowns, menus */
```

**Règles** :
- **Ombres subtiles uniquement** : Pas de `shadow-2xl` sauf modals
- **Couleur** : `rgba(0, 0, 0, 0.1)` maximum (jamais noir pur)
- **Usage** : Cartes (`shadow-md`), Boutons hover (`shadow-sm`), Modals (`shadow-lg`)

---

#### **Gradients (Usage Limité)**

**Règle** : Gradients **rares**, uniquement pour :
- **Header principal** (optionnel, léger)
- **Boutons CTA principaux** (hover state uniquement)
- **Badges spéciaux** (ex. "Nouveau", "Pro")

**Exemple** :
```css
.gradient-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
}
```

**À éviter** : Gradients partout, gradients flashy, textes en gradient.

---

#### **Profondeur (Z-Index)**

```typescript
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}
```

---

## 3. SPÉCIFICATION DESIGN SYSTEM

### 3.1 Composants – Boutons

#### **Variantes**

```typescript
// Primary (CTA principal)
<Button variant="primary" size="md">
  Ajouter un animal
</Button>

// Secondary (action secondaire)
<Button variant="secondary" size="md">
  Annuler
</Button>

// Outline (action discrète)
<Button variant="outline" size="md">
  Voir détails
</Button>

// Ghost (action minimale)
<Button variant="ghost" size="md">
  Modifier
</Button>

// Destructive (suppression, danger)
<Button variant="destructive" size="md">
  Supprimer
</Button>
```

#### **Tailles (Mobile-First)**

```typescript
export const buttonSizes = {
  sm: {
    height: 36,      // 36px (petits boutons, inline)
    paddingX: 12,
    fontSize: 14,
  },
  md: {
    height: 44,      // 44px (standard, touch-friendly)
    paddingX: 16,
    fontSize: 16,
  },
  lg: {
    height: 56,      // 56px (CTA principaux)
    paddingX: 24,
    fontSize: 18,
  },
  icon: {
    size: 44,        // 44x44px (boutons icônes)
  },
}
```

#### **États**

```typescript
// Normal
bg-primary text-primary-foreground

// Hover
bg-primary-light (ou opacity-90)

// Pressed
bg-primary-dark (ou scale-95)

// Disabled
opacity-50 cursor-not-allowed

// Loading
<Loader2 className="animate-spin" /> + texte "Enregistrement..."
```

**Règles** :
- **Toujours un état disabled clair** (opacity + cursor)
- **Loading state** : Spinner + texte explicatif
- **Feedback tactile** : Légère animation scale au tap (mobile)

---

### 3.2 Composants – Inputs & Formulaires

#### **Structure Standard**

```tsx
<div className="space-y-2">
  <Label htmlFor="identifier" className="text-sm font-medium">
    Identifiant <span className="text-destructive">*</span>
  </Label>
  <Input
    id="identifier"
    type="text"
    placeholder="Ex: TRUIE-001"
    className="h-11" // 44px minimum
  />
  {error && (
    <p className="text-sm text-destructive">{error}</p>
  )}
</div>
```

#### **Règles**

- **Label toujours visible** (pas de placeholder-only)
- **Asterisque rouge** pour champs obligatoires
- **Message d'erreur** sous le champ, couleur destructive
- **Hauteur minimum 44px** (touch-friendly)
- **Border focus** : `ring-2 ring-primary` (visible au soleil)

---

### 3.3 Composants – Cartes (Cards)

#### **Variantes**

```typescript
// Card standard (liste, dashboard)
<Card className="p-4 border border-border shadow-md">
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    Contenu
  </CardContent>
</Card>

// Card interactive (cliquable)
<Card className="p-4 border border-border shadow-md hover:shadow-lg transition-shadow cursor-pointer">
  ...
</Card>

// Card stat (dashboard)
<Card className="p-6 border-l-4 border-l-primary bg-card">
  <div className="text-3xl font-bold">50</div>
  <div className="text-sm text-muted-foreground">Animaux</div>
</Card>
```

#### **Structure Recommandée**

```tsx
// Carte animal (exemple)
<Card className="p-4 border border-border shadow-md">
  {/* Header avec badge */}
  <div className="flex items-start justify-between mb-3">
    <div>
      <h3 className="text-lg font-semibold">TRUIE-001</h3>
      <p className="text-sm text-muted-foreground">Bella</p>
    </div>
    <Badge variant={status === "active" ? "success" : "warning"}>
      {status}
    </Badge>
  </div>

  {/* Contenu */}
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm">
      <Stethoscope className="h-4 w-4 text-muted-foreground" />
      <span>Truie • 200kg</span>
    </div>
  </div>

  {/* Actions */}
  <div className="mt-4 flex gap-2">
    <Button variant="outline" size="sm">Voir</Button>
    <Button variant="ghost" size="sm">Modifier</Button>
  </div>
</Card>
```

---

### 3.4 Composants – Listes & Tableaux

#### **Liste d'Animaux (Mobile-First)**

```tsx
<FlatList
  data={animals}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigate(item.id)}
    >
      {/* Photo (optionnel) */}
      {item.photo && (
        <Image source={{ uri: item.photo }} style={styles.photo} />
      )}

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.name}>{item.name || item.identifier}</Text>
        <Text style={styles.meta}>
          {getCategoryLabel(item.category)} • {getStatusLabel(item.status)}
        </Text>
      </View>

      {/* Badge statut */}
      <Badge variant={getStatusVariant(item.status)}>
        {item.status}
      </Badge>

      {/* Chevron */}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </TouchableOpacity>
  )}
  ItemSeparatorComponent={() => <View style={styles.separator} />}
/>
```

**Règles** :
- **Hauteur minimum 64px** par item (touch-friendly)
- **Séparateur** : `border-b border-border` (1px, couleur `#e5e7eb`)
- **Chevron** : Toujours à droite pour indiquer navigation

---

### 3.5 Composants – Modals & Alertes

#### **Modal de Confirmation (Action Critique)**

```tsx
<AlertDialog>
  <AlertDialogTrigger>
    <Button variant="destructive">Supprimer</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Supprimer l'animal ?</AlertDialogTitle>
      <AlertDialogDescription>
        Cette action est irréversible. L'animal "{animal.name}" sera définitivement supprimé.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction variant="destructive">
        Supprimer
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Règles** :
- **Titre clair** : Question directe
- **Description** : Conséquence explicite
- **Actions** : Annuler (gauche, outline) + Action (droite, destructive)

---

#### **Toast (Feedback Actions)**

```tsx
// Succès
<Toast>
  <div className="flex items-center gap-2">
    <CheckCircle className="h-5 w-5 text-success" />
    <span>Animal ajouté avec succès</span>
  </div>
</Toast>

// Erreur
<Toast variant="destructive">
  <div className="flex items-center gap-2">
    <AlertCircle className="h-5 w-5" />
    <span>Erreur de connexion. Vérifiez votre réseau.</span>
  </div>
</Toast>
```

**Règles** :
- **Durée** : 3 secondes (succès), 5 secondes (erreur)
- **Position** : Bas de l'écran (mobile), coin supérieur droit (desktop)
- **Icône** : Toujours présente pour reconnaissance visuelle rapide

---

### 3.6 Composants – Empty States

#### **Structure Standard**

```tsx
<View style={styles.emptyState}>
  {/* Illustration (emoji ou icône grande) */}
  <Text style={styles.emptyIcon}>🐷</Text>

  {/* Titre */}
  <Text style={styles.emptyTitle}>Aucun animal enregistré</Text>

  {/* Description */}
  <Text style={styles.emptyDescription}>
    Commencez par ajouter vos premiers animaux pour suivre votre élevage.
    Vous pourrez enregistrer leurs informations, photos et historique.
  </Text>

  {/* CTA */}
  <Button
    variant="primary"
    size="lg"
    onPress={() => navigate('/livestock/add')}
  >
    Ajouter mon premier animal
  </Button>
</View>
```

**Règles** :
- **Toujours un CTA clair** : "Ajouter", "Créer", "Commencer"
- **Description pédagogique** : Expliquer pourquoi c'est important
- **Illustration** : Emoji ou icône grande (pas d'image complexe)

---

### 3.7 Composants – Loading & Skeletons

#### **Skeleton Loader (Liste)**

```tsx
// Skeleton pour liste d'animaux
{[1, 2, 3].map((i) => (
  <View key={i} style={styles.skeletonCard}>
    <View style={styles.skeletonPhoto} />
    <View style={styles.skeletonContent}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '60%' }]} />
    </View>
  </View>
))}
```

**Règles** :
- **Animation subtile** : `opacity: 0.5 → 1` (pulse)
- **Structure identique** au contenu réel
- **Durée** : 1-2 secondes maximum

---

### 3.8 Composants – Error States

#### **Erreur Réseau**

```tsx
<View style={styles.errorState}>
  <AlertCircle className="h-12 w-12 text-destructive" />
  <Text style={styles.errorTitle}>Connexion impossible</Text>
  <Text style={styles.errorDescription}>
    Vérifiez votre connexion Internet et réessayez.
    Vos données seront synchronisées automatiquement une fois reconnecté.
  </Text>
  <Button variant="primary" onPress={retry}>
    Réessayer
  </Button>
</View>
```

**Règles** :
- **Message en français simple** : Pas de jargon technique
- **Action de retry** : Toujours présente
- **Rassurer** : Expliquer que les données sont sauvegardées

---

## 4. NAVIGATION & UX FLOW

### 4.1 Structure Navigation Mobile (Expo Router)

#### **Tabs Principaux (Bottom Navigation)**

```
┌─────────────────────────────────┐
│  🏠 Dashboard  🐷 Cheptel  🏥   │
│     Santé  👶 Repro  📊 Alim    │
│     🤖 IA  👤 Profil             │
└─────────────────────────────────┘
```

**Ordre recommandé** :
1. **Dashboard** (🏠) - Vue d'ensemble
2. **Cheptel** (🐷) - Module le plus utilisé
3. **Santé** (🏥) - Actions fréquentes
4. **Reproduction** (👶) - Suivi gestations
5. **Alimentation** (📊) - Stock, rations
6. **IA** (🤖) - Assistant
7. **Profil** (👤) - Paramètres

**Règles** :
- **Maximum 5 tabs visibles** (iOS/Android standard)
- **IA et Profil** : Peuvent être dans un menu "Plus" si nécessaire
- **Badge de notification** : Sur Santé si cas critiques

---

#### **Navigation Interne (Stack)**

```
Dashboard
  └─> Détails animal
       └─> Historique santé
            └─> Détails cas

Santé
  └─> Nouveau cas
       └─> Analyse photo IA

Reproduction
  └─> Nouvelle saillie
       └─> Détails gestation
```

**Règles** :
- **Maximum 3 niveaux** de profondeur
- **Breadcrumb** ou titre de page clair
- **Bouton retour** toujours visible (header natif)

---

### 4.2 Flows Clés (Scénarios d'Usage)

#### **Flow 1 : Enregistrer un Cas de Santé (Mobile)**

```
1. Tab "Santé" → Bouton "+ Nouveau cas"
2. Sélectionner animal (liste simple, recherche)
3. Décrire problème (champ texte)
4. Prendre photo (bouton caméra visible)
5. [Optionnel] Analyser avec IA (bouton "Analyser photo")
6. Confirmer → Toast "Cas enregistré"
7. Retour liste → Nouveau cas visible
```

**Améliorations UX** :
- ✅ **Bouton caméra visible** dès le début (pas caché)
- ✅ **Analyse IA optionnelle** mais visible
- ✅ **Feedback immédiat** : Toast + retour liste

---

#### **Flow 2 : Enregistrer une Gestation (Mobile)**

```
1. Tab "Reproduction" → Bouton "+ Nouvelle saillie"
2. Sélectionner truie (liste filtrée)
3. Sélectionner verrat (optionnel)
4. Date saillie (picker natif)
5. [Calcul automatique] Date mise-bas affichée
6. Confirmer → Toast "Gestation enregistrée"
7. Retour liste → Nouvelle gestation visible
```

**Améliorations UX** :
- ✅ **Calcul automatique** : Date mise-bas affichée immédiatement
- ✅ **Rappel visuel** : "Mise-bas prévue dans X jours" sur la carte

---

#### **Flow 3 : Consulter l'Assistant IA (Mobile + Web)**

```
1. Tab "IA" → Chat ouvert
2. Question texte ou photo
3. [Loading] Indicateur "L'IA réfléchit..."
4. Réponse streaming (si possible) ou complète
5. [Optionnel] Poser question de suivi
```

**Améliorations UX** :
- ✅ **Empty state engageant** : Exemples de questions
- ✅ **Historique visible** : Conversations précédentes
- ✅ **Disclaimer** : "L'IA ne remplace pas un vétérinaire"

---

### 4.3 Feedback Utilisateur (Obligatoire)

#### **Après Chaque Action Critique**

| Action | Feedback Requis |
|--------|----------------|
| Ajouter animal | Toast "Animal ajouté" + Retour liste |
| Ajouter cas santé | Toast "Cas enregistré" + Retour liste |
| Enregistrer gestation | Toast "Gestation enregistrée" + Retour liste |
| Supprimer | Modal confirmation + Toast "Supprimé" |
| Synchronisation | Indicateur réseau (online/offline) |
| Erreur réseau | Toast erreur + Option retry |

**Règles** :
- **Toujours un feedback visuel** (toast, modal, changement d'état)
- **Message en français simple** : "Animal ajouté" pas "Success: Animal created"
- **Durée** : 3 secondes (succès), 5 secondes (erreur)

---

## 5. CHECKLIST D'AMÉLIORATIONS UI

### 5.1 Priorité Critique (P0)

#### **Web**

- [ ] **Unifier couleurs** : Remplacer tous les `bg-red-500`, `bg-amber-500` hardcodés par tokens design system
- [ ] **Standardiser cartes** : Même padding, border, shadow partout
- [ ] **Améliorer hiérarchie dashboard** : Carte principale plus grande, actions secondaires plus discrètes
- [ ] **Empty states** : Ajouter illustrations + CTA pour chaque module
- [ ] **Toasts** : Implémenter système de toasts pour toutes les actions CRUD

#### **Mobile**

- [ ] **Unifier palette** : Utiliser tokens design system (pas de `#007AFF`, `#2d6a4f` hardcodés)
- [ ] **Standardiser cartes** : Même StyleSheet pour toutes les cartes (stats, animaux, gestations)
- [ ] **Améliorer listes** : Hauteur minimum 64px, séparateurs visibles, badges de statut
- [ ] **Empty states** : Ajouter pour chaque écran (Cheptel, Santé, Repro, Alimentation)
- [ ] **Loading states** : Skeleton loaders pour listes et cartes
- [ ] **Error states** : Composants réutilisables pour erreurs réseau

---

### 5.2 Priorité Haute (P1)

#### **Web + Mobile**

- [ ] **Système d'icônes** : Documenter usage Lucide, créer mapping par module
- [ ] **Badges de statut** : Variantes cohérentes (success, warning, error, info)
- [ ] **Formulaires** : Labels toujours visibles, messages d'erreur clairs
- [ ] **Modals** : Structure standardisée (titre, description, actions)
- [ ] **Navigation** : Breadcrumbs ou titres de page clairs

#### **Mobile Spécifique**

- [ ] **Touch targets** : Vérifier tous les boutons ≥ 44px
- [ ] **Espacement** : Standardiser padding/margin (multiples de 4px)
- [ ] **Feedback tactile** : Animations légères au tap (scale, haptic si disponible)

---

### 5.3 Priorité Moyenne (P2)

- [ ] **Dark mode** : Tester et optimiser (si activé)
- [ ] **Accessibility** : Vérifier contrastes (outil : WebAIM Contrast Checker)
- [ ] **Animations** : Transitions subtiles (fade, slide) pour modals, navigation
- [ ] **Illustrations** : Créer illustrations simples pour empty states (ou utiliser emojis)

---

## 6. CONSEILS ACTIONNABLES

### 6.1 Implémentation Immédiate (Web)

#### **1. Créer fichier de tokens unifié**

```typescript
// lib/design-tokens.ts
export const tokens = {
  colors: {
    primary: {
      DEFAULT: "hsl(145, 50%, 25%)",      // #2d6a4f
      light: "hsl(145, 50%, 35%)",        // #40916c
      dark: "hsl(145, 50%, 15%)",         // #1b4332
    },
    // ... autres couleurs
  },
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "0.75rem",   // 12px
    base: "1rem",    // 16px
    lg: "1.25rem",   // 20px
    xl: "1.5rem",    // 24px
  },
  // ...
}
```

#### **2. Remplacer couleurs hardcodées**

```bash
# Rechercher et remplacer
bg-red-500 → bg-destructive
bg-amber-500 → bg-warning
bg-blue-500 → bg-info
bg-green-500 → bg-success
```

#### **3. Créer composants EmptyState réutilisables**

```tsx
// components/common/EmptyState.tsx
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  // ...
}
```

---

### 6.2 Implémentation Immédiate (Mobile)

#### **1. Créer fichier de styles unifié**

```typescript
// porkyfarm-mobile/lib/styles.ts
export const colors = {
  primary: "#2d6a4f",
  primaryLight: "#40916c",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  // ...
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
}
```

#### **2. Standardiser StyleSheet des cartes**

```typescript
// porkyfarm-mobile/lib/cardStyles.ts
export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // ...
})
```

#### **3. Créer composants réutilisables**

```typescript
// porkyfarm-mobile/components/EmptyState.tsx
// porkyfarm-mobile/components/LoadingSkeleton.tsx
// porkyfarm-mobile/components/ErrorState.tsx
```

---

### 6.3 Vérifications Qualité

#### **Checklist Avant Déploiement**

- [ ] **Contrastes** : Tous les textes ≥ 4.5:1 (outil : WebAIM)
- [ ] **Tailles de texte** : Minimum 14px mobile, 16px desktop
- [ ] **Touch targets** : Tous les boutons ≥ 44x44px mobile
- [ ] **Empty states** : Présents pour tous les modules
- [ ] **Error states** : Messages clairs, actions de retry
- [ ] **Loading states** : Skeletons ou spinners partout
- [ ] **Feedback** : Toast après chaque action CRUD
- [ ] **Navigation** : Breadcrumbs ou titres clairs
- [ ] **Cohérence** : Même palette, espacements, typo partout

---

## 📊 RÉSUMÉ EXÉCUTIF

### État Actuel

**Fonctionnel** : ✅ Solide  
**Design** : ⚠️ Incohérent, besoin de professionnalisation

### Actions Prioritaires

1. **Unifier palette** : Éliminer couleurs hardcodées, utiliser tokens
2. **Standardiser composants** : Cartes, boutons, inputs cohérents
3. **Améliorer feedback** : Toasts, empty states, error states
4. **Mobile-first** : Touch targets, espacements, hiérarchie claire

### Résultat Attendu

Une app **polie, professionnelle, prête production**, utilisable au quotidien par des éleveurs sur le terrain, avec un design cohérent entre web et mobile.

---

**Dernière mise à jour** : 2025-01-27  
**Maintenu par** : Design System Lead PorkyFarm

