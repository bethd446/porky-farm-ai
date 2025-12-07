"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Sparkles, Download, Share2 } from "lucide-react"

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

export function FeedingCalculator() {
  const [category, setCategory] = useState("sow-gestating")
  const [weight, setWeight] = useState("180")
  const [stage, setStage] = useState("mid")
  const [count, setCount] = useState("1")
  const [result, setResult] = useState<{
    daily: number
    monthly: number
    protein: number
    composition: string
  } | null>(null)

  const calculate = () => {
    const feedData = feedingRates[category]?.[stage]
    if (!feedData) return

    const animalCount = Number.parseInt(count) || 1
    const animalWeight = Number.parseInt(weight) || 100

    // Adjust rate based on weight (baseline is 100kg)
    const weightFactor = Math.sqrt(animalWeight / 100)
    const dailyPerAnimal = feedData.rate * weightFactor
    const daily = dailyPerAnimal * animalCount
    const monthly = daily * 30

    let composition = ""
    if (category === "piglet") {
      composition = "60% maïs, 25% soja, 10% farine de poisson, 5% compléments"
    } else if (category === "sow-lactating") {
      composition = "65% maïs, 25% soja, 5% son de blé, 5% CMV"
    } else {
      composition = "70% maïs, 20% soja, 5% son de blé, 5% CMV"
    }

    setResult({
      daily: Math.round(daily * 10) / 10,
      monthly: Math.round(monthly),
      protein: feedData.protein,
      composition,
    })
  }

  const exportResult = () => {
    if (!result) return
    const text = `
Calcul de ration PorkyFarm
========================
Catégorie: ${category}
Poids: ${weight} kg
Stade: ${stage}
Nombre d'animaux: ${count}

Résultats:
- Ration quotidienne: ${result.daily} kg
- Ration mensuelle: ${result.monthly} kg
- Taux de protéines: ${result.protein}%
- Composition: ${result.composition}
    `.trim()

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ration-porkyfarm.txt"
    a.click()
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Calculator className="h-5 w-5 text-primary" />
          Calculateur de rations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Catégorie d'animal</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sow-gestating">Truie gestante</SelectItem>
                <SelectItem value="sow-lactating">Truie allaitante</SelectItem>
                <SelectItem value="boar">Verrat</SelectItem>
                <SelectItem value="piglet">Porcelet</SelectItem>
                <SelectItem value="fattening">Engraissement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Poids moyen (kg)</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min="1" />
          </div>

          <div className="space-y-2">
            <Label>Stade physiologique</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="early">Début</SelectItem>
                <SelectItem value="mid">Milieu</SelectItem>
                <SelectItem value="late">Fin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nombre d'animaux</Label>
            <Input type="number" value={count} onChange={(e) => setCount(e.target.value)} min="1" />
          </div>
        </div>

        <Button onClick={calculate} className="w-full gap-2 bg-primary text-white hover:bg-primary/90">
          <Sparkles className="h-4 w-4" />
          Calculer la ration
        </Button>

        {result && (
          <div className="rounded-xl bg-muted p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Résultat recommandé</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportResult}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <p className="text-sm text-muted-foreground">protéines</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Composition suggérée :</strong> {result.composition}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
