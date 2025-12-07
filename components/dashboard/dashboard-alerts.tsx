"use client"

import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Syringe, Baby, Check, Eye } from "lucide-react"

export function DashboardAlerts() {
  const router = useRouter()
  const { alerts } = useApp()

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "health":
        return AlertTriangle
      case "gestation":
        return Baby
      case "vaccination":
        return Syringe
      default:
        return Calendar
    }
  }

  const getAlertStyle = (priority: string) => {
    switch (priority) {
      case "critical":
        return { color: "text-red-500", bg: "bg-red-50" }
      case "high":
        return { color: "text-amber-500", bg: "bg-amber-50" }
      case "medium":
        return { color: "text-blue-500", bg: "bg-blue-50" }
      default:
        return { color: "text-green-500", bg: "bg-green-50" }
    }
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
            <p className="text-xs text-muted-foreground mt-1">Tout va bien dans votre élevage!</p>
          </div>
        ) : (
          alerts.slice(0, 5).map((alert, index) => {
            const Icon = getAlertIcon(alert.type)
            const style = getAlertStyle(alert.priority)

            return (
              <div key={index} className={`flex items-start gap-3 rounded-xl ${style.bg} p-3 group`}>
                <div className={`rounded-lg bg-white p-2 ${style.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => router.push(alert.link)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })
        )}

        {alerts.length > 5 && (
          <Button variant="ghost" className="w-full text-xs" onClick={() => router.push("/dashboard/health")}>
            Voir toutes les alertes ({alerts.length})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
