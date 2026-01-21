# 📁 PorkyFarm Assets

Structure d'assets professionnelle pour l'application PorkyFarm.

---

## 📂 Structure

```
assets/
├── branding/           # Logos et splash screens
│   ├── logo/
│   └── splash/
├── backgrounds/        # Images de fond
│   ├── onboarding/
│   ├── auth/
│   └── dashboard/
├── icons/              # Icônes de l'application
│   ├── navigation/     # Icônes tab bar
│   ├── actions/        # Icônes boutons
│   ├── status/         # États (success, error...)
│   └── categories/     # Catégories animaux
├── illustrations/      # Illustrations
│   ├── empty-states/   # États vides
│   └── onboarding/     # Onboarding
├── animals/            # Images animaux
├── feed/               # Alimentation
│   ├── ingredients/
│   └── formulas/
├── health/             # Santé
└── reproduction/       # Reproduction
```

---

## 📐 Spécifications par type

### Logos
| Fichier | Taille | Format | Usage |
|---------|--------|--------|-------|
| logo.png | 1024×1024 | PNG | App icon |
| logo-horizontal.png | 512×128 | PNG | Headers |
| logo-icon.png | 256×256 | PNG | Favicon |

### Splash Screen
| Fichier | Taille | Format |
|---------|--------|--------|
| splash.png | 1284×2778 | PNG |

### Backgrounds
| Usage | Taille | Format |
|-------|--------|--------|
| Portrait | 1080×1920 | PNG/WebP |
| Header | 1080×400 | PNG |

### Icônes
| Taille source | Format | Nommage |
|---------------|--------|---------|
| 256×256 | PNG | kebab-case |

### Illustrations
| Taille | Format | Poids max |
|--------|--------|-----------|
| 800×600 | PNG | 300 KB |

---

## 📝 Règles de nommage

- Tout en **minuscules**
- Utiliser le **kebab-case** : `empty-cheptel.png`
- Être **explicite** : `pig-truie.png` plutôt que `pig1.png`
- Pas d'espaces ni caractères spéciaux

### Exemples
✅ `logo-horizontal.png`
✅ `empty-feed.png`
✅ `icon-add.png`
❌ `Logo Horizontal.png`
❌ `emptyFeed.PNG`
❌ `icon_add.png`

---

## 🎨 Palette de couleurs

| Nom | Hex | Usage |
|-----|-----|-------|
| Primary | #10B981 | Boutons, liens |
| Success | #22C55E | Confirmations |
| Warning | #F59E0B | Alertes |
| Error | #EF4444 | Erreurs |
| Info | #3B82F6 | Informations |
| Pink | #EC4899 | Truies, femelles |
| Purple | #8B5CF6 | Verrats, mâles |
| Orange | #F97316 | Porcelets |

---

## ➕ Ajouter un nouvel asset

1. **Choisir le bon dossier** selon le type
2. **Respecter les dimensions** recommandées
3. **Nommer correctement** en kebab-case
4. **Optimiser le poids** (tinypng.com)
5. **Ajouter l'export** dans `constants/assets.ts`
6. **Tester** que l'image charge sans warning

---

## 🔧 Import dans le code

```typescript
// ❌ Ne pas faire
<Image source={require('../assets/icons/add.png')} />

// ✅ Faire
import { Icons } from '@/constants/assets'
<Image source={Icons.add} />
```

---

## 📦 Optimisation

Avant d'ajouter une image :
1. Redimensionner aux bonnes dimensions
2. Compresser via [TinyPNG](https://tinypng.com)
3. Vérifier le poids final (< 300 KB pour illustrations)
4. Tester sur simulateur iOS et Android
