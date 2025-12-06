"use client"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Edit, Trash2, Heart, Weight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const animals = [
  {
    id: 1,
    name: "Truie #32",
    type: "Truie",
    breed: "Large White",
    age: "2 ans 3 mois",
    weight: "185 kg",
    status: "Gestante",
    statusColor: "bg-pink-500",
    image: "/white-sow-pig-healthy-farm.jpg",
    healthScore: 95,
    nextEvent: "Mise-bas dans 8 jours",
  },
  {
    id: 2,
    name: "Verrat #8",
    type: "Verrat",
    breed: "Duroc",
    age: "3 ans",
    weight: "285 kg",
    status: "Reproducteur",
    statusColor: "bg-blue-500",
    image: "/duroc-boar-pig-farm.jpg",
    healthScore: 98,
    nextEvent: "Saillie prévue demain",
  },
  {
    id: 3,
    name: "Truie #45",
    type: "Truie",
    breed: "Landrace",
    age: "1 an 8 mois",
    weight: "165 kg",
    status: "Sous traitement",
    statusColor: "bg-amber-500",
    image: "/landrace-sow-pig-farm.jpg",
    healthScore: 72,
    nextEvent: "Fin traitement dans 3 jours",
  },
  {
    id: 4,
    name: "Lot Porcelets A12",
    type: "Porcelets",
    breed: "Croisé",
    age: "6 semaines",
    weight: "12 kg moy.",
    status: "Sevrage",
    statusColor: "bg-green-500",
    image: "/piglets-group-farm-cute.jpg",
    healthScore: 100,
    count: 11,
    nextEvent: "Vaccination dans 2 jours",
  },
  {
    id: 5,
    name: "Truie #28",
    type: "Truie",
    breed: "Large White",
    age: "4 ans",
    weight: "195 kg",
    status: "Allaitante",
    statusColor: "bg-purple-500",
    image: "/nursing-sow-with-piglets-farm.jpg",
    healthScore: 90,
    nextEvent: "Sevrage dans 12 jours",
  },
  {
    id: 6,
    name: "Porc #67",
    type: "Engraissement",
    breed: "Croisé",
    age: "5 mois",
    weight: "85 kg",
    status: "Croissance",
    statusColor: "bg-emerald-500",
    image: "/fattening-pig-farm-healthy.jpg",
    healthScore: 96,
    nextEvent: "Pesée dans 5 jours",
  },
]

export function LivestockList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {animals.map((animal) => (
        <Card key={animal.id} className="group overflow-hidden shadow-soft transition hover:shadow-lg">
          <div className="relative">
            <img
              src={animal.image || "/placeholder.svg"}
              alt={animal.name}
              className="h-48 w-full object-cover transition group-hover:scale-105"
            />
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge className={`${animal.statusColor} text-white`}>{animal.status}</Badge>
              {animal.count && (
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {animal.count} têtes
                </Badge>
              )}
            </div>
            <div className="absolute right-3 top-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{animal.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {animal.breed} • {animal.age}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
                <Heart className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">{animal.healthScore}%</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Weight className="h-4 w-4" />
                {animal.weight}
              </div>
              <span className="text-xs text-muted-foreground">{animal.nextEvent}</span>
            </div>

            <Link href={`/dashboard/livestock/${animal.id}`}>
              <Button variant="outline" className="mt-4 w-full bg-transparent">
                Voir le profil
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}
