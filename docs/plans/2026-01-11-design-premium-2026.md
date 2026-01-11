# Design Premium 2026 - PorkyFarm

**Date:** 2026-01-11
**Statut:** Validé
**Objectif:** Transformer PorkyFarm en app premium avec glassmorphism, animations Lottie et dark mode

---

## Décisions de design

| Aspect | Choix |
|--------|-------|
| Style | Glassmorphism subtil (blur 10-15px) |
| Animations | Immersif (~15 Lottie animations) |
| Palette | Catégorielle (couleurs par type animal) |
| Dark mode | Auto (suit préférences système) |

---

## Design Tokens

### Couleurs

```typescript
const colors = {
  // Brand (Vert)
  brand: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',  // PRIMARY
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Catégories animaux
  category: {
    truie: '#EC4899',      // pink-500
    verrat: '#8B5CF6',     // violet-500
    porcelet: '#F59E0B',   // amber-500
    engraissement: '#059669', // emerald-600
  },

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Light mode
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
  },

  // Dark mode
  dark: {
    background: '#111827',
    surface: '#1F2937',
    surfaceElevated: '#374151',
    border: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#6B7280',
  },
}
```

### Glassmorphism

```typescript
const glass = {
  light: {
    background: 'rgba(255, 255, 255, 0.85)',
    blur: 12,
    border: 'rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: 'rgba(31, 41, 55, 0.85)',
    blur: 12,
    border: 'rgba(255, 255, 255, 0.1)',
  },
}
```

### Spacing & Typography

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
}

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
}

const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
  },
}
```

---

## Architecture Composants

```
components/
├── ui/                      # Composants de base
│   ├── GlassCard.tsx
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── StatCard.tsx
│   ├── FilterChips.tsx
│   └── FAB.tsx
│
├── feedback/                # États et retours visuels
│   ├── LottieWrapper.tsx
│   ├── LoadingScreen.tsx
│   ├── LoadingInline.tsx
│   ├── EmptyState.tsx
│   ├── SuccessAnimation.tsx
│   └── ErrorAnimation.tsx
│
├── cards/                   # Cards métier
│   ├── AnimalCard.tsx
│   ├── AlertCard.tsx
│   └── ...
│
└── layout/
    └── Screen.tsx
```

---

## Animations Lottie (15)

| Fichier | Usage | Taille max |
|---------|-------|------------|
| loading/pig.json | Loading plein écran | 50KB |
| loading/dots.json | Loading inline | 20KB |
| empty/farm.json | Cheptel vide | 50KB |
| empty/box.json | Liste vide | 30KB |
| empty/search.json | Aucun résultat | 30KB |
| feedback/success.json | Action réussie | 30KB |
| feedback/error.json | Erreur | 30KB |
| feedback/confetti.json | Célébration | 50KB |
| decorative/pig-happy.json | Dashboard | 50KB |
| decorative/heart.json | Santé | 30KB |
| decorative/coins.json | Finances | 30KB |
| decorative/calendar.json | Tâches | 30KB |
| decorative/bell.json | Notifications | 20KB |
| decorative/pregnant.json | Gestations | 40KB |
| decorative/food.json | Alimentation | 30KB |

**Total estimé: ~500KB**

---

## Plan d'implémentation

### Batch 1: Fondations
- Créer `lib/theme/tokens.ts`
- Créer `lib/theme/animations.ts`
- Mettre à jour `contexts/ThemeContext.tsx`

### Batch 2: Composants Feedback
- Télécharger animations Lottie
- Créer `LottieWrapper.tsx`
- Refactorer `LoadingScreen.tsx`
- Refactorer `EmptyState.tsx`
- Créer `SuccessAnimation.tsx`

### Batch 3: Composants UI
- Créer `GlassCard.tsx`
- Refactorer `Button.tsx`
- Refactorer `StatCard.tsx`
- Créer `AlertCard.tsx`

### Batch 4: Intégration
- Refactorer Dashboard
- Appliquer sur tous les écrans
- Tester dark mode

---

## Contraintes techniques

- Lottie max 50KB par fichier
- Blur CSS via `@react-native-community/blur` ou shadow fallback
- Dark mode via `useColorScheme()` + Context
- Animations 60fps cible
