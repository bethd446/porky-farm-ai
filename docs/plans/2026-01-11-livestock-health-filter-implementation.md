# Filtre Santé + Badge Critique - Plan d'Implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajouter un filtre santé binaire et des badges de sévérité sur l'écran Mon Cheptel pour identifier rapidement les animaux nécessitant attention.

**Architecture:** Fetch parallèle animals + healthCases, merge côté client avec Map pour performance O(n), badge conditionnel basé sur sévérité max.

**Tech Stack:** React Native, Expo SDK 52, TypeScript, Supabase

**Design Doc:** `docs/plans/2026-01-11-livestock-health-filter-design.md`

---

## Considérations Sécurité

| Risque | Mitigation |
|--------|------------|
| Injection via severity | Validation whitelist des valeurs severity |
| Données null/undefined | Guards défensifs avec fallbacks |
| Exposition animal_id | Déjà filtré par farm_id via RLS |
| Performance DOS | Limite implicite par farm_id |

---

## Task 1: Créer le helper de merge sécurisé

**Files:**
- Create: `porkyfarm-mobile/lib/animalHealthHelpers.ts`

**Step 1: Créer le fichier helper avec types stricts**

```typescript
/**
 * Animal Health Helpers - Merge sécurisé animals + health cases
 * =============================================================
 */

import type { Animal } from '../services/animals'
import type { HealthCase } from '../services/healthCases'

// Types stricts pour la sévérité
export type HealthSeverity = 'critical' | 'high' | 'medium' | 'low'

// Whitelist des sévérités valides (sécurité)
const VALID_SEVERITIES: readonly HealthSeverity[] = ['critical', 'high', 'medium', 'low'] as const

// Ordre de priorité (index plus bas = plus critique)
const SEVERITY_PRIORITY: Record<HealthSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export interface AnimalWithHealth extends Animal {
  healthSeverity: HealthSeverity | null
  hasOpenCase: boolean
}

export interface HealthStats {
  total: number
  healthy: number
  withCases: number
  critical: number
  high: number
  medium: number
  low: number
}

/**
 * Valide et sanitize une valeur de sévérité
 * Retourne null si invalide (défense contre injection)
 */
function sanitizeSeverity(value: unknown): HealthSeverity | null {
  if (typeof value !== 'string') return null
  const normalized = value.toLowerCase().trim()
  return VALID_SEVERITIES.includes(normalized as HealthSeverity)
    ? (normalized as HealthSeverity)
    : null
}

/**
 * Compare deux sévérités, retourne la plus critique
 */
function getMaxSeverity(a: HealthSeverity | null, b: HealthSeverity | null): HealthSeverity | null {
  if (!a) return b
  if (!b) return a
  return SEVERITY_PRIORITY[a] <= SEVERITY_PRIORITY[b] ? a : b
}

/**
 * Construit une Map animal_id -> max severity depuis les cas ouverts
 * Sécurité: valide chaque sévérité avant insertion
 */
export function buildSeverityMap(openCases: HealthCase[]): Map<string, HealthSeverity> {
  const map = new Map<string, HealthSeverity>()

  for (const healthCase of openCases) {
    // Guard: ignorer les cas sans animal_id
    if (!healthCase.animal_id) continue

    // Sanitize la sévérité (protection injection)
    const sanitized = sanitizeSeverity(healthCase.severity)
    if (!sanitized) continue

    // Garder la sévérité max pour cet animal
    const existing = map.get(healthCase.animal_id)
    const max = getMaxSeverity(existing ?? null, sanitized)
    if (max) {
      map.set(healthCase.animal_id, max)
    }
  }

  return map
}

/**
 * Enrichit les animaux avec les données de santé
 * Retourne une nouvelle liste (immutable)
 */
export function mergeAnimalsWithHealth(
  animals: Animal[],
  severityMap: Map<string, HealthSeverity>
): AnimalWithHealth[] {
  return animals.map((animal) => {
    const severity = severityMap.get(animal.id) ?? null
    return {
      ...animal,
      healthSeverity: severity,
      hasOpenCase: severity !== null,
    }
  })
}

/**
 * Calcule les statistiques de santé du cheptel
 */
export function computeHealthStats(animals: AnimalWithHealth[]): HealthStats {
  const stats: HealthStats = {
    total: animals.length,
    healthy: 0,
    withCases: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  for (const animal of animals) {
    if (!animal.hasOpenCase) {
      stats.healthy++
    } else {
      stats.withCases++
      switch (animal.healthSeverity) {
        case 'critical':
          stats.critical++
          break
        case 'high':
          stats.high++
          break
        case 'medium':
          stats.medium++
          break
        case 'low':
          stats.low++
          break
      }
    }
  }

  return stats
}
```

