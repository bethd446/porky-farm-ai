# PorkyFarm Mobile - Design Guidelines

**Version**: 2.0
**Derniere mise a jour**: 2025-12-31

---

## 1. Palette de couleurs

### Couleurs primaires
| Nom | Hex | Usage |
|-----|-----|-------|
| Primary | `#2D6A4F` | Boutons, liens, icones actives |
| Primary Light | `#40916C` | Hover states, gradients |
| Primary Lighter | `#52B788` | Backgrounds subtils |
| Primary Dark | `#1B4332` | Textes sur fond clair |
| Primary Surface | `#D8F3DC` | Backgrounds, badges, chips |

### Couleurs d'accent
| Nom | Hex | Usage |
|-----|-----|-------|
| Accent | `#E9C46A` | Elements dores, highlights |
| Accent Light | `#F4E4BA` | Backgrounds accent |

### Couleurs semantiques
| Nom | Hex | Usage |
|-----|-----|-------|
| Success | `#40916C` | Validation, etats positifs |
| Success Light | `#D1FAE5` | Backgrounds succes |
| Warning | `#E9C46A` | Alertes, attention |
| Warning Light | `#FEF3C7` | Backgrounds warning |
| Error | `#E76F51` | Erreurs, etats negatifs |
| Error Light | `#FEE2E2` | Backgrounds erreur |
| Info | `#457B9D` | Information, liens |
| Info Light | `#DBEAFE` | Backgrounds info |

### Couleurs neutres
| Nom | Hex | Usage |
|-----|-----|-------|
| Background | `#FAFDF7` | Fond principal |
| Surface | `#FFFFFF` | Cards, modals |
| Surface Elevated | `#F1F8F4` | Elements eleves |
| Text | `#1B4332` | Texte principal |
| Text Secondary | `#52796F` | Texte secondaire |
| Text Muted | `#95A5A0` | Texte desactive |
| Border | `#E8F0EB` | Bordures |
| Border Strong | `#C8DED3` | Bordures prononcees |

---

## 2. Typographie

### Echelle typographique
| Style | Taille | Poids | Usage |
|-------|--------|-------|-------|
| H1 | 28px | Bold (700) | Titres principaux |
| H2 | 22px | Semibold (600) | Sous-titres, headers ecrans |
| H3 | 18px | Semibold (600) | Titres de sections |
| H4 | 16px | Semibold (600) | Titres de cards |
| Body Large | 16px | Regular (400) | Texte principal |
| Body | 14px | Regular (400) | Texte standard |
| Body Small | 12px | Regular (400) | Texte secondaire |
| Caption | 12px | Regular (400) | Legendes, hints |
| Label | 14px | Medium (500) | Labels de formulaires |
| Button | 16px | Semibold (600) | Texte boutons |

### Hauteurs de ligne
- **Tight**: 1.2 (titres)
- **Normal**: 1.5 (corps)
- **Relaxed**: 1.75 (paragraphes)

---

## 3. Espacements

### Grille de spacing
| Token | Valeur | Usage |
|-------|--------|-------|
| xs | 4px | Marges internes tres petites |
| sm | 8px | Gaps entre elements proches |
| md | 16px | Padding standard, gaps |
| lg | 24px | Marges entre sections |
| xl | 32px | Grands espacements |
| xxl | 48px | Espacements majeurs |

### Espacements specifiques
| Token | Valeur | Usage |
|-------|--------|-------|
| cardPadding | 20px | Padding interne des cards |
| cardGap | 12px | Gap entre elements de card |
| sectionPadding | 24px | Padding sections |
| inputPadding | 14px | Padding champs de saisie |
| buttonPadding | 16px | Padding boutons |
| touchTarget | 48px | Taille minimum zone tactile |

---

## 4. Rayons de bordure

| Token | Valeur | Usage |
|-------|--------|-------|
| xs | 8px | Petits elements |
| sm | 12px | Inputs, chips |
| md | 16px | Cards, boutons |
| lg | 20px | Grands cards |
| xl | 28px | Modals |
| full | 9999px | Pills, badges ronds |

---

## 5. Ombres

### Niveaux d'elevation
```typescript
shadows.sm   // Elements subtils (cards)
shadows.md   // Elements moyens (popovers)
shadows.lg   // Elements importants (modals)
shadows.card // Specifique aux cards
shadows.button // Boutons primaires
```

### Definition des ombres
| Niveau | Offset Y | Blur | Opacity | Couleur |
|--------|----------|------|---------|---------|
| sm | 2px | 4px | 6% | #2D6A4F |
| md | 4px | 12px | 10% | #2D6A4F |
| lg | 8px | 24px | 15% | #2D6A4F |
| card | 2px | 8px | 4% | #1B4332 |
| button | 4px | 8px | 20% | #2D6A4F |

---

## 6. Composants UI

### Boutons
| Composant | Usage |
|-----------|-------|
| `PrimaryButton` | Action principale |
| `SecondaryButton` | Action secondaire |
| `OutlineButton` | Action tertiaire |
| `Button` (variant) | Composant unifie |

```tsx
<PrimaryButton title="Continuer" onPress={handleNext} />
<SecondaryButton title="Annuler" onPress={handleCancel} />
<Button variant="ghost" title="Ignorer" onPress={handleSkip} />
```

