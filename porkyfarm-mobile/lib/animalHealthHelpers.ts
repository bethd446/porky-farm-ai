/**
 * Animal Health Helpers - Merge securise animals + health cases
 * =============================================================
 */

import type { Animal } from '../services/animals'
import type { HealthCase } from '../services/healthCases'

// Types stricts pour la severite
export type HealthSeverity = 'critical' | 'high' | 'medium' | 'low'

// Whitelist des severites valides (securite)
const VALID_SEVERITIES: readonly HealthSeverity[] = ['critical', 'high', 'medium', 'low'] as const

// Ordre de priorite (index plus bas = plus critique)
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
 * Valide et sanitize une valeur de severite
 * Retourne null si invalide (defense contre injection)
 */
function sanitizeSeverity(value: unknown): HealthSeverity | null {
  if (typeof value !== 'string') return null
  const normalized = value.toLowerCase().trim()
  return VALID_SEVERITIES.includes(normalized as HealthSeverity)
    ? (normalized as HealthSeverity)
    : null
}

/**
 * Compare deux severites, retourne la plus critique
 */
function getMaxSeverity(a: HealthSeverity | null, b: HealthSeverity | null): HealthSeverity | null {
  if (!a) return b
  if (!b) return a
  return SEVERITY_PRIORITY[a] <= SEVERITY_PRIORITY[b] ? a : b
}

/**
 * Construit une Map animal_id -> max severity depuis les cas ouverts
 * Securite: valide chaque severite avant insertion
 */
export function buildSeverityMap(openCases: HealthCase[]): Map<string, HealthSeverity> {
  const map = new Map<string, HealthSeverity>()

  for (const healthCase of openCases) {
    // Guard: ignorer les cas sans animal_id
    if (!healthCase.animal_id) continue

    // Sanitize la severite (protection injection)
    const sanitized = sanitizeSeverity(healthCase.severity)
    if (!sanitized) continue

    // Garder la severite max pour cet animal
    const existing = map.get(healthCase.animal_id)
    const max = getMaxSeverity(existing ?? null, sanitized)
    if (max) {
      map.set(healthCase.animal_id, max)
    }
  }

  return map
}

/**
 * Enrichit les animaux avec les donnees de sante
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
 * Calcule les statistiques de sante du cheptel
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
