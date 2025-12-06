"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Clock } from "lucide-react"

const cases = [
  {
    id: 1,
    animal: "Truie #45",
    issue: "Fièvre et perte d'appétit",
    status: "En traitement",
    statusColor: "bg-amber-500",
    priority: "Haute",
    priorityColor: "bg-red-500",
    date: "Il y a 2 jours",
    image: "/sick-pig-symptoms-veterinary.jpg",
    treatment: "Antibiotiques - Jour 3/7",
  },
  {
    id: 2,
    animal: "Porcelet #A12-3",
    issue: "Diarrhée",
    status: "Surveillance",
    statusColor: "bg-blue-500",
    priority: "Moyenne",
    priorityColor: "bg-amber-500",
    date: "Hier",
    image: "/piglet-health-check.jpg",
    treatment: "Réhydratation + régime",
  },
  {
    id: 3,
    animal: "Truie #28",
    issue: "Boiterie patte arrière",
    status: "En observation",
    statusColor: "bg-purple-500",
    priority: "Basse",
    priorityColor: "bg-green-500",
    date: "Il y a 3 jours",
    image: "/placeholder.svg?height=80&width=80",
    treatment: "Repos + anti-inflammatoire",
  },
]

export function HealthCases() {
  const router = useRouter()
  
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Cas sanitaires actifs</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push("/dashboard/health")}
        >
          Voir tout
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="flex gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50"
          >
            <div className="relative">
              <img
                src={caseItem.image || "/placeholder.svg"}
                alt={caseItem.animal}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <button className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1.5 text-white shadow-sm">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{caseItem.animal}</h4>
                  <p className="text-sm text-muted-foreground">{caseItem.issue}</p>
                </div>
                <Badge className={`${caseItem.priorityColor} text-white`}>{caseItem.priority}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {caseItem.date}
                </Badge>
                <Badge className={`${caseItem.statusColor} text-white`}>{caseItem.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{caseItem.treatment}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
