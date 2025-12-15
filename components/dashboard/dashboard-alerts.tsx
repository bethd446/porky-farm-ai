"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Syringe, Baby, Check, Eye, Mail, Loader2 } from "lucide-react"
import { sendAlertEmail, areEmailNotificationsEnabled, getUserEmail } from "@/lib/email/notifications"

export function DashboardAlerts() {
  const router = useRouter()
  const { alerts } = useApp()
  const [sendingEmail, setSendingEmail] = useState<number | null>(null)
  const [emailSent, setEmailSent] = useState<number[]>([])

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

  const handleSendAlertEmail = async (alert: (typeof alerts)[0], index: number) => {
    const userEmail = getUserEmail()
    if (!userEmail || !areEmailNotificationsEnabled()) return

    setSendingEmail(index)

    const success = await sendAlertEmail(userEmail, {
      type: alert.type as "health" | "gestation" | "vaccination" | "general",
      title: alert.title,
      message: alert.description,
      actionUrl: `https://www.porkyfarm.app${alert.link}`,
    })

    if (success) {
      setEmailSent((prev) => [...prev, index])
    }

    setSendingEmail(null)
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base font-medium">
          Alertes importantes
          {alerts.length > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">{alerts.length}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Check className="h-12 w-12 text-green-500 mb-2" />
            <p className="text-sm font-medium text-foreground">Tout est sous controle</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
              Aucune alerte pour le moment. Continuez votre bon travail !
            </p>
          </div>
        ) : (
          alerts.slice(0, 5).map((alert, index) => {
            const Icon = getAlertIcon(alert.type)
            const style = getAlertStyle(alert.priority)
            const isEmailSent = emailSent.includes(index)

            return (
              <button
                key={index}
                className={`flex items-start gap-3 rounded-lg ${style.bg} p-3 w-full text-left tap-target hover-highlight focus-ring`}
                onClick={() => router.push(alert.link)}
                aria-label={`${alert.title}: ${alert.description}`}
              >
                <div className={`rounded-lg bg-white dark:bg-card p-2 ${style.color} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {(alert.priority === "critical" || alert.priority === "high") &&
                    areEmailNotificationsEnabled() &&
                    getUserEmail() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${isEmailSent ? "text-success" : ""}`}
                        onClick={() => handleSendAlertEmail(alert, index)}
                        disabled={sendingEmail === index || isEmailSent}
                        title={isEmailSent ? "Email envoye" : "Envoyer par email"}
                      >
                        {sendingEmail === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isEmailSent ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
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
