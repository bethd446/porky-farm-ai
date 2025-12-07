export interface FeedingResult {
  dailyRation: number
  protein: number
  energy: number
  lysine: number
  calcium: number
  phosphorus: number
  totalMonthly: number
}

export interface FeedingParams {
  category: string
  weight: number
  stage: string
  count: number
}

const BASE_REQUIREMENTS: Record<string, { protein: number; energy: number; lysine: number }> = {
  "sow-gestating": { protein: 14, energy: 3000, lysine: 0.6 },
  "sow-lactating": { protein: 18, energy: 3400, lysine: 1.0 },
  boar: { protein: 14, energy: 3000, lysine: 0.5 },
  piglet: { protein: 22, energy: 3400, lysine: 1.4 },
  grower: { protein: 18, energy: 3200, lysine: 1.0 },
  finisher: { protein: 15, energy: 3200, lysine: 0.8 },
}

const STAGE_MULTIPLIERS: Record<string, number> = {
  early: 0.85,
  mid: 1.0,
  late: 1.15,
}

export function calculateFeeding(params: FeedingParams): FeedingResult {
  const { category, weight, stage, count } = params

  const requirements = BASE_REQUIREMENTS[category] || BASE_REQUIREMENTS["grower"]
  const stageMultiplier = STAGE_MULTIPLIERS[stage] || 1.0

  // Base daily ration calculation (kg per day)
  let baseRation: number

  switch (category) {
    case "sow-gestating":
      baseRation = 2.0 + (weight - 150) * 0.01
      break
    case "sow-lactating":
      baseRation = 5.0 + (weight - 150) * 0.02
      break
    case "boar":
      baseRation = 2.5 + (weight - 180) * 0.008
      break
    case "piglet":
      baseRation = weight * 0.05
      break
    case "grower":
      baseRation = weight * 0.035
      break
    case "finisher":
      baseRation = weight * 0.03
      break
    default:
      baseRation = weight * 0.03
  }

  const dailyRation = Math.round(baseRation * stageMultiplier * 100) / 100

  return {
    dailyRation,
    protein: requirements.protein,
    energy: requirements.energy,
    lysine: requirements.lysine,
    calcium: 0.8,
    phosphorus: 0.6,
    totalMonthly: Math.round(dailyRation * 30 * count * 10) / 10,
  }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    "sow-gestating": "Truie gestante",
    "sow-lactating": "Truie allaitante",
    boar: "Verrat",
    piglet: "Porcelet",
    grower: "Porc en croissance",
    finisher: "Porc en finition",
  }
  return labels[category] || category
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    early: "Début",
    mid: "Milieu",
    late: "Fin",
  }
  return labels[stage] || stage
}