**Step 2: Vérifier la syntaxe**

Run: `cd porkyfarm-mobile && npx tsc lib/animalHealthHelpers.ts --noEmit`
Expected: Aucune erreur

**Step 3: Commit**

```bash
git add porkyfarm-mobile/lib/animalHealthHelpers.ts
git commit -m "feat(health): add secure animal-health merge helpers

- Whitelist validation for severity values
- Map-based O(n) merge algorithm
- Immutable data transformations
- Health stats computation"
```

---

## Task 2: Modifier AnimalCard avec prop healthSeverity

**Files:**
- Modify: `porkyfarm-mobile/components/ui/AnimalCard.tsx`

**Step 1: Ajouter le type et la config de sévérité**

Après la ligne 14 (après `type AnimalCategory`), ajouter:

```typescript
type HealthSeverity = 'critical' | 'high' | 'medium' | 'low'
```

Après `statusConfig` (ligne 36), ajouter:

```typescript
const healthSeverityConfig: Record<HealthSeverity, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  critical: { label: 'Critique', variant: 'error' },
  high: { label: 'Urgent', variant: 'warning' },
  medium: { label: 'Malade', variant: 'warning' },
  low: { label: 'Suivi', variant: 'info' },
}
```

**Step 2: Ajouter la prop healthSeverity à l'interface**

Modifier `AnimalCardProps` (ligne 16-27):

```typescript
interface AnimalCardProps {
  id: string
  tagNumber: string
  name?: string
  category: AnimalCategory
  status: AnimalStatus
  healthSeverity?: HealthSeverity | null  // AJOUT
  age?: string
  weight?: number
  photoUrl?: string | null
  onPress: () => void
  style?: ViewStyle
}
```

**Step 3: Modifier la fonction AnimalCard pour utiliser healthSeverity**

Modifier les paramètres de la fonction (ligne 52):

```typescript
export function AnimalCard({
  id,
  tagNumber,
  name,
  category,
  status,
  healthSeverity,  // AJOUT
  age,
  weight,
  photoUrl,
  onPress,
  style,
}: AnimalCardProps) {
  // Priorité: healthSeverity > status
  const statusInfo = healthSeverity
    ? healthSeverityConfig[healthSeverity]
    : (statusConfig[status] || statusConfig.active)
  const categoryLabel = categoryLabels[category] || category
```

**Step 4: Vérifier la syntaxe**

Run: `cd porkyfarm-mobile && npx tsc components/ui/AnimalCard.tsx --noEmit`
Expected: Aucune erreur

**Step 5: Commit**

```bash
git add porkyfarm-mobile/components/ui/AnimalCard.tsx
git commit -m "feat(AnimalCard): add healthSeverity prop for health badge

- New healthSeverityConfig with Critique/Urgent/Malade/Suivi labels
- Health severity takes priority over animal status
- Backwards compatible (healthSeverity optional)"
```

---

## Task 3: Modifier livestock/index.tsx - Imports et Types

**Files:**
- Modify: `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`

**Step 1: Ajouter les imports**

Après la ligne 11 (`import { animalsService...`), ajouter:

```typescript
import { healthCasesService } from '../../../services/healthCases'
import {
  buildSeverityMap,
  mergeAnimalsWithHealth,
  computeHealthStats,
  type AnimalWithHealth,
  type HealthSeverity,
} from '../../../lib/animalHealthHelpers'
```

**Step 2: Modifier le type FilterStatus**

Remplacer les lignes 30-31 et 40-45:

```typescript
type FilterHealth = 'all' | 'healthy' | 'sick'

// Remplacer statusFilters par healthFilters
const healthFilters: { label: string; value: FilterHealth }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Sains', value: 'healthy' },
  { label: 'Cas ouverts', value: 'sick' },
]
```

**Step 3: Commit partiel**

