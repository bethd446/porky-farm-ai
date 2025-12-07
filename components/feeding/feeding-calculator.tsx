"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Sparkles, Download, Share2, HelpCircle, AlertCircle, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { z } from "zod"

const feedingSchema = z.object({
  category: z.string().min(1, "Selectionnez un type d'animal"),
  weight: z
    .string()
    .min(1, "Entrez le poids")
    .refine((v) => {
      const num = Number(v)
      return num >= 1 && num <= 500
    }, "Poids entre 1 et 500 kg"),
  stage: z.string().min(1, "Selectionnez un stade"),
  count: z
    .string()
    .min(1, "Entrez le nombre")
    .refine((v) => {
      const num = Number(v)
      return num >= 1 && num <= 1000
    }, "Entre 1 et 1000 animaux"),
})

type FeedingErrors = {
  category?: string
  weight?: string
  stage?: string
  count?: string
}

const feedingRates: Record<string, Record<string, { rate: number; protein: number }>> = {
  "sow-gestating": {
    early: { rate: 2.2, protein: 14 },
    mid: { rate: 2.5, protein: 14 },
    late: { rate: 3.0, protein: 16 },
  },
  "sow-lactating": {
    early: { rate: 5.0, protein: 18 },
    mid: { rate: 6.5, protein: 18 },
    late: { rate: 5.5, protein: 16 },
  },
  boar: {
    early: { rate: 2.5, protein: 14 },
    mid: { rate: 2.8, protein: 14 },
    late: { rate: 2.5, protein: 14 },
  },
  piglet: {
    early: { rate: 0.3, protein: 22 },
    mid: { rate: 0.8, protein: 20 },
    late: { rate: 1.5, protein: 18 },
  },
  fattening: {
    early: { rate: 1.8, protein: 18 },
    mid: { rate: 2.5, protein: 16 },
    late: { rate: 3.2, protein: 14 },
  },
}

const stageDescriptions: Record<string, Record<string, string>> = {
  "sow-gestating": {
    early: "1-30 jours de gestation",
    mid: "30-90 jours de gestation",
    late: "90-114 jours (proche mise-bas)",
  },
  "sow-lactating": {
    early: "Premiere semaine d'allaitement",
    mid: "Pic de lactation (semaines 2-3)",
    late: "Fin d'allaitement / sevrage",
  },
  boar: {
    early: "Jeune reproducteur",
    mid: "Reproducteur actif",
    late: "Reproducteur senior",
  },
  piglet: {
    early: "Post-sevrage (< 10 kg)",
    mid: "Croissance (10-25 kg)",
    late: "Pre-engraissement (25-40 kg)",
  },
  fattening: {
    early: "Debut engraissement (40-60 kg)",
    mid: "Milieu engraissement (60-90 kg)",
    late: "Finition (90-120 kg)",
  },
}

