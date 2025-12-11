"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Stethoscope, Syringe, AlertTriangle, CheckCircle } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function HealthOverview() {
  const { healthCases, vaccinations, animals } = useApp()

  const stats = useMemo(() => {
    // Cas actifs
    const activeCases = healthCases.filter((c) => c.status !== "resolved").length

    // Vaccinations à jour
    const totalVaccinations = vaccinations.length
    const completedVaccinations = vaccinations.filter((v) => v.status === "completed").length
    const vaccinationRate = totalVaccinations > 0 ? Math.round((completedVaccinations / totalVaccinations) * 100) : 0

    // Visites véto ce mois
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    const vetoVisits = healthCases.filter((c) => {
      const caseDate = new Date(c.createdAt)
      return caseDate.getMonth() === thisMonth && caseDate.getFullYear() === thisYear
    }).length

    // Guérisons ce mois
    const recoveries = healthCases.filter((c) => {
      if (c.status !== "resolved" || !c.resolvedAt) return false
      const resolvedDate = new Date(c.resolvedAt)
      return resolvedDate.getMonth() === thisMonth && resolvedDate.getFullYear() === thisYear
    }).length

    return [
      {
        label: "Cas actifs",
        value: activeCases,
        icon: AlertTriangle,
        color: activeCases === 0 ? "bg-green-500" : "bg-amber-500",
        trend: activeCases === 0 ? "Aucun cas" : `${activeCases} en cours`,
        trendType: activeCases === 0 ? "positive" : "warning",
      },
      {
        label: "Vaccinations à jour",
        value: totalVaccinations > 0 ? `${vaccinationRate}%` : "N/A",
        icon: Syringe,
        color: "bg-blue-500",
        trend:
          totalVaccinations > 0 ? `${completedVaccinations}/${totalVaccinations} complétées` : "Aucune vaccination",
        trendType: vaccinationRate >= 80 ? "positive" : "warning",
      },
      {
        label: "Visites véto",
        value: vetoVisits,
        icon: Stethoscope,
        color: "bg-purple-500",
        trend: "Ce mois",
        trendType: "neutral",
      },
      {
        label: "Guérisons",
        value: recoveries,
        icon: CheckCircle,
        color: "bg-green-500",
        trend: "Ce mois",
        trendType: "positive",
      },
    ]
  }, [healthCases, vaccinations, animals])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className={`rounded-xl ${stat.color} p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
