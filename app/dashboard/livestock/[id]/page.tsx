"use client"

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Edit, Trash2, Heart, Weight, Calendar, Syringe, Baby, Activity, Camera, FileText, TrendingUp } from 'lucide-react'
import Link from "next/link"

const animalData: Record<string, any> = {
  "1": {
    id: 1,
    name: "Truie #32",
    type: "Truie",
    breed: "Large White",
    birthDate: "15/03/2022",
    age: "2 ans 3 mois",
    weight: "185 kg",
    status: "Gestante",
    statusColor: "bg-pink-500",
    healthScore: 95,
    image: "/white-sow-pig-healthy-farm.jpg",
    nextEvent: "Mise-bas dans 8 jours",
    location: "Bâtiment A - Box 12",
    identifier: "CI-2022-0032",
    gestationDay: 106,
    expectedBirth: "12/07/2025",
    lastVaccination: "15/05/2025",
    lastWeight: "180 kg (il y a 2 semaines)",
    notes: "Truie en excellent état. Gestation normale, 3ème portée.",
    history: [
      { date: "01/06/2025", event: "Échographie confirmée", type: "reproduction" },
      { date: "15/05/2025", event: "Vaccination PCV2", type: "health" },
      { date: "01/05/2025", event: "Saillie réussie", type: "reproduction" },
      { date: "20/04/2025", event: "Pesée: 180 kg", type: "weight" },
    ],
    reproductionHistory: [
      { date: "Mars 2024", piglets: 12, weaned: 11, mortality: "8%" },
      { date: "Sept 2023", piglets: 10, weaned: 10, mortality: "0%" },
    ]
  },
  "2": {
    id: 2,
    name: "Verrat #8",
    type: "Verrat",
    breed: "Duroc",
    birthDate: "10/06/2021",
    age: "3 ans",
    weight: "285 kg",
    status: "Reproducteur",
    statusColor: "bg-blue-500",
    healthScore: 98,
    image: "/duroc-boar-pig-farm.jpg",
    nextEvent: "Saillie prévue demain",
    location: "Bâtiment B - Box 3",
    identifier: "CI-2021-0008",
    lastVaccination: "10/05/2025",
    lastWeight: "282 kg (il y a 1 mois)",
    notes: "Excellent reproducteur. Taux de réussite de 95%.",
    history: [
      { date: "05/06/2025", event: "Saillie Truie #45", type: "reproduction" },
      { date: "10/05/2025", event: "Vaccination PRRS", type: "health" },
      { date: "01/05/2025", event: "Pesée: 282 kg", type: "weight" },
    ],
    reproductionStats: {
      totalMates: 45,
      successRate: "95%",
      avgLitterSize: 11.2
    }
  },
}

export default function AnimalDetailPage() {
  const params = useParams()
  const animal = animalData[params.id as string] || animalData["1"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/livestock">
            <Button variant="outline" size="icon" className="bg-transparent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{animal.name}</h1>
            <p className="text-muted-foreground">{animal.breed} • {animal.identifier}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Camera className="h-4 w-4" />
            Photo
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Image and Quick Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden shadow-soft">
            <img
              src={animal.image || "/placeholder.svg"}
              alt={animal.name}
              className="h-64 w-full object-cover"
            />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Badge className={`${animal.statusColor} text-white`}>{animal.status}</Badge>
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1">
                  <Heart className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">{animal.healthScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Informations rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{animal.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Race</span>
                <span className="font-medium">{animal.breed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Âge</span>
                <span className="font-medium">{animal.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Poids</span>
                <span className="font-medium">{animal.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emplacement</span>
                <span className="font-medium">{animal.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="health">Santé</TabsTrigger>
              <TabsTrigger value="reproduction">Reproduction</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {animal.gestationDay && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Baby className="h-5 w-5 text-pink-500" />
                      Suivi de gestation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Jour {animal.gestationDay} / 114</span>
                        <span>{Math.round((animal.gestationDay / 114) * 100)}%</span>
                      </div>
                      <Progress value={(animal.gestationDay / 114) * 100} className="h-3" />
                    </div>
                    <div className="flex justify-between rounded-lg bg-pink-50 p-3">
                      <span className="text-pink-700">Mise-bas prévue</span>
                      <span className="font-semibold text-pink-700">{animal.expectedBirth}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{animal.notes}</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Prochain événement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">
                    <span className="text-amber-700">{animal.nextEvent}</span>
                    <Button size="sm" className="bg-primary text-white">Voir détails</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Syringe className="h-5 w-5 text-blue-500" />
                    Vaccinations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between rounded-lg border border-border p-3">
                    <span>Dernière vaccination</span>
                    <span className="font-medium">{animal.lastVaccination}</span>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Voir le calendrier vaccinal
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Weight className="h-5 w-5 text-emerald-500" />
                    Suivi du poids
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between rounded-lg border border-border p-3">
                    <span>Poids actuel</span>
                    <span className="font-medium">{animal.weight}</span>
                  </div>
                  <div className="flex justify-between rounded-lg border border-border p-3">
                    <span>Dernière pesée</span>
                    <span className="font-medium">{animal.lastWeight}</span>
                  </div>
                  <Button className="w-full gap-2 bg-primary text-white">
                    <TrendingUp className="h-4 w-4" />
                    Enregistrer une pesée
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reproduction" className="space-y-4">
              {animal.reproductionHistory && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Historique des portées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {animal.reproductionHistory.map((record: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <span className="font-medium">{record.date}</span>
                          <div className="flex gap-4 text-sm">
                            <span>{record.piglets} nés</span>
                            <span className="text-green-600">{record.weaned} sevrés</span>
                            <span className="text-muted-foreground">Mort.: {record.mortality}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {animal.reproductionStats && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiques de reproduction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-blue-50 p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{animal.reproductionStats.totalMates}</p>
                        <p className="text-sm text-muted-foreground">Saillies totales</p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{animal.reproductionStats.successRate}</p>
                        <p className="text-sm text-muted-foreground">Taux de réussite</p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{animal.reproductionStats.avgLitterSize}</p>
                        <p className="text-sm text-muted-foreground">Portée moyenne</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Historique complet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {animal.history?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 border-l-2 border-primary/30 pl-4">
                        <div className="flex-1">
                          <p className="font-medium">{item.event}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {item.type === "reproduction" ? "Reproduction" : 
                           item.type === "health" ? "Santé" : "Poids"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
