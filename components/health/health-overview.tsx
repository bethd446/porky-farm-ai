import { Card } from "@/components/ui/card"
import { Stethoscope, Syringe, AlertTriangle, CheckCircle } from "lucide-react"

const stats = [
  {
    label: "Cas actifs",
    value: 5,
    icon: AlertTriangle,
    color: "bg-amber-500",
    trend: "-2 cette semaine",
    trendType: "positive",
  },
  {
    label: "Vaccinations à jour",
    value: "94%",
    icon: Syringe,
    color: "bg-blue-500",
    trend: "+6% ce mois",
    trendType: "positive",
  },
  {
    label: "Visites véto",
    value: 3,
    icon: Stethoscope,
    color: "bg-purple-500",
    trend: "Ce mois",
    trendType: "neutral",
  },
  {
    label: "Guérisons",
    value: 12,
    icon: CheckCircle,
    color: "bg-green-500",
    trend: "Ce mois",
    trendType: "positive",
  },
]

export function HealthOverview() {
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
