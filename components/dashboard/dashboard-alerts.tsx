"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Syringe, Baby, X, Check, Eye } from "lucide-react"

const initialAlerts = [
  {
    id: 1,
    type: "warning",
    icon: AlertTriangle,
    title: "Truie #45 - Fièvre",
    description: "Température élevée détectée",
    time: "Il y a 2h",
    color: "text-amber-500",
    bg: "bg-amber-50",
    link: "/dashboard/health",
  },
  {
    id: 2,
    type: "info",
    icon: Syringe,
    title: "Vaccination prévue",
    description: "12 porcelets - Lot B23",
    time: "Demain",
    color: "text-blue-500",
    bg: "bg-blue-50",
    link: "/dashboard/health",
  },
  {
    id: 3,
    type: "success",
    icon: Baby,
    title: "Mise-bas imminente",
    description: "Truie #32 - J+112",
    time: "Dans 2 jours",
    color: "text-pink-500",
    bg: "bg-pink-50",
    link: "/dashboard/reproduction",
  },
  {
    id: 4,
    type: "info",
    icon: Calendar,
    title: "Visite vétérinaire",
    description: "Dr. Koffi - Contrôle mensuel",
    time: "Vendredi",
    color: "text-green-500",
    bg: "bg-green-50",
    link: "/dashboard/health",
  },
]

export function DashboardAlerts() {
  const router = useRouter()
  const [alerts, setAlerts] = useState(initialAlerts)

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const markAsRead = (id: number, link: string) => {
    router.push(link)
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base font-medium">
          Alertes & Rappels
          {alerts.length > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">{alerts.length}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Check className="h-12 w-12 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">Aucune alerte en cours</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 rounded-xl ${alert.bg} p-3 group`}>
              <div className={`rounded-lg bg-white p-2 ${alert.color}`}>
                <alert.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground hidden sm:block">{alert.time}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => markAsRead(alert.id, alert.link)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
