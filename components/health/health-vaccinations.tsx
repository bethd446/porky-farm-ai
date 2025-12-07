"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const vaccinations = [
  {
    id: 1,
    name: "Peste Porcine Africaine",
    target: "Tout le cheptel",
    dueDate: "15 Déc 2025",
    status: "Planifié",
    statusIcon: Calendar,
    statusColor: "text-blue-500",
    coverage: "0/247",
  },
  {
    id: 2,
    name: "Parvovirose",
    target: "Truies reproductrices",
    dueDate: "Effectué le 28 Nov",
    status: "Complété",
    statusIcon: CheckCircle2,
    statusColor: "text-green-500",
    coverage: "45/45",
  },
  {
    id: 3,
    name: "Rouget",
    target: "Porcelets Lot A12",
    dueDate: "Dans 2 jours",
    status: "En retard",
    statusIcon: AlertCircle,
    statusColor: "text-amber-500",
    coverage: "0/11",
  },
  {
    id: 4,
    name: "Mycoplasme",
    target: "Engraissement",
    dueDate: "22 Déc 2025",
    status: "Planifié",
    statusIcon: Calendar,
    statusColor: "text-blue-500",
    coverage: "0/70",
  },
]

export function HealthVaccinations() {
  const router = useRouter()

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Calendrier vaccinal</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/health?tab=vaccinations")}>
          Voir calendrier
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {vaccinations.map((vax) => (
          <div
            key={vax.id}
            className="flex items-center gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50"
          >
            <div className={`rounded-xl p-3 ${vax.statusColor} bg-current/10`}>
              <vax.statusIcon className={`h-5 w-5 ${vax.statusColor}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{vax.name}</h4>
              <p className="text-sm text-muted-foreground">{vax.target}</p>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{vax.dueDate}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline">{vax.coverage}</Badge>
              <p className={`mt-1 text-xs font-medium ${vax.statusColor}`}>{vax.status}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
