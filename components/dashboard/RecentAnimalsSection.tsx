/**
 * Section Animaux Récents (Web) - Style UX Pilot
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { mapCategoryFromDb, mapStatusFromDb } from "@/lib/utils/animal-helpers"

export function RecentAnimalsSection() {
  const { animals } = useApp()
  const router = useRouter()

  const recentAnimals = animals
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 3)

  const getStatusBadge = (status: string, category: string) => {
    const statusFr = mapStatusFromDb(status)
    const categoryFr = mapCategoryFromDb(category)

    if (categoryFr === "Porcelet") {
      return { label: "Porcelet", variant: "default" as const, className: "bg-blue-100 text-blue-700" }
    }

    switch (statusFr) {
      case "Actif":
        return { label: "Sain", variant: "default" as const, className: "bg-success-light text-success" }
      case "Malade":
        return { label: "Soins", variant: "default" as const, className: "bg-warning-light text-warning" }
      default:
        return { label: statusFr, variant: "secondary" as const, className: "" }
    }
  }

  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return "Âge inconnu"
    const birth = new Date(birthDate)
    const now = new Date()
    const months = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30))
    if (months < 1) {
      const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
      return `${days} jour${days > 1 ? "s" : ""}`
    }
    if (months < 12) {
      return `${months} mois`
    }
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) {
      return `${years} an${years > 1 ? "s" : ""}`
    }
    return `${years} an${years > 1 ? "s" : ""} ${remainingMonths} mois`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Animaux Récents</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/livestock")}>
          Voir Tout
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentAnimals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun animal enregistré</p>
        ) : (
          recentAnimals.map((animal) => {
            const badge = getStatusBadge(animal.status, animal.category)
            const identifier = animal.identifier || `Porc #${animal.id.slice(0, 6)}`
            const age = calculateAge(animal.birth_date)

            return (
              <div
                key={animal.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/livestock/${animal.id}`)}
              >
                {/* Photo */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {animal.photo ? (
                    <Image
                      src={animal.photo}
                      alt={identifier}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🐷</div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">{identifier}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{age}</span>
                    {animal.weight && (
                      <>
                        <span>•</span>
                        <span>{animal.weight} kg</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Badge */}
                <Badge className={badge.className || ""}>{badge.label}</Badge>

                {/* Chevron */}
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

