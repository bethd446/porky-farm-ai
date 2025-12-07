"use client"

import { useLivestock } from "@/contexts/livestock-context"
import { PiggyBank, Baby, Stethoscope, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

export function DashboardStats() {
  const { getStats } = useLivestock()
  const livestockStats = getStats()

  const stats = [
    {
      label: "Total Cheptel",
      value: livestockStats.total.toString(),
      change: "+12",
      changeType: "positive" as const,
      icon: PiggyBank,
      color: "bg-primary",
    },
    {
      label: "Truies Gestantes",
      value: livestockStats.truies.toString(),
      change: "+3",
      changeType: "positive" as const,
      icon: Baby,
      color: "bg-pink-500",
    },
    {
      label: "Cas Sanitaires",
      value: "5",
      change: "-2",
      changeType: "positive" as const,
      icon: Stethoscope,
      color: "bg-amber-500",
    },
    {
      label: "Revenus du Mois",
      value: "2.4M",
      suffix: " FCFA",
      change: "+18%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
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
                  stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change} ce mois
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
}
