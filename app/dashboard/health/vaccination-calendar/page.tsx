"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react"
import Link from "next/link"

const vaccinations = [
  {
    id: 1,
    name: "Peste Porcine Africaine",
    target: "Tout le cheptel",
    dueDate: new Date(2025, 11, 15),
    status: "Planifié",
    statusIcon: Calendar,
    statusColor: "text-blue-500",
    coverage: "0/247",
  },
  {
    id: 2,
    name: "Parvovirose",
    target: "Truies reproductrices",
    dueDate: new Date(2025, 10, 28),
    status: "Complété",
    statusIcon: CheckCircle2,
    statusColor: "text-green-500",
    coverage: "45/45",
  },
  {
    id: 3,
    name: "Rouget",
    target: "Porcelets Lot A12",
    dueDate: new Date(2025, 11, 10),
    status: "En retard",
    statusIcon: AlertCircle,
    statusColor: "text-amber-500",
    coverage: "0/11",
  },
  {
    id: 4,
    name: "Mycoplasme",
    target: "Engraissement",
    dueDate: new Date(2025, 11, 22),
    status: "Planifié",
    statusIcon: Calendar,
    statusColor: "text-blue-500",
    coverage: "0/70",
  },
]

export default function VaccinationCalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendrier vaccinal</h1>
          <p className="text-muted-foreground">Suivi complet des vaccinations de votre élevage</p>
        </div>
        <Link href="/dashboard/health">
          <Button variant="outline">Retour</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {vaccinations.map((vax) => (
          <Card key={vax.id} className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`rounded-xl p-3 ${vax.statusColor} bg-current/10`}>
                  <vax.statusIcon className={`h-6 w-6 ${vax.statusColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{vax.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{vax.target}</p>
                    </div>
                    <Badge className={`${vax.statusColor} bg-current/10`}>{vax.status}</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {vax.dueDate.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Couverture: </span>
                      <span className="text-sm text-muted-foreground">{vax.coverage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