```bash
git add porkyfarm-mobile/app/(tabs)/livestock/index.tsx
git commit -m "feat(livestock): add health imports and filter types"
```

---

## Task 4: Modifier livestock/index.tsx - Fetch et Merge

**Files:**
- Modify: `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`

**Step 1: Remplacer le hook useListData par un fetch combiné**

Remplacer les lignes 52-60 par:

```typescript
  // State pour les données combinées
  const [animals, setAnimals] = useState<AnimalWithHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch combiné animals + health cases
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Fetch parallèle pour performance
      const [animalsResult, healthResult] = await Promise.all([
        animalsService.getAll(),
        healthCasesService.getOpenCases(),
      ])

      if (animalsResult.error) {
        throw animalsResult.error
      }

      // Construire la map de sévérité (sécurisé)
      const severityMap = buildSeverityMap(healthResult.data || [])

      // Merger les données
      const enrichedAnimals = mergeAnimalsWithHealth(
        animalsResult.data || [],
        severityMap
      )

      setAnimals(enrichedAnimals)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Effect initial + refresh sur version change
  useEffect(() => {
    fetchData()
  }, [animalsVersion])

  const onRefresh = () => fetchData(true)
  const isEmpty = animals.length === 0 && !loading && !error
```

**Step 2: Ajouter import useState/useEffect si manquant**

Vérifier la ligne 6, doit être:
```typescript
import { useState, useMemo, useEffect } from 'react'
```

**Step 3: Commit**

```bash
git add porkyfarm-mobile/app/(tabs)/livestock/index.tsx
git commit -m "feat(livestock): parallel fetch animals + health cases

- Promise.all for parallel fetching
- Secure merge via buildSeverityMap
- Error handling with user-friendly messages"
```

---

## Task 5: Modifier livestock/index.tsx - Filtres et Stats

**Files:**
- Modify: `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`

**Step 1: Remplacer statusFilter par healthFilter**

Remplacer la ligne 64 (`const [statusFilter...`):

```typescript
  const [healthFilter, setHealthFilter] = useState<FilterHealth>('all')
```

**Step 2: Modifier le useMemo filteredAnimals**

Remplacer le bloc de filtrage par statut (lignes 92-100) par:

```typescript
    // Filtre par santé
    if (healthFilter !== 'all') {
      result = result.filter((animal) => {
        if (healthFilter === 'healthy') {
          return !animal.hasOpenCase
        } else {
          return animal.hasOpenCase
        }
      })
    }
```

Aussi, mettre à jour les dépendances du useMemo:
```typescript
  }, [animals, searchQuery, categoryFilter, healthFilter])
```

**Step 3: Modifier les stats avec computeHealthStats**

Remplacer le useMemo stats (lignes 106-116) par:

```typescript
  // Stats avec données de santé
  const healthStats = useMemo(() => computeHealthStats(animals), [animals])

  const stats = useMemo(() => {
    const activeAnimals = animals.filter((a) => a.status !== 'vendu' && a.status !== 'mort')
    return {
      total: activeAnimals.length,
      sows: activeAnimals.filter((a) => mapSexToCategory(a.sex || a.gender || '') === 'sow').length,
      boars: activeAnimals.filter((a) => mapSexToCategory(a.sex || a.gender || '') === 'boar').length,
      piglets: activeAnimals.filter((a) => mapSexToCategory(a.sex || a.gender || '') === 'piglet').length,
    }
  }, [animals])
```

**Step 4: Commit**

```bash
git add porkyfarm-mobile/app/(tabs)/livestock/index.tsx
git commit -m "feat(livestock): health filter and stats computation"
```

---

## Task 6: Modifier livestock/index.tsx - UI Stats et Filtres

**Files:**
- Modify: `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`

**Step 1: Modifier le chip Malades dans ListHeader**

Remplacer le bloc conditionnel `{stats.sick > 0 && ...}` (lignes 152-157) par:

```typescript
        {healthStats.withCases > 0 && (
          <View style={[styles.statChip, { backgroundColor: healthStats.critical > 0 ? themeColors.errorLight : themeColors.warningLight }]}>
            <Text style={[styles.statValue, { color: healthStats.critical > 0 ? themeColors.error : themeColors.warning }]}>
              {healthStats.critical > 0 ? healthStats.critical : healthStats.withCases}
            </Text>
            <Text style={[styles.statLabel, { color: healthStats.critical > 0 ? themeColors.error : themeColors.warning }]}>
              {healthStats.critical > 0 ? 'Critiques' : 'Malades'}
            </Text>
          </View>
        )}
```

