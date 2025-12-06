"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Baby, Calendar, Eye } from "lucide-react"

const gestations = [
  {
    id: 1,
    sow: "Truie #32",
    boar: "Verrat #8",
    breedingDate: "25 Août 2025",
    dueDate: "18 Déc 2025",
    day: 104,
    totalDays: 114,
    status: "Proche terme",
    statusColor: "bg-red-500",
    image: "/placeholder.svg?height=60&width=60",
    notes: "Échographie OK - 12 fœtus détectés",
  },
  {
    id: 2,
    sow: "Truie #18",
    boar: "Verrat #5",
    breedingDate: "15 Sept 2025",
    dueDate: "7 Jan 2026",
    day: 82,
    totalDays: 114,
    status: "En cours",
    statusColor: "bg-green-500",
    image: "/placeholder.svg?height=60&width=60",
    notes: "Gestation confirmée",
  },
  {
    id: 3,
    sow: "Truie #51",
    boar: "Verrat #8",
    breedingDate: "1 Oct 2025",
    dueDate: "23 Jan 2026",
    day: 66,
    totalDays: 114,
    status: "En cours",
    statusColor: "bg-green-500",
    image: "/placeholder.svg?height=60&width=60",
    notes: "RAS - Appétit normal",
  },
  {
    id: 4,
    sow: "Truie #27",
    boar: "Verrat #3",
    breedingDate: "20 Oct 2025",
    dueDate: "11 Fév 2026",
    day: 47,
    totalDays: 114,
    status: "Début gestation",
    statusColor: "bg-blue-500",
    image: "/placeholder.svg?height=60&width=60",
    notes: "Échographie prévue J+28",
  },
]

export function GestationTracker() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-pink-500" />
          Suivi des gestations
        </CardTitle>
        <Button variant="outline" size="sm">
          Voir tout
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {gestations.map((gest) => (
          <div key={gest.id} className="rounded-xl border border-border p-4 transition hover:bg-muted/50">
            <div className="flex items-start gap-4">
              <img
                src={gest.image || "/placeholder.svg"}
                alt={gest.sow}
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{gest.sow}</h4>
                    <p className="text-sm text-muted-foreground">Père: {gest.boar}</p>
                  </div>
                  <Badge className={`${gest.statusColor} text-white`}>{gest.status}</Badge>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Jour {gest.day} / {gest.totalDays}
                    </span>
                    <span className="font-medium text-foreground">
                      {Math.round((gest.day / gest.totalDays) * 100)}%
                    </span>
                  </div>
                  <Progress value={(gest.day / gest.totalDays) * 100} className="h-2" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Saillie: {gest.breedingDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Baby className="h-3 w-3" />
                    Terme prévu: {gest.dueDate}
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{gest.notes}</p>
              </div>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
