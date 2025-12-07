"use client"

import { memo } from "react"
import { useApp } from "@/contexts/app-context"
import { PiggyBank, Baby, Stethoscope, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

export const DashboardStats = memo(function DashboardStats() {
  const { stats } = useApp()

  const statCards = [
    {
      label: "Total Cheptel",
      value: stats.totalAnimals.toString(),
      change: "+12",
      changeType: "positive" as const,
      icon: PiggyBank,
      color: "bg-primary",
    },
    {
      label: "Truies Gestantes",
      value: stats.gestationsActives.toString(),
      change: `${stats.truies} truies`,
      changeType: "positive" as const,
      icon: Baby,
      color: "bg-pink-500",
    },
    {
      label: "Cas Sanitaires",
      value: stats.cassSanteActifs.toString(),
      change: stats.cassSanteActifs === 0 ? "Aucun cas" : "En cours",
      changeType: stats.cassSanteActifs === 0 ? ("positive" as const) : ("negative" as const),
      icon: Stethoscope,
      color: stats.cassSanteActifs === 0 ? "bg-green-500" : "bg-amber-500",
    },
    {
      label: "Coût Alimentation",
      value: stats.coutAlimentationMois > 0 ? `${(stats.coutAlimentationMois / 1000).toFixed(1)}K` : "0",
      suffix: " FCFA",
      change: "Ce mois",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, i) => (
        <Card key={i} className="p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {stat.value}
                {stat.suffix && <span className="text-base">{stat.suffix}</span>}
              </p>
              <p
                className={`mt-1 text-xs font-medium ${
                  stat.changeType === "positive" ? "text-green-600" : "text-amber-600"
                }`}
              >
                {stat.change}
              </p>
            </div>
            <div className={`rounded-xl ${stat.color} p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
})
