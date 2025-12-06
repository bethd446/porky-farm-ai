import { Card } from "@/components/ui/card"
import { Baby, Heart, Target, TrendingUp } from "lucide-react"

const stats = [
  {
    label: "Truies gestantes",
    value: 28,
    icon: Baby,
    color: "bg-pink-500",
    detail: "J+15 à J+112",
  },
  {
    label: "Taux de fécondité",
    value: "92%",
    icon: Target,
    color: "bg-green-500",
    detail: "+3% vs trimestre",
  },
  {
    label: "Mise-bas à venir",
    value: 5,
    icon: Heart,
    color: "bg-purple-500",
    detail: "7 prochains jours",
  },
  {
    label: "Porcelets/portée",
    value: "11.2",
    icon: TrendingUp,
    color: "bg-blue-500",
    detail: "Moyenne 2025",
  },
]

export function ReproductionStats() {
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
