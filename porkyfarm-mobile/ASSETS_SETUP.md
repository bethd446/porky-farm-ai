# ✅ Structure Assets PorkyFarm - Configuration Complète

## 📁 Structure créée

```
assets/
├── branding/
│   ├── logo/
│   └── splash/
├── backgrounds/
│   ├── onboarding/
│   ├── auth/
│   └── dashboard/
├── icons/
│   ├── navigation/
│   ├── actions/
│   ├── status/
│   └── categories/
├── illustrations/
│   ├── empty-states/
│   └── onboarding/
├── animals/
├── feed/
│   ├── ingredients/
│   └── formulas/
├── health/
└── reproduction/
```

## 📄 Fichiers créés

✅ `assets/README.md` - Documentation complète des assets
✅ `constants/assets.ts` - Centralisation de tous les exports
✅ `lib/imageHelpers.ts` - Helpers pour récupérer les images
✅ `components/EmptyState.tsx` - Composant amélioré avec support images
✅ `scripts/generate-placeholders.js` - Script pour générer les placeholders

## 🚀 Utilisation

### 1. Importer les assets

```typescript
import { Assets, ActionIcons, NavIcons } from '@/constants/assets'
import { Image } from 'react-native'

// Utiliser directement
<Image source={ActionIcons.add} style={{ width: 24, height: 24 }} />
```

### 2. Utiliser les helpers

```typescript
import { getAnimalCategoryImage, getEmptyStateImage } from '@/lib/imageHelpers'

// Image selon catégorie
<Image source={getAnimalCategoryImage('truie')} />

// Image pour état vide
<Image source={getEmptyStateImage('cheptel')} />
```

### 3. Utiliser EmptyState amélioré

```typescript
import { EmptyState } from '@/components/EmptyState'

<EmptyState
  type="cheptel"
  title="Aucun animal"
  message="Ajoutez votre premier animal à votre cheptel"
  actionLabel="Ajouter un animal"
  onAction={() => router.push('/livestock/add')}
/>
```

## 📋 Checklist

- [x] Structure de dossiers créée
- [x] README.md créé
- [x] constants/assets.ts créé
- [x] lib/imageHelpers.ts créé
- [x] EmptyState.tsx amélioré
- [x] Script generate-placeholders.js créé
- [ ] Placeholders générés (exécuter: `node scripts/generate-placeholders.js`)
- [ ] Remplacer les placeholders par les vraies images
- [ ] Tester l'import dans les composants
- [ ] Vérifier qu'il n'y a pas de require() directs

## 🎨 Prochaines étapes

1. **Générer les placeholders** (si pas déjà fait):
   ```bash
   node scripts/generate-placeholders.js
   ```

2. **Remplacer les placeholders** par les vraies images:
   - Logos: Créer les logos PorkyFarm
   - Illustrations: Créer les illustrations empty-states
   - Icônes: Utiliser des icônes cohérentes (Ionicons ou custom)

3. **Optimiser les images**:
   - Redimensionner aux bonnes dimensions
   - Compresser via [TinyPNG](https://tinypng.com)
   - Vérifier le poids (< 300 KB pour illustrations)

4. **Tester**:
   ```bash
   npx expo start
   # Vérifier qu'il n'y a pas d'erreurs d'assets manquants
   ```

## 📚 Documentation

Voir `assets/README.md` pour la documentation complète.