export function FeedingCalculator() {
  const [category, setCategory] = useState("sow-gestating")
  const [weight, setWeight] = useState("180")
  const [stage, setStage] = useState("mid")
  const [count, setCount] = useState("1")
  const [errors, setErrors] = useState<FeedingErrors>({})
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [result, setResult] = useState<{
    daily: number
    monthly: number
    protein: number
    composition: string
    costEstimate?: number
  } | null>(null)

  const calculate = () => {
    const formData = { category, weight, stage, count }
    const validation = feedingSchema.safeParse(formData)

    if (!validation.success) {
      const fieldErrors: FeedingErrors = {}
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FeedingErrors
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setResult(null)
      return
    }

    setErrors({})

    const feedData = feedingRates[category]?.[stage]
    if (!feedData) return

    const animalCount = Number.parseInt(count) || 1
    const animalWeight = Number.parseInt(weight) || 100

    const weightFactor = Math.sqrt(animalWeight / 100)
    const dailyPerAnimal = feedData.rate * weightFactor
    const daily = dailyPerAnimal * animalCount
    const monthly = daily * 30

    const costPerKg = 250
    const costEstimate = Math.round(monthly * costPerKg)

    let composition = ""
    if (category === "piglet") {
      composition = "60% mais, 25% soja, 10% farine de poisson, 5% complements"
    } else if (category === "sow-lactating") {
      composition = "65% mais, 25% soja, 5% son de ble, 5% CMV"
    } else {
      composition = "70% mais, 20% soja, 5% son de ble, 5% CMV"
    }

    setResult({
      daily: Math.round(daily * 10) / 10,
      monthly: Math.round(monthly),
      protein: feedData.protein,
      composition,
      costEstimate,
    })
  }

  const exportResult = () => {
    if (!result) return

    const categoryLabels: Record<string, string> = {
      "sow-gestating": "Truie gestante",
      "sow-lactating": "Truie allaitante",
      boar: "Verrat",
      piglet: "Porcelet",
      fattening: "Porc d'engraissement",
    }

    const stageLabels: Record<string, string> = {
      early: "Debut",
      mid: "Milieu",
      late: "Fin",
    }

    const text = `
Calcul de ration PorkyFarm
========================
Date: ${new Date().toLocaleDateString("fr-FR")}

Parametres:
- Type d'animal: ${categoryLabels[category] || category}
- Poids moyen: ${weight} kg
- Stade: ${stageLabels[stage] || stage}
- Nombre d'animaux: ${count}

Resultats:
- Ration quotidienne: ${result.daily} kg
- Ration mensuelle: ${result.monthly} kg
- Taux de proteines: ${result.protein}%
- Cout estime: ${result.costEstimate?.toLocaleString()} FCFA/mois

Composition suggeree:
${result.composition}

---
Genere par PorkyFarm - www.porkyfarm.app
    `.trim()

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ration-porkyfarm-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)

    setShowExportSuccess(true)
    setTimeout(() => setShowExportSuccess(false), 3000)
  }

  const handleWeightChange = (value: string) => {
    setWeight(value)
    if (value && (Number(value) < 1 || Number(value) > 500)) {
      setErrors((prev) => ({ ...prev, weight: "Poids entre 1 et 500 kg" }))
    } else {
      setErrors((prev) => ({ ...prev, weight: undefined }))
    }
  }

  const handleCountChange = (value: string) => {
    setCount(value)
    if (value && (Number(value) < 1 || Number(value) > 1000)) {
      setErrors((prev) => ({ ...prev, count: "Entre 1 et 1000 animaux" }))
    } else {
      setErrors((prev) => ({ ...prev, count: undefined }))
    }
  }

  return (
    <TooltipProvider>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Calculator className="h-5 w-5 text-primary" />
            Combien nourrir mes porcs ?
          </CardTitle>
          <p className="text-sm text-muted-foreground">Calculez la quantite d'aliment adaptee a vos animaux</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type d'animal</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sow-gestating">Truie gestante</SelectItem>
                  <SelectItem value="sow-lactating">Truie allaitante</SelectItem>
                  <SelectItem value="boar">Verrat</SelectItem>
                  <SelectItem value="piglet">Porcelet</SelectItem>
                  <SelectItem value="fattening">Porc d'engraissement</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Poids moyen (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                min="1"
                max="500"
                aria-invalid={!!errors.weight}
                className={errors.weight ? "border-destructive" : ""}
              />
              {errors.weight && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.weight}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label>Stade</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{stageDescriptions[category]?.[stage] || "Selectionnez un stade"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early">Debut</SelectItem>
                  <SelectItem value="mid">Milieu</SelectItem>
                  <SelectItem value="late">Fin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{stageDescriptions[category]?.[stage]}</p>
            </div>

            <div className="space-y-2">
              <Label>Nombre d'animaux</Label>
              <Input
                type="number"
                value={count}
                onChange={(e) => handleCountChange(e.target.value)}
                min="1"
                max="1000"
                aria-invalid={!!errors.count}
                className={errors.count ? "border-destructive" : ""}
              />
              {errors.count && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.count}
                </p>
              )}
            </div>
          </div>

          <Button onClick={calculate} className="w-full gap-2 bg-primary text-white hover:bg-primary/90">
            <Sparkles className="h-4 w-4" />
            Calculer ma ration
          </Button>

          {result && (
            <div className="rounded-xl bg-muted p-4 space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Votre ration recommandee</h4>
                <div className="flex items-center gap-2">
                  {showExportSuccess && (
                    <span className="flex items-center gap-1 text-xs text-primary animate-in fade-in">
                      <CheckCircle className="h-3 w-3" />
                      Exporte !
                    </span>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportResult}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Telecharger le calcul</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: "Calcul de ration PorkyFarm",
                              text: `Ration recommandee: ${result.daily} kg/jour pour ${count} animaux`,
                            })
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Partager</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{result.daily} kg</p>
                  <p className="text-sm text-muted-foreground">par jour</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{result.monthly} kg</p>
                  <p className="text-sm text-muted-foreground">par mois</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{result.protein}%</p>
                  <p className="text-sm text-muted-foreground">proteines</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-500">{result.costEstimate?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">FCFA/mois</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Composition suggeree :</strong> {result.composition}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
