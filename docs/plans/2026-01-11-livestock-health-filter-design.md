# Design: Filtre santé + Badge critique - Écran Mon Cheptel

**Date:** 2026-01-11
**Statut:** Validé
**Écran:** `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`

## Objectif

Améliorer l'écran "Mon Cheptel" pour permettre aux éleveurs d'identifier rapidement les animaux nécessitant une attention sanitaire.

## Décisions de design

| Question | Choix |
|----------|-------|
| Type d'indicateur | Badge individuel sur cartes + compteur global en header |
| Filtre santé | Binaire : "Sains" vs "Avec cas ouvert" |
| Badge carte | Remplace le statut par sévérité santé si cas ouvert |
| Compteur global | Enrichir chip "Malades" existant |

## Architecture des données

### Flux de données

```
┌─────────────────┐     ┌──────────────────────┐
│ animalsService  │     │ healthCasesService   │
│   .getAll()     │     │   .getOpenCases()    │
└────────┬────────┘     └──────────┬───────────┘
         │                         │
         └──────────┬──────────────┘
                    ▼
         ┌──────────────────────┐
         │ Merge: animal + cas  │
         │ ouvert par animal_id │
         └──────────────────────┘
                    ▼
         ┌──────────────────────┐
         │ AnimalWithHealth[]   │
         │ - ...Animal          │
         │ - healthSeverity?    │
         │ - hasOpenCase: bool  │
         └──────────────────────┘
```

### Nouveau type enrichi

```typescript
interface AnimalWithHealth extends Animal {
  healthSeverity?: 'critical' | 'high' | 'medium' | 'low' | null
  hasOpenCase: boolean
}
```

La jointure se fait côté client avec un `Map<animal_id, severity>` construit depuis `getOpenCases()`. Si un animal a plusieurs cas ouverts, on garde la sévérité la plus haute.

## Modifications UI

### 1. Chip "Malades" enrichi (header stats)

Le chip existant devient dynamique :

| Condition | Affichage | Style |
|-----------|-----------|-------|
| `critical > 0` | "X Critiques" | Rouge pulsant |
| `critical = 0 && total > 0` | "X Malades" | Orange |
| `total = 0` | Masqué | - |

### 2. AnimalCard - Badge statut conditionnel

```
Si hasOpenCase = true:
  └─ severity = 'critical' → Badge "Critique" (rouge)
  └─ severity = 'high'     → Badge "Urgent" (orange)
  └─ severity = 'medium'   → Badge "Malade" (jaune)
  └─ severity = 'low'      → Badge "Suivi" (bleu)

Si hasOpenCase = false:
  └─ Afficher le badge statut normal (Sain, Gestante, etc.)
```

### 3. Nouveau filtre santé

Remplace le filtre statut actuel :

```typescript
const healthFilters = [
  { label: 'Tous', value: 'all' },
  { label: 'Sains', value: 'healthy' },
  { label: 'Avec cas ouvert', value: 'sick' },
]
```

## Plan d'implémentation

### Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `livestock/index.tsx` | Fetch `getOpenCases()`, merge données, nouveau filtre, stats enrichies |
| `components/ui/AnimalCard.tsx` | Nouvelle prop `healthSeverity?`, logique badge conditionnelle |

### Étapes

1. **AnimalCard.tsx**
   - Ajouter prop `healthSeverity?: 'critical'|'high'|'medium'|'low'`
   - Modifier logique statusConfig pour prioriser santé
   - Ajouter variants badge: "Critique", "Urgent", "Suivi"

2. **livestock/index.tsx**
   - Import `healthCasesService`
   - Fetch parallèle: animals + openCases
   - Créer `Map<animal_id, severity>` (garder max severity)
   - Enrichir animals avec `hasOpenCase` + `healthSeverity`
   - Remplacer `statusFilters` par `healthFilters`
   - Modifier `stats.sick` → compter par severity (critiques vs autres)
   - Modifier chip "Malades" → affichage conditionnel
   - Passer `healthSeverity` à `AnimalCard`

### Contraintes

- Aucun nouveau fichier créé
- Aucune nouvelle dépendance npm
- Compatible design system existant (designTokens)
