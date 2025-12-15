"use client"

import { memo } from "react"
import { useApp } from "@/contexts/app-context"
import { PiggyBank, Baby, Stethoscope, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { iconColors, typography, shadows } from "@/lib/design-system"

export const DashboardStats = memo(function DashboardStats() {
  const { stats } = useApp()

  const statCards = [
    {
      label: "Vos animaux",
      value: stats.totalAnimals.toString(),
      change: stats.totalAnimals === 0 ? "Aucun animal" : `${stats.truies} truies, ${stats.verrats} verrats`,
      changeType: "positive" as const,
      icon: PiggyBank,
      colorClass: iconColors.stats,
    },
    {
      label: "Gestations en cours",
      value: stats.gestationsActives.toString(),
      change: stats.gestationsActives === 0 ? "Aucune gestation" : `Sur ${stats.truies} truie(s)`,
      changeType: "positive" as const,
      icon: Baby,
      colorClass: iconColors.reproduction,
    },
    {
      label: "Problemes de sante",
      value: stats.cassSanteActifs.toString(),
      change: stats.cassSanteActifs === 0 ? "Tout va bien" : "A surveiller",
      changeType: stats.cassSanteActifs === 0 ? ("positive" as const) : ("negative" as const),
      icon: Stethoscope,
      colorClass: stats.cassSanteActifs === 0 ? iconColors.success : iconColors.warning,
    },
    {
      label: "Budget alimentation",
      value: stats.coutAlimentationMois > 0 ? `${(stats.coutAlimentationMois / 1000).toFixed(1)}K` : "0",
      suffix: " FCFA",
      change: "Ce mois-ci",
      changeType: "positive" as const,
      icon: TrendingUp,
      colorClass: iconColors.success,
    },
  ]

  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, i) => (
        <Card key={i} className={`p-4 sm:p-6 ${shadows.md}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={typography.caption}>{stat.label}</p>
              <p className={`mt-1 ${typography.h3} text-foreground`}>
                {stat.value}
                {stat.suffix && <span className="text-base font-normal">{stat.suffix}</span>}
              </p>
              <p
                className={`mt-1 text-xs font-medium ${
                  stat.changeType === "positive" ? "text-success" : "text-warning"
                }`}
              >
                {stat.change}
              </p>
            </div>
            <div className={`rounded-xl p-2.5 sm:p-3 ${stat.colorClass}`}>
              <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
})
