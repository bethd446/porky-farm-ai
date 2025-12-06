import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Calendar, Syringe, Baby } from "lucide-react"

const alerts = [
  {
    type: "warning",
    icon: AlertTriangle,
    title: "Truie #45 - Fièvre",
    description: "Température élevée détectée",
    time: "Il y a 2h",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    type: "info",
    icon: Syringe,
    title: "Vaccination prévue",
    description: "12 porcelets - Lot B23",
    time: "Demain",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    type: "success",
    icon: Baby,
    title: "Mise-bas imminente",
    description: "Truie #32 - J+112",
    time: "Dans 2 jours",
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
  {
    type: "info",
    icon: Calendar,
    title: "Visite vétérinaire",
    description: "Dr. Koffi - Contrôle mensuel",
    time: "Vendredi",
    color: "text-green-500",
    bg: "bg-green-50",
  },
]

export function DashboardAlerts() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base font-medium">
          Alertes & Rappels
          <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">{alerts.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className={`flex items-start gap-3 rounded-xl ${alert.bg} p-3`}>
            <div className={`rounded-lg bg-white p-2 ${alert.color}`}>
              <alert.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.description}</p>
            </div>
            <span className="text-xs text-muted-foreground">{alert.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
