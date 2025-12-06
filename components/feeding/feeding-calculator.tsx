"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Sparkles } from "lucide-react"

export function FeedingCalculator() {
  const [result, setResult] = useState<{ daily: number; monthly: number } | null>(null)

  const calculate = () => {
    // Simplified calculation
    setResult({ daily: 2.8, monthly: 84 })
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
            <Select defaultValue="sow-gestating">
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
            <Input type="number" defaultValue="180" />
          </div>

          <div className="space-y-2">
            <Label>Stade physiologique</Label>
            <Select defaultValue="mid">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="early">Début gestation</SelectItem>
                <SelectItem value="mid">Mi-gestation</SelectItem>
                <SelectItem value="late">Fin gestation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nombre d'animaux</Label>
            <Input type="number" defaultValue="1" />
          </div>
        </div>

        <Button onClick={calculate} className="w-full gap-2 bg-primary text-white hover:bg-primary-dark">
          <Sparkles className="h-4 w-4" />
          Calculer la ration
        </Button>

        {result && (
          <div className="rounded-xl bg-muted p-4">
            <h4 className="font-medium text-foreground">Résultat recommandé</h4>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">{result.daily} kg</p>
                <p className="text-sm text-muted-foreground">par jour</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{result.monthly} kg</p>
                <p className="text-sm text-muted-foreground">par mois</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Composition suggérée : 70% maïs, 20% soja, 10% compléments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
