/**
 * Section Alertes Récentes (Web) - Style UX Pilot
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { AlertTriangle, Calendar, Thermometer, ChevronRight } from "lucide-react"
import { colors } from "@/lib/design-tokens"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export function RecentAlertsSection() {
  const { alerts } = useApp()
  const router = useRouter()

  const recentAlerts = alerts.slice(0, 2)

  const getAlertConfig = (type: string) => {
    switch (type) {
      case "gestation":
        return {
          icon: Calendar,
          bgColor: "bg-blue-50",
          iconBg: "bg-blue-500",
          borderColor: "border-blue-200",
        }
      case "health":
        return {
          icon: Thermometer,
          bgColor: "bg-amber-50",
          iconBg: "bg-amber-500",
          borderColor: "border-amber-200",
        }
      default:
        return {
          icon: AlertTriangle,
          bgColor: "bg-warning-light",
          iconBg: "bg-warning",
          borderColor: "border-warning",
        }
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr })
    } catch {
      return "Récemment"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alertes Récentes</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/health")}>
          Tout Voir
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucune alerte récente</p>
        ) : (
          recentAlerts.map((alert, index) => {
            const config = getAlertConfig(alert.type)
            const Icon = config.icon

            return (
              <div
                key={index}
                className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => router.push(alert.link)}
              >
                <div className={`${config.iconBg} rounded-lg p-2.5 flex-shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{alert.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.priority === "high" ? "Aujourd'hui" : formatTimeAgo(new Date().toISOString())}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

