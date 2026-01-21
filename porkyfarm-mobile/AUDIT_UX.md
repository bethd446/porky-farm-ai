# Audit UX/UI - PorkyFarm Mobile

**Date**: 2025-12-31
**Version**: 1.0

---

## 1. Vue d'ensemble du projet

### Structure actuelle
- **Framework**: Expo React Native avec expo-router
- **Backend**: Supabase
- **Design System**: Partiellement implemente avec designTokens.ts
- **Theming**: Support dark mode via ThemeContext

### Fichiers cles
| Type | Fichiers |
|------|----------|
| Design Tokens | `lib/designTokens.ts`, `constants/colors.ts`, `constants/theme.ts` |
| Composants UI | `components/ui/*.tsx` |
| Animations | `components/animations/*.tsx` |
| Ecrans | `app/(tabs)/**`, `app/onboarding/**`, `app/(auth)/**` |

---

## 2. Audit par ecran

### 2.1 Onboarding (steps 1-6)

| Critere | Note | Observations |
|---------|------|--------------|
| Hierarchie visuelle | 7/10 | Titres bien dimensionnes, mais manque de sous-titres explicatifs |
| Espacements | 6/10 | Padding inconsistant entre les etapes |
| Touch targets | 7/10 | Boutons OK, mais back button petit (padding: 8) |
| Etats UI | 5/10 | Loading basique, pas d'animation de transition |
| Progression | 6/10 | Indicateur textuel "Etape X sur 6" peu visible |
| Accessibilite | 5/10 | Pas de labels accessibilityLabel |

**Points faibles**:
- Pas d'indicateur de progression visuel (dots ou barre)
- Transitions abruptes entre etapes
- Bouton retour trop discret
- Pas de validation visuelle des champs

**Ameliorations proposees**:
- [ ] Ajouter barre de progression animee en haut
- [ ] Transitions FadeIn/SlideIn entre etapes
- [ ] Agrandir zone tactile du bouton retour (min 44x44)
- [ ] Ajouter validation inline avec icones succes/erreur

---

### 2.2 Dashboard (index.tsx)

| Critere | Note | Observations |
|---------|------|--------------|
| Hierarchie visuelle | 8/10 | Bon header, stats bien organises |
| Espacements | 8/10 | Grid coherent, gaps uniformes |
| Touch targets | 9/10 | Excellents targets avec ScalePress |
| Etats UI | 8/10 | Skeleton loading, refresh, error state |
| Micro-interactions | 9/10 | Animations premium avec AnimatedList |
| Coherence | 8/10 | Design coherent, palette respectee |

**Points faibles**:
- Banniere IA prend beaucoup de place
- Section "Animaux recents" pourrait etre plus compacte
- Pas de notification/badge sur les stats

**Ameliorations proposees**:
- [ ] Ajouter badges d'alerte sur stats (ex: "3 a traiter")
- [ ] Compacter les AnimalCards (moins de padding)
- [ ] Ajouter pull-to-refresh visual feedback

---

### 2.3 Mon Cheptel (livestock/index.tsx)

| Critere | Note | Observations |
|---------|------|--------------|
| Hierarchie visuelle | 5/10 | Liste plate sans categories |
| Espacements | 6/10 | Cards basiques, peu de hierarchie |
| Touch targets | 6/10 | TouchableOpacity simple |
| Etats UI | 5/10 | ActivityIndicator seul, pas de skeleton |
| Filtres | 3/10 | Aucun filtre visible |
| Recherche | 0/10 | Pas de barre de recherche |

**Points faibles**:
- Pas de filtre par categorie/statut
- Pas de barre de recherche
- Cards tres basiques sans avatar/image
- Loading state minimal
- Pas de tri (recents, nom, statut)

**Ameliorations proposees**:
- [ ] Ajouter barre de recherche sticky en haut
- [ ] Ajouter filtres par segment (Truies, Verrats, Porcelets, Engraissement)
- [ ] Refaire AnimalCard avec avatar, status badge, chevron
- [ ] Ajouter skeleton loading
- [ ] FAB pour ajout rapide

---

### 2.4 Detail Animal (livestock/[id].tsx)

| Critere | Note | Observations |
|---------|------|--------------|
| Hierarchie visuelle | 6/10 | Info basique sans sections claires |
| Navigation | 5/10 | Pas d'actions rapides |
| Etats UI | 5/10 | Loading basique |
| Actions | 4/10 | Boutons edition peu visibles |

**Ameliorations proposees**:
- [ ] Header hero avec photo/avatar animal
- [ ] Tabs pour sections (Info, Sante, Historique)
- [ ] Actions FAB (Modifier, Sante, Alimentation)
- [ ] Timeline des evenements

---

### 2.5 Assistant IA (ai-assistant.tsx)

