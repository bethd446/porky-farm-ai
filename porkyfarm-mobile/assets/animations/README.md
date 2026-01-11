# Animations Lottie - PorkyFarm

Configuration centralisee dans `lib/theme/animations.ts`

## Comment ajouter des animations

1. Aller sur [LottieFiles](https://lottiefiles.com/)
2. Rechercher l'animation avec les mots-cles ci-dessous
3. Telecharger en format **Lottie JSON** (pas dotLottie)
4. Renommer et placer dans le bon dossier
5. Importer dans `lib/theme/animations.ts`

## Structure des dossiers

```
assets/animations/
├── loading/          # Chargement (boucle)
│   ├── pig.json      # Animation principale
│   └── dots.json     # Fallback minimal
├── empty/            # Etats vides
│   ├── farm.json     # Pour cheptel
│   ├── box.json      # Generique
│   └── search.json   # Recherche sans resultat
├── feedback/         # Retours utilisateur
│   ├── success.json  # Validation
│   ├── error.json    # Erreur
│   └── confetti.json # Celebration
└── decorative/       # Icones animees
    ├── pig-happy.json
    ├── heart.json
    ├── coins.json
    ├── calendar.json
    ├── bell.json
    ├── pregnant.json
    └── food.json
```

## Animations requises

| Fichier | Recherche LottieFiles | Taille max | Couleur |
|---------|----------------------|------------|---------|
| loading/pig.json | "pig walking cute" | 50KB | #10B981 |
| loading/dots.json | "dots loading minimal" | 20KB | #10B981 |
| empty/farm.json | "farm barn empty" | 50KB | #10B981 |
| empty/box.json | "empty box cute" | 30KB | #9CA3AF |
| empty/search.json | "search not found" | 30KB | #9CA3AF |
| feedback/success.json | "success checkmark green" | 30KB | #10B981 |
| feedback/error.json | "error alert red" | 30KB | #EF4444 |
| feedback/confetti.json | "confetti celebration" | 50KB | Multi |
| decorative/pig-happy.json | "pig happy cute" | 50KB | #EC4899 |
| decorative/heart.json | "heartbeat health" | 30KB | #EF4444 |
| decorative/coins.json | "coins money gold" | 30KB | #F59E0B |
| decorative/calendar.json | "calendar check" | 30KB | #3B82F6 |
| decorative/bell.json | "bell notification ring" | 20KB | #F59E0B |
| decorative/pregnant.json | "pregnant belly" | 40KB | #EC4899 |
| decorative/food.json | "food bowl pet" | 30KB | #F59E0B |

## Modifier les couleurs

Palette PorkyFarm a respecter:

| Usage | Couleur |
|-------|---------|
| Primary (brand) | #10B981 |
| Warning | #F59E0B |
| Error | #EF4444 |
| Info | #3B82F6 |
| Truie | #EC4899 |
| Neutral | #9CA3AF |

Utiliser l'editeur LottieFiles pour changer les couleurs avant telechargement.

## Exemple d'import

Apres avoir telecharge une animation:

```typescript
// lib/theme/animations.ts

// 1. Importer le fichier JSON
import loadingPig from '../../assets/animations/loading/pig.json'
import emptyFarm from '../../assets/animations/empty/farm.json'

// 2. Assigner dans animationSources
const animationSources: Record<AnimationType, any> = {
  'loading-pig': loadingPig,  // Maintenant disponible
  'empty-farm': emptyFarm,    // Maintenant disponible
  // ...
}
```

## Utilisation dans les composants

```tsx
import { getAnimation, isAnimationAvailable } from '@/lib/theme/animations'
import LottieView from 'lottie-react-native'
import { ActivityIndicator } from 'react-native'

function LoadingState() {
  const animation = getAnimation('loading-pig')

  // Fallback si animation pas encore telechargee
  if (!isAnimationAvailable('loading-pig')) {
    return <ActivityIndicator size="large" color="#10B981" />
  }

  return (
    <LottieView
      source={animation.source}
      style={{ width: animation.defaultSize, height: animation.defaultSize }}
      autoPlay
      loop={animation.loop}
      speed={animation.speed}
    />
  )
}
```

## Priorite de telechargement

1. **Critique** - loading/pig.json (premiere impression)
2. **Important** - empty/farm.json, feedback/success.json
3. **Nice to have** - decorative/*

## Performance

- Garder les fichiers < 50KB
- Preferer les animations simples (moins de layers)
- Eviter les animations avec images embedded
- Tester sur appareil Android milieu de gamme