### Inputs
| Composant | Usage |
|-----------|-------|
| `TextField` | Champ texte standard |
| `SearchBar` | Barre de recherche |
| `Input` | Composant unifie |

```tsx
<TextField label="Nom" value={name} onChangeText={setName} />
<SearchBar value={query} onChangeText={setQuery} placeholder="Rechercher..." />
```

### Cards
| Composant | Usage |
|-----------|-------|
| `Card` | Container generique |
| `AnimalCard` | Carte animal |
| `StatCard` | Carte statistique |

```tsx
<Card variant="elevated">
  <Text>Contenu</Text>
</Card>

<AnimalCard
  tagNumber="PIG-001"
  category="sow"
  status="active"
  onPress={() => {}}
/>
```

### Feedback
| Composant | Usage |
|-----------|-------|
| `Badge` | Compteurs, notifications |
| `Chip` | Filtres, tags |
| `ProgressBar` | Progression |
| `StepIndicator` | Etapes |
| `EmptyState` | Etat vide |
| `ErrorState` | Etat erreur |

```tsx
<Badge label="3" variant="error" />
<Chip label="Truies" selected={true} onPress={() => {}} />
<ProgressBar progress={0.5} variant="gradient" />
<StepIndicator totalSteps={6} currentStep={2} />
```

---

## 7. Patterns d'ecrans

### Structure d'ecran standard
```
┌─────────────────────────┐
│  SafeAreaView           │
│  ┌───────────────────┐  │
│  │  ScreenHeader     │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │                   │  │
│  │  ScrollView/      │  │
│  │  FlatList         │  │
│  │                   │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  Footer/Actions   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### Structure onboarding
```
┌─────────────────────────┐
│  [←] ProgressBar        │
│       Etape X sur N     │
│                         │
│      ┌──────────┐       │
│      │  Icone   │       │
│      └──────────┘       │
│                         │
│      Titre court        │
│      Sous-titre         │
│                         │
│   ┌─────────────────┐   │
│   │     Input       │   │
│   └─────────────────┘   │
│                         │
│  [═══ Continuer ═══]    │
│       ● ○ ○ ○ ○ ○       │
└─────────────────────────┘
```

### Structure liste avec filtres
```
┌─────────────────────────┐
│  Titre        [Action]  │
│  [🔍 Rechercher...]     │
├─────────────────────────┤
│  Stats: [X] [Y] [Z]     │
│  Filtres ▼              │
│  [Chip] [Chip] [Chip]   │
├─────────────────────────┤
│  ┌─────────────────┐    │
│  │   ItemCard      │    │
│  └─────────────────┘    │
│  ┌─────────────────┐    │
│  │   ItemCard      │    │
│  └─────────────────┘    │
│                    [+]  │ ← FAB
└─────────────────────────┘
```

---

## 8. Animations

### Timings
| Type | Duree | Usage |
|------|-------|-------|
| Fast | 150ms | Feedbacks immediats |
| Normal | 250ms | Transitions standard |
| Slow | 400ms | Animations complexes |

### Springs
```typescript
spring: { damping: 15, stiffness: 400 }      // Standard
springBouncy: { damping: 10, stiffness: 300 } // Rebond
springSmooth: { damping: 20, stiffness: 350 } // Lisse
```

### Patterns d'animation
- **FadeIn**: Apparition d'elements
- **FadeInUp/Down**: Listes, formulaires
- **ScalePress**: Feedback boutons (scale: 0.96)
- **Spring**: Transitions fluides

---

## 9. Do's and Don'ts

### Do's
- Utiliser les tokens de design partout
- Respecter les touch targets (min 44x44)
- Ajouter des etats de chargement
- Utiliser les couleurs semantiques
- Animer les transitions
- Supporter le dark mode

### Don'ts
- Ne pas hardcoder les couleurs
- Ne pas utiliser de tailles en dessous de 12px
- Ne pas oublier les etats vides
- Ne pas nester trop de ScrollViews
- Ne pas ignorer les erreurs silencieusement
- Ne pas utiliser TouchableOpacity sans feedback

---

## 10. Accessibilite

### Regles
- Texte minimum 12px
- Contraste minimum 4.5:1
- Touch targets 44x44 minimum
- Labels sur tous les inputs
- States distincts (focus, disabled)

### Checklist
- [ ] `accessibilityLabel` sur les boutons
- [ ] `accessibilityRole` approprie
- [ ] `accessibilityState` pour les toggles
- [ ] Ordre de focus logique

---

## 11. Dark Mode

### Implementation
```tsx
const { colors, isDark } = useTheme()

<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Contenu</Text>
</View>
```

### Couleurs adaptatives
Toutes les couleurs sont definies dans `constants/colors.ts`:
- `lightColors` pour le mode clair
- `darkColors` pour le mode sombre

---

## 12. Imports

```typescript
// Tokens
import { colors, spacing, typography, radius, shadows, textStyles } from '@/lib/designTokens'

// Composants UI
import {
  PrimaryButton,
  SecondaryButton,
  TextField,
  Card,
  Badge,
  Chip,
  SearchBar,
  ProgressBar,
  StepIndicator,
  AnimalCard,
} from '@/components/ui'

// Animations
import { ScalePress, AnimatedList, Shimmer } from '@/components/animations'

// Theme
import { useTheme } from '@/contexts/ThemeContext'
```