**Step 2: Modifier le badge dans filterToggle**

Remplacer la condition du Badge (ligne 167-169):

```typescript
          {(categoryFilter !== 'all' || healthFilter !== 'all') && (
            <Badge label="!" variant="warning" size="sm" />
          )}
```

**Step 3: Modifier la section filtres**

Remplacer le bloc "Statut" (lignes 186-194) par:

```typescript
          <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>
            Santé
          </Text>
          <ChipGroup
            options={healthFilters}
            selected={healthFilter}
            onSelect={(value) => setHealthFilter(value as FilterHealth)}
            style={styles.chipGroup}
          />
```

**Step 4: Commit**

```bash
git add porkyfarm-mobile/app/(tabs)/livestock/index.tsx
git commit -m "feat(livestock): health stats chip and filter UI

- Dynamic chip: Critiques (red) or Malades (orange)
- Health filter chips: Tous/Sains/Cas ouverts"
```

---

## Task 7: Modifier livestock/index.tsx - AnimalCard healthSeverity

**Files:**
- Modify: `porkyfarm-mobile/app/(tabs)/livestock/index.tsx`

**Step 1: Passer healthSeverity à AnimalCard**

Modifier renderAnimal (lignes 122-134):

```typescript
  const renderAnimal = ({ item, index }: { item: AnimalWithHealth; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimalCard
        id={item.id}
        tagNumber={item.identifier || item.tag_number || item.id.slice(0, 8)}
        name={item.name || item.breed || undefined}
        category={getAnimalCategory(item.sex || item.gender || 'unknown')}
        status={item.status as any}
        healthSeverity={item.healthSeverity}
        photoUrl={item.photo_url}
        onPress={() => router.push(`/(tabs)/livestock/${item.id}`)}
      />
    </Animated.View>
  )
```

**Step 2: Vérifier la syntaxe complète**

Run: `cd porkyfarm-mobile && npx tsc --noEmit`
Expected: Aucune erreur

**Step 3: Commit final**

```bash
git add porkyfarm-mobile/app/(tabs)/livestock/index.tsx
git commit -m "feat(livestock): pass healthSeverity to AnimalCard

Complete implementation of health filter + badge feature"
```

---

## Task 8: Code Review Sécurité

**Vérifications à effectuer:**

| Check | Fichier | Validation |
|-------|---------|------------|
| Whitelist severity | `animalHealthHelpers.ts` | `VALID_SEVERITIES` array |
| Null guards | `animalHealthHelpers.ts` | `if (!healthCase.animal_id)` |
| Type safety | `AnimalCard.tsx` | `healthSeverity?: HealthSeverity \| null` |
| No sensitive data | `livestock/index.tsx` | Pas d'exposition user_id |
| Error handling | `livestock/index.tsx` | try/catch avec message user |
| RLS protection | Supabase | Déjà configuré via farm_id |

**Run: Code reviewer agent**

```
Utiliser zai-speckit-plugin:code-reviewer sur:
- porkyfarm-mobile/lib/animalHealthHelpers.ts
- porkyfarm-mobile/components/ui/AnimalCard.tsx
- porkyfarm-mobile/app/(tabs)/livestock/index.tsx

Focus: bugs, security, conventions
```

---

## Résumé des fichiers

| Fichier | Action | Lignes modifiées |
|---------|--------|------------------|
| `lib/animalHealthHelpers.ts` | CREATE | ~120 lignes |
| `components/ui/AnimalCard.tsx` | MODIFY | ~15 lignes |
| `app/(tabs)/livestock/index.tsx` | MODIFY | ~80 lignes |

**Total: 3 fichiers, ~215 lignes**

---

## Validation finale

1. `npx tsc --noEmit` - Pas d'erreurs TypeScript
2. `npx expo start` - App démarre
3. Test manuel:
   - Créer un cas santé "critical" sur un animal
   - Vérifier badge "Critique" rouge sur la carte
   - Vérifier chip "X Critiques" en header
   - Tester filtre "Cas ouverts"
