import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Baby, Syringe, Weight, Utensils, Camera } from "lucide-react"

const activities = [
  {
    icon: Baby,
    title: "Nouvelle portée",
    description: "Truie #32 a mis bas 11 porcelets",
    time: "Aujourd'hui, 06:45",
    color: "bg-pink-500",
  },
  {
    icon: Syringe,
    title: "Vaccination effectuée",
    description: "15 porcelets vaccinés (Lot A12)",
    time: "Hier, 14:30",
    color: "bg-blue-500",
  },
  {
    icon: Weight,
    title: "Pesée enregistrée",
    description: "Verrat #8 - 285kg (+12kg)",
    time: "Hier, 10:00",
    color: "bg-amber-500",
  },
  {
    icon: Utensils,
    title: "Ration modifiée",
    description: "Truies allaitantes - Formule enrichie",
    time: "Il y a 2 jours",
    color: "bg-green-500",
  },
  {
    icon: Camera,
    title: "Photo ajoutée",
    description: "Truie #45 - Suivi dermatologique",
    time: "Il y a 2 jours",
    color: "bg-purple-500",
  },
]

export function DashboardRecentActivity() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={`rounded-xl ${activity.color} p-2`}>
                <activity.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
