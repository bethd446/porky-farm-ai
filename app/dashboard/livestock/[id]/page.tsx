"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  Weight,
  Calendar,
  Syringe,
  Baby,
  Activity,
  Camera,
  FileText,
  TrendingUp,
  Save,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useApp } from "@/contexts/app-context"

export default function AnimalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    getAnimalById,
    updateAnimal,
    deleteAnimal,
    healthCases,
    gestations,
    addVaccination,
    getPigletsByMother,
    getMother,
    getFather,
    getFamilyTree,
  } = useApp()

  const animal = getAnimalById(params.id as string)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showWeightDialog, setShowWeightDialog] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [showVaccinationDialog, setShowVaccinationDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [editForm, setEditForm] = useState({
    name: animal?.name || "",
    breed: animal?.breed || "",
    location: (animal as any)?.location || "",
    notes: animal?.notes || "",
  })

  const [newWeight, setNewWeight] = useState("")
  const [newPhoto, setNewPhoto] = useState<string | null>(null)
  const [vaccinationName, setVaccinationName] = useState("")

  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Animal non trouve</h1>
        <p className="text-muted-foreground mb-6">L'animal demande n'existe pas ou a ete supprime.</p>
        <Link href="/dashboard/livestock">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour a la liste
          </Button>
        </Link>
      </div>
    )
  }

  const animalHealthCases = healthCases.filter((hc) => hc.animalId === animal.id)
  const animalGestations = gestations.filter((g) => g.sowId === animal.id || g.boarId === animal.id)
  const activeGestation = animalGestations.find((g) => g.status === "active")

  const gestationProgress = activeGestation
    ? (() => {
        const start = new Date(activeGestation.breedingDate)
        const now = new Date()
        const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return { daysPassed, progress: Math.min((daysPassed / 114) * 100, 100) }
      })()
    : null

  const handleSaveEdit = async () => {
    setIsLoading(true)
    updateAnimal(animal.id, {
      name: editForm.name,
      breed: editForm.breed,
      location: editForm.location,
      notes: editForm.notes,
    } as any)
    setIsLoading(false)
    setShowEditDialog(false)
  }

  const handleDelete = () => {
    deleteAnimal(animal.id)
    router.push("/dashboard/livestock")
  }

  const handleWeightUpdate = () => {
    if (!newWeight) return
    setIsLoading(true)
    updateAnimal(animal.id, {
      weight: Number.parseFloat(newWeight),
      lastWeightDate: new Date().toISOString(),
    } as any)
    setNewWeight("")
    setIsLoading(false)
    setShowWeightDialog(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewPhoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoSave = () => {
    if (!newPhoto) return
    setIsLoading(true)
    updateAnimal(animal.id, { photo: newPhoto })
    setNewPhoto(null)
    setIsLoading(false)
    setShowPhotoDialog(false)
  }

  const handleAddVaccination = () => {
    if (!vaccinationName) return
    setIsLoading(true)
    addVaccination({
      animalId: animal.id,
      animalName: animal.name,
      vaccineName: vaccinationName,
      date: new Date().toISOString().split("T")[0],
      nextDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
    })
    updateAnimal(animal.id, { lastVaccinationDate: new Date().toISOString().split("T")[0] } as any)
    setVaccinationName("")
    setIsLoading(false)
    setShowVaccinationDialog(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Gestante":
        return "bg-pink-500"
      case "Reproducteur":
        return "bg-blue-500"
      case "Actif":
        return "bg-green-500"
      case "Malade":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

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
            <p className="text-muted-foreground">
              {animal.breed} • {animal.identifier}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowPhotoDialog(true)}>
            <Camera className="h-4 w-4" />
            Photo
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => {
              setEditForm({
                name: animal.name,
                breed: animal.breed,
                location: (animal as any).location || "",
                notes: animal.notes || "",
              })
              setShowEditDialog(true)
            }}
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Image and Quick Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden shadow-soft">
            <div className="relative h-64 w-full">
              <Image src={animal.photo || "/white-sow-pig.jpg"} alt={animal.name} fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(animal.status)} text-white`}>{animal.status}</Badge>
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1">
                  <Heart className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">{(animal as any).healthScore || 85}%</span>
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
                <span className="font-medium">{animal.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Race</span>
                <span className="font-medium">{animal.breed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium">{(animal as any).age || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Poids</span>
                <span className="font-medium">{animal.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emplacement</span>
                <span className="font-medium">{(animal as any).location || "Non defini"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Apercu</TabsTrigger>
              <TabsTrigger value="health">Sante</TabsTrigger>
              <TabsTrigger value="reproduction">Reproduction</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {activeGestation && gestationProgress && (
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
                        <span>Jour {gestationProgress.daysPassed} / 114</span>
                        <span>{Math.round(gestationProgress.progress)}%</span>
                      </div>
                      <Progress value={gestationProgress.progress} className="h-3" />
                    </div>
                    <div className="flex justify-between rounded-lg bg-pink-50 p-3">
                      <span className="text-pink-700">Mise-bas prevue</span>
                      <span className="font-semibold text-pink-700">
                        {new Date(activeGestation.expectedDueDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Traçabilité - Parents */}
              {(animal.motherId || animal.fatherId) && (
                <Card className="shadow-soft border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Baby className="h-5 w-5 text-blue-500" />
                      Origine génétique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {animal.motherId && (
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Mère</p>
                          <p className="text-xs text-blue-700">
                            {getMother(animal.id)?.name || "Non identifiée"} ({getMother(animal.id)?.identifier || "N/A"})
                          </p>
                        </div>
                        {getMother(animal.id) && (
                          <Link href={`/dashboard/livestock/${animal.motherId}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              Voir →
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                    {animal.fatherId && (
                      <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                        <div>
                          <p className="text-sm font-medium text-purple-900">Père</p>
                          <p className="text-xs text-purple-700">
                            {getFather(animal.id)?.name || "Non identifié"} ({getFather(animal.id)?.identifier || "N/A"})
                          </p>
                        </div>
                        {getFather(animal.id) && (
                          <Link href={`/dashboard/livestock/${animal.fatherId}`}>
                            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                              Voir →
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Traçabilité - Porcelets (pour les truies) */}
              {animal.category === "truie" && (
                <Card className="shadow-soft border-l-4 border-l-pink-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Baby className="h-5 w-5 text-pink-500" />
                      Porcelets ({getPigletsByMother(animal.id).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getPigletsByMother(animal.id).length > 0 ? (
                      <div className="space-y-2">
                        {getPigletsByMother(animal.id).map((piglet) => (
                          <Link
                            key={piglet.id}
                            href={`/dashboard/livestock/${piglet.id}`}
                            className="flex items-center justify-between rounded-lg border border-pink-200 bg-pink-50 p-3 transition hover:bg-pink-100"
                          >
                            <div>
                              <p className="font-medium text-pink-900">{piglet.name}</p>
                              <p className="text-xs text-pink-700">
                                {piglet.identifier} • {piglet.weight} kg • {piglet.healthStatus === "bon" ? "✅ Bonne santé" : "⚠️ À surveiller"}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                              Voir →
                            </Button>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun porcelet enregistré pour cette truie.</p>
                    )}
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
                  <p className="text-muted-foreground">{animal.notes || "Aucune note pour cet animal."}</p>
                </CardContent>
              </Card>

              {animalHealthCases.filter((hc) => hc.status === "open").length > 0 && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      Alertes actives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">
                      <span className="text-amber-700">
                        {animalHealthCases.filter((hc) => hc.status === "open").length} cas sanitaire(s) en cours
                      </span>
                      <Link href="/dashboard/health">
                        <Button size="sm" className="bg-primary text-white">
                          Voir details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                    <span>Derniere vaccination</span>
                    <span className="font-medium">
                      {(animal as any).lastVaccinationDate
                        ? new Date((animal as any).lastVaccinationDate).toLocaleDateString("fr-FR")
                        : "Non renseignee"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setShowVaccinationDialog(true)}
                  >
                    Ajouter une vaccination
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
                    <span className="font-medium">{animal.weight} kg</span>
                  </div>
                  <div className="flex justify-between rounded-lg border border-border p-3">
                    <span>Derniere pesee</span>
                    <span className="font-medium">
                      {(animal as any).lastWeightDate
                        ? new Date((animal as any).lastWeightDate).toLocaleDateString("fr-FR")
                        : "Non renseignee"}
                    </span>
                  </div>
                  <Button className="w-full gap-2 bg-primary text-white" onClick={() => setShowWeightDialog(true)}>
                    <TrendingUp className="h-4 w-4" />
                    Enregistrer une pesee
                  </Button>
                </CardContent>
              </Card>

              {animalHealthCases.length > 0 && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Cas sanitaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {animalHealthCases.slice(0, 5).map((hc) => (
                        <div
                          key={hc.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-medium">{hc.issue}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(hc.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <Badge variant={hc.status === "open" ? "destructive" : "secondary"}>
                            {hc.status === "open" ? "En cours" : "Resolu"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reproduction" className="space-y-4">
              {animalGestations.length > 0 ? (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Historique des gestations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {animalGestations.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              Saillie du {new Date(g.breedingDate).toLocaleDateString("fr-FR")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Terme prevu: {new Date(g.expectedDueDate).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={g.status === "active" ? "default" : "secondary"}>
                              {g.status === "active" ? "En cours" : g.status === "completed" ? "Terminee" : "Annulee"}
                            </Badge>
                            {g.pigletCount !== undefined && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {g.pigletCount} nes, {g.pigletsSurvived} sevres
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-soft">
                  <CardContent className="py-8 text-center">
                    <Baby className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">Aucune donnee de reproduction</p>
                    <Link href="/dashboard/reproduction">
                      <Button className="mt-4 bg-transparent" variant="outline">
                        Ajouter une gestation
                      </Button>
                    </Link>
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
                    <div className="flex items-start gap-4 border-l-2 border-primary/30 pl-4">
                      <div className="flex-1">
                        <p className="font-medium">Animal ajoute au cheptel</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(animal.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant="secondary">Creation</Badge>
                    </div>
                    {animalHealthCases.map((hc) => (
                      <div key={hc.id} className="flex items-start gap-4 border-l-2 border-red-300 pl-4">
                        <div className="flex-1">
                          <p className="font-medium">{hc.issue}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(hc.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant="secondary">Sante</Badge>
                      </div>
                    ))}
                    {animalGestations.map((g) => (
                      <div key={g.id} className="flex items-start gap-4 border-l-2 border-pink-300 pl-4">
                        <div className="flex-1">
                          <p className="font-medium">Gestation enregistree</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(g.breedingDate).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant="secondary">Reproduction</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {animal.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Race</Label>
              <Input value={editForm.breed} onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Emplacement</Label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Batiment A - Box 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notes sur l'animal..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {animal.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. L'animal sera definitivement supprime du cheptel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showWeightDialog} onOpenChange={setShowWeightDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer une pesee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nouveau poids (kg)</Label>
              <Input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ex: 185"
              />
            </div>
            <p className="text-sm text-muted-foreground">Poids actuel : {animal.weight} kg</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWeightDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleWeightUpdate} disabled={isLoading || !newWeight}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre a jour la photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              {newPhoto ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-lg">
                  <Image src={newPhoto || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setNewPhoto(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span className="mt-2 text-sm text-muted-foreground">Choisir une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPhotoDialog(false)
                setNewPhoto(null)
              }}
            >
              Annuler
            </Button>
            <Button onClick={handlePhotoSave} disabled={isLoading || !newPhoto}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVaccinationDialog} onOpenChange={setShowVaccinationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une vaccination</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du vaccin</Label>
              <Input
                value={vaccinationName}
                onChange={(e) => setVaccinationName(e.target.value)}
                placeholder="Ex: PCV2, PRRS, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVaccinationDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddVaccination} disabled={isLoading || !vaccinationName}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
