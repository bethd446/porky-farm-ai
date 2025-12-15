"use client"

import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Baby, Syringe, Weight, Utensils, Camera, PiggyBank, Heart, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export function DashboardRecentActivity() {
  const { activities } = useApp()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "animal_added":
        return { icon: PiggyBank, color: "bg-green-500" }
      case "animal_sold":
        return { icon: Weight, color: "bg-blue-500" }
      case "health_case":
        return { icon: AlertTriangle, color: "bg-amber-500" }
      case "gestation":
        return { icon: Baby, color: "bg-pink-500" }
      case "vaccination":
        return { icon: Syringe, color: "bg-blue-500" }
      case "feeding":
        return { icon: Utensils, color: "bg-green-500" }
      case "death":
        return { icon: Heart, color: "bg-red-500" }
      default:
        return { icon: Camera, color: "bg-purple-500" }
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Historique des actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Camera className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">Aucune activite enregistree</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                Vos actions (ajout d'animaux, soins, saillies) s'afficheront ici
              </p>
            </div>
          ) : (
            activities.slice(0, 5).map((activity) => {
              const { icon: Icon, color } = getActivityIcon(activity.type)

              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`rounded-xl ${color} p-2`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(activity.createdAt)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
