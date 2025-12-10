"use client"

import { Card } from "@/components/ui/card"
import { Baby, Heart, Target, TrendingUp } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useMemo } from "react"

export function ReproductionStats() {
  const { gestations, animals } = useApp()

  const stats = useMemo(() => {
    const activeGestations = gestations.filter((g) => g.status === "active")
    const completedGestations = gestations.filter((g) => g.status === "completed")
    const truies = animals.filter((a) => a.category === "truie" && a.status === "actif")

    // Calculate fertility rate
    const totalBreedings = gestations.length
    const successfulBreedings = completedGestations.length
    const fertilityRate = totalBreedings > 0 ? Math.round((successfulBreedings / totalBreedings) * 100) : 0

    // Calculate upcoming births (within 7 days)
    const today = new Date()
    const upcomingBirths = activeGestations.filter((g) => {
      const dueDate = new Date(g.expectedDueDate)
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue >= 0 && daysUntilDue <= 7
    }).length

    // Calculate average piglets per litter
    const totalPiglets = completedGestations.reduce((sum, g) => sum + (g.pigletCount || 0), 0)
    const avgPigletsPerLitter =
      completedGestations.length > 0 ? (totalPiglets / completedGestations.length).toFixed(1) : "0"

    return [
      {
        label: "Truies gestantes",
        value: activeGestations.length,
        icon: Baby,
        color: "bg-pink-500",
        detail: truies.length > 0 ? `sur ${truies.length} truies` : "Aucune truie",
      },
      {
        label: "Taux de fecondite",
        value: totalBreedings > 0 ? `${fertilityRate}%` : "N/A",
        icon: Target,
        color: "bg-green-500",
        detail: totalBreedings > 0 ? `${successfulBreedings}/${totalBreedings} reussies` : "Aucune saillie",
      },
      {
        label: "Mise-bas a venir",
        value: upcomingBirths,
        icon: Heart,
        color: "bg-purple-500",
        detail: "7 prochains jours",
      },
      {
        label: "Porcelets/portee",
        value: avgPigletsPerLitter,
        icon: TrendingUp,
        color: "bg-blue-500",
        detail: completedGestations.length > 0 ? `${completedGestations.length} portees` : "Aucune portee",
      },
    ]
  }, [gestations, animals])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
            </div>
            <div className={`rounded-xl ${stat.color} p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
