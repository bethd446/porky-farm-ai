# Migration Moti → React Native Animated

## Date: 2026-01-19

## Contexte
Les composants animés de PorkyFarm utilisent Moti (wrapper Reanimated).
Décision: migrer vers React Native Animated natif pour réduire les dépendances.

## Architecture

```
hooks/
└── useAnimations.ts        # Hooks réutilisables

components/ui/
├── AnimatedButton.tsx      # Refactoré
├── AnimatedCard.tsx        # Refactoré
├── AnimatedFAB.tsx         # Refactoré
├── AnimatedList.tsx        # Refactoré
├── AnimatedBadge.tsx       # NOUVEAU
└── [autres]
```

## Hooks Créés

| Hook | Usage |
|------|-------|
| useAnimatedValue | Créer une valeur animée |
| useFadeIn | Apparition en fondu |
| useScalePress | Feedback tactile |
| useSlideIn | Entrée par glissement |
| useListItemAnimation | Stagger effect |
| usePulse | Pulsation (alertes) |
| useShake | Secousse (erreur) |

## Plan d'Exécution

- [x] BATCH 1: hooks/useAnimations.ts
- [x] BATCH 2: AnimatedButton, AnimatedCard, AnimatedFAB
- [x] BATCH 3: AnimatedList, AnimatedBadge (nouveau)
- [x] BATCH 4: QuickActionButton, MenuListItem, StatCard
- [x] BATCH 5: Écrans (GestationAlerts, index, plus)

## Résultat Final

- **Moti imports restants:** 0
- **Erreurs TypeScript:** 0
- **Fichiers migrés:** 11
- **Nouveau composant:** AnimatedBadge avec pulse

## Règles

```typescript
// TOUJOURS
useNativeDriver: true
useRef(new Animated.Value()).current

// JAMAIS
useNativeDriver: false (sauf layout)
```
