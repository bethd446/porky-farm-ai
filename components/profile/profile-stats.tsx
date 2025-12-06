import { Card } from "@/components/ui/card"
import { PiggyBank, Baby, TrendingUp, Award } from "lucide-react"

const stats = [
  { label: "Total animaux", value: "247", icon: PiggyBank, color: "text-primary" },
  { label: "Portées cette année", value: "32", icon: Baby, color: "text-pink-500" },
  { label: "Taux de réussite", value: "94%", icon: TrendingUp, color: "text-green-500" },
  { label: "Années d'expérience", value: "7", icon: Award, color: "text-amber-500" },
]

export function ProfileStats() {
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
