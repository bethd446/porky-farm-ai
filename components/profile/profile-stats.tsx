"use client"

import { Card } from "@/components/ui/card"
import { PiggyBank, Baby, TrendingUp, Award } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function ProfileStats() {
  const { animals, gestations } = useApp()

  // Calculer les vraies statistiques
  const totalAnimals = animals.length
  const thisYear = new Date().getFullYear()
  const gestationsThisYear = gestations.filter((g) => {
    const date = new Date(g.breedingDate)
    return date.getFullYear() === thisYear
  }).length

  const completedGestations = gestations.filter((g) => g.status === "completed")
  const successRate = gestations.length > 0 ? Math.round((completedGestations.length / gestations.length) * 100) : 0

  const stats = [
    { label: "Total animaux", value: totalAnimals.toString(), icon: PiggyBank, color: "text-primary" },
    { label: "Gestations cette annee", value: gestationsThisYear.toString(), icon: Baby, color: "text-pink-500" },
    { label: "Taux de reussite", value: `${successRate}%`, icon: TrendingUp, color: "text-green-500" },
    { label: "Cas sanitaires traites", value: "0", icon: Award, color: "text-amber-500" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="flex items-center gap-4 p-5 shadow-soft">
          <div className={`rounded-xl bg-muted p-3 ${stat.color}`}>
            <stat.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
