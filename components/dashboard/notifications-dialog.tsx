"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, CheckCircle2, Info, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const notifications = [
  {
    id: 1,
    type: "alert",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50",
    title: "Truie #45 - Fièvre détectée",
    message: "Température élevée détectée il y a 2 heures",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 2,
    type: "success",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    title: "Vaccination complétée",
    message: "12 porcelets vaccinés avec succès",
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 3,
    type: "info",
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "Mise-bas imminente",
    message: "Truie #32 - Terme prévu dans 2 jours",
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
]

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Vos alertes et notifications récentes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div
                  key={notification.id}
                  className={`flex gap-3 rounded-lg p-3 transition hover:bg-muted ${
                    !notification.read ? notification.bg : ""
                  }`}
                >
                  <div className={`rounded-lg p-2 ${notification.bg}`}>
                    <Icon className={`h-5 w-5 ${notification.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(notification.time, "PPp", { locale: fr })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Marquer tout comme lu
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

