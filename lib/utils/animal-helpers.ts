export type AnimalCategory = "truie" | "verrat" | "porcelet" | "porc"
export type AnimalStatus = "actif" | "vendu" | "mort" | "malade"
export type HealthStatus = "bon" | "moyen" | "mauvais"
export type Priority = "low" | "medium" | "high" | "critical"
export type CaseStatus = "open" | "in_progress" | "resolved"

// ============ ANIMAL HELPERS ============

export function getStatusColor(status: AnimalStatus): string {
  const colors: Record<AnimalStatus, string> = {
    actif: "bg-green-500",
    malade: "bg-red-500",
    vendu: "bg-blue-500",
    mort: "bg-gray-500",
  }
  return colors[status] || "bg-gray-500"
}

export function getStatusLabel(status: AnimalStatus): string {
  const labels: Record<AnimalStatus, string> = {
    actif: "Actif",
    malade: "Malade",
    vendu: "Vendu",
    mort: "Décédé",
  }
  return labels[status] || status
}

export function getCategoryLabel(category: AnimalCategory): string {
  const labels: Record<AnimalCategory, string> = {
    truie: "Truie",
    verrat: "Verrat",
    porcelet: "Porcelet",
    porc: "Porc",
  }
  return labels[category] || category
}

export function getCategoryIcon(category: AnimalCategory): string {
  const icons: Record<AnimalCategory, string> = {
    truie: "🐷",
    verrat: "🐗",
    porcelet: "🐽",
    porc: "🐖",
  }
  return icons[category] || "🐷"
}

export function getHealthScore(healthStatus: HealthStatus): number {
  const scores: Record<HealthStatus, number> = {
    bon: 95,
    moyen: 70,
    mauvais: 40,
  }
  return scores[healthStatus] || 85
}

export function getHealthScoreColor(score: number): {
  bg: string
  text: string
} {
  if (score >= 80) return { bg: "bg-green-50", text: "text-green-600" }
  if (score >= 60) return { bg: "bg-amber-50", text: "text-amber-600" }
  return { bg: "bg-red-50", text: "text-red-600" }
}

export function getAge(birthDate: string): string {
  if (!birthDate) return "Age inconnu"
  const birth = new Date(birthDate)
  const now = new Date()
  const months = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30))

  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} jour(s)`
  }
  if (months < 12) return `${months} mois`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  return remainingMonths > 0 ? `${years} an(s) ${remainingMonths} mois` : `${years} an(s)`
}

// ============ HEALTH HELPERS ============

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    critical: "bg-red-600",
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-blue-500",
  }
  return colors[priority] || "bg-gray-500"
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    critical: "Critique",
    high: "Haute",
    medium: "Moyenne",
    low: "Basse",
  }
  return labels[priority] || priority
}

export function getCaseStatusColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    resolved: "bg-green-500",
    in_progress: "bg-blue-500",
    open: "bg-amber-500",
  }
  return colors[status] || "bg-gray-500"
}

export function getCaseStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    resolved: "Résolu",
    in_progress: "En traitement",
    open: "Ouvert",
  }
  return labels[status] || status
}

// ============ GESTATION HELPERS ============

export function calculateGestationProgress(breedingDate: string): {
  daysPassed: number
  daysRemaining: number
  progress: number
  isOverdue: boolean
} {
  const GESTATION_DAYS = 114
  const start = new Date(breedingDate)
  const now = new Date()
  const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, GESTATION_DAYS - daysPassed)
  const progress = Math.min((daysPassed / GESTATION_DAYS) * 100, 100)
  const isOverdue = daysPassed > GESTATION_DAYS

  return { daysPassed, daysRemaining, progress, isOverdue }
}

export function formatExpectedDueDate(breedingDate: string): string {
  const start = new Date(breedingDate)
  const dueDate = new Date(start)
  dueDate.setDate(dueDate.getDate() + 114)
  return dueDate.toLocaleDateString("fr-FR")
}

// ============ FORMATTING HELPERS ============

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR")
}

export function formatCurrency(amount: number, currency = "FCFA"): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`
}

export function formatWeight(weight: number | undefined): string {
  if (!weight) return "Non renseigné"
  return `${weight} kg`
}

// ============ MAPPING FRONTEND ↔ DATABASE ============
// Ces fonctions permettent de convertir entre les valeurs françaises utilisées
// dans le frontend et les valeurs anglaises attendues par la base de données

/**
 * Convertit une catégorie frontend (français) vers la valeur DB (anglais)
 */
export function mapCategoryToDb(category: AnimalCategory | string): "sow" | "boar" | "piglet" | "fattening" {
  const mapping: Record<string, "sow" | "boar" | "piglet" | "fattening"> = {
    truie: "sow",
    verrat: "boar",
    porcelet: "piglet",
    porc: "fattening",
    porc_engraissement: "fattening",
  }
  return mapping[category] || "fattening"
}

/**
 * Convertit une catégorie DB (anglais) vers la valeur frontend (français)
 */
export function mapCategoryFromDb(category: string): AnimalCategory {
  const mapping: Record<string, AnimalCategory> = {
    sow: "truie",
    boar: "verrat",
    piglet: "porcelet",
    fattening: "porc",
  }
  return mapping[category] || "porc"
}

/**
 * Convertit un statut frontend (français) vers la valeur DB (anglais)
 */
export function mapStatusToDb(status: AnimalStatus | string): "active" | "sold" | "deceased" | "sick" {
  const mapping: Record<string, "active" | "sold" | "deceased" | "sick"> = {
    actif: "active",
    vendu: "sold",
    mort: "deceased",
    malade: "sick",
  }
  return mapping[status] || "active"
}

/**
 * Convertit un statut DB (anglais) vers la valeur frontend (français)
 */
export function mapStatusFromDb(status: string): AnimalStatus {
  const mapping: Record<string, AnimalStatus> = {
    active: "actif",
    sold: "vendu",
    deceased: "mort",
    sick: "malade",
    pregnant: "actif", // Les truies enceintes sont considérées comme actives
    nursing: "actif", // Les truies allaitantes sont considérées comme actives
  }
  return mapping[status] || "actif"
}

/**
 * Convertit un health_status frontend (français) vers la valeur DB (anglais)
 */
export function mapHealthStatusToDb(healthStatus: HealthStatus | string): "healthy" | "sick" | "quarantine" {
  const mapping: Record<string, "healthy" | "sick" | "quarantine"> = {
    bon: "healthy",
    moyen: "sick",
    mauvais: "quarantine",
  }
  return mapping[healthStatus] || "healthy"
}

/**
 * Convertit un health_status DB (anglais) vers la valeur frontend (français)
 */
export function mapHealthStatusFromDb(healthStatus: string): HealthStatus {
  const mapping: Record<string, HealthStatus> = {
    healthy: "bon",
    sick: "moyen",
    quarantine: "mauvais",
  }
  return mapping[healthStatus] || "bon"
}
