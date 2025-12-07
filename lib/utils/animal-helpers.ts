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