| Critere | Note | Observations |
|---------|------|--------------|
| Hierarchie visuelle | 6/10 | Bulles differenciees |
| Espacements | 6/10 | Gap correct |
| Touch targets | 7/10 | Bouton envoyer OK |
| Etats UI | 6/10 | Loading inline |
| UX chat | 5/10 | Pas de suggestions, pas d'historique |

**Points faibles**:
- Couleur texte user sur fond vert = lisibilite reduite
- Pas de suggestions de questions
- Pas de scroll auto vers le dernier message
- Pas de feedback de "typing"

**Ameliorations proposees**:
- [ ] Texte blanc sur bulle user (lisibilite)
- [ ] Ajouter chips de suggestions en bas
- [ ] Animation "typing" pour reponse IA
- [ ] Auto-scroll vers le bas
- [ ] Bouton pour remonter en haut

---

### 2.6 Rapports (reports/index.tsx)

| Critere | Note | Observations |
|---------|------|--------------|
| Hierarchie visuelle | N/A | A auditer |
| Graphiques | N/A | A auditer |
| Filtres dates | N/A | A auditer |

---

### 2.7 Profil (profile/index.tsx)

| Critere | Note | Observations |
|---------|------|--------------|
| Hierarchie visuelle | 7/10 | Avatar, sections claires |
| Theme toggle | 8/10 | Bien implemente |
| Actions | 6/10 | Bouton logout bien visible |

**Points faibles**:
- SaveAccountCard peut etre intrusif
- Pas assez de sections (notifications, langue, aide)

**Ameliorations proposees**:
- [ ] Ajouter section Aide/Support
- [ ] Ajouter section Notifications
- [ ] Reorganiser en listes avec icones

---

## 3. Audit du Design System

### 3.1 Tokens actuels (designTokens.ts)

| Token | Status | Observation |
|-------|--------|-------------|
| colors | OK | Palette complete, semantique |
| spacing | OK | Echelle coherente |
| typography | Partiel | Manque styles composes (h1, body, etc) |
| radius | OK | Echelle 8-12-16-20-28 |
| shadows | OK | sm/md/lg bien definis |
| animation | Partiel | Manque easing functions |

### 3.2 Composants UI existants

| Composant | Status | A ameliorer |
|-----------|--------|-------------|
| PrimaryButton | OK | Ajouter haptic feedback |
| SecondaryButton | OK | - |
| OutlineButton | OK | - |
| TextField | OK | Ajouter validation states |
| Card | OK | Deja anime |
| ScreenContainer | Basique | Ajouter SafeAreaView automatique |
| ScreenHeader | OK | - |
| EmptyState | Excellent | Animations, actions |
| ErrorState | OK | - |

### 3.3 Composants manquants

| Composant | Priorite | Description |
|-----------|----------|-------------|
| GhostButton | Haute | Action tertiaire |
| DestructiveButton | Haute | Actions dangereuses |
| TextArea | Moyenne | Champ multiligne style |
| Select/Picker | Haute | Selection uniforme |
| Chip/Tag | Haute | Filtres, tags |
| Badge | Haute | Notifications, compteurs |
| Divider | Basse | Separateur sections |
| LoadingOverlay | Moyenne | Loading plein ecran |
| ActionSheet | Haute | Menu actions bottom |
| ProgressBar | Moyenne | Progression onboarding |
| Toast amélioré | Moyenne | Feedback utilisateur |

---

## 4. Problemes de coherence identifies

### 4.1 Styles dupliques
- `elevation.ts` vs `shadows` dans designTokens.ts
- `theme.ts` dans constants vs designTokens.ts
- Couleurs definies dans plusieurs fichiers

### 4.2 Patterns inconsistants
- Certains ecrans utilisent TouchableOpacity, d'autres Pressable
- Loading states: ActivityIndicator seul vs Skeleton
- Pas de pattern uniforme pour les listes (FlatList vs ScrollView)

### 4.3 Dark mode
- ThemeContext implemente mais pas utilise partout
- Certains ecrans utilisent colors.* directement (ne suit pas le theme)

---

## 5. Plan d'action priorite

### Phase 1 - Design System (immediat)
1. Consolider les fichiers de tokens en un seul source of truth
2. Ajouter composants manquants (Badge, Chip, ActionSheet)
3. Implementer typography composee

### Phase 2 - Ecrans prioritaires
1. **Livestock/index.tsx** - Ajouter recherche, filtres, meilleures cards
2. **Onboarding** - Indicateur de progression, transitions
3. **AI Assistant** - Suggestions, meilleure lisibilite

### Phase 3 - Polish
1. Dark mode complet sur tous les ecrans
2. Animations de transition entre ecrans
3. Haptic feedback partout

---

## 6. Metriques de succes

| Metrique | Avant | Cible |
|----------|-------|-------|
| Touch targets < 44px | ~15% | 0% |
| Ecrans sans loading state | 40% | 0% |
| Coherence design system | 60% | 95% |
| Couverture dark mode | 70% | 100% |
| Composants reutilisables | 12 | 20+ |

---

## 7. Ressources

- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design 3](https://m3.material.io/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
