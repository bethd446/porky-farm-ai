"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Clock, X, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialCases = [
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
  const [cases, setCases] = useState(initialCases)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [casePhotos, setCasePhotos] = useState<{ [key: number]: string }>({})
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  const [newCase, setNewCase] = useState({
    animal: "",
    issue: "",
    priority: "",
    treatment: "",
    photo: null as string | null,
  })
  const newCasePhotoRef = useRef<HTMLInputElement>(null)

  const handleCasePhotoUpload = (caseId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCasePhotos((prev) => ({ ...prev, [caseId]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewCasePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewCase((prev) => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCase = () => {
    if (newCase.animal && newCase.issue) {
      const newId = Math.max(...cases.map((c) => c.id)) + 1
      setCases([
        {
          id: newId,
          animal: newCase.animal,
          issue: newCase.issue,
          status: "Nouveau",
          statusColor: "bg-blue-500",
          priority: newCase.priority || "Moyenne",
          priorityColor:
            newCase.priority === "Haute"
              ? "bg-red-500"
              : newCase.priority === "Basse"
                ? "bg-green-500"
                : "bg-amber-500",
          date: "À l'instant",
          image: newCase.photo || "/placeholder.svg?height=80&width=80",
          treatment: newCase.treatment || "À définir",
        },
        ...cases,
      ])
      setNewCase({ animal: "", issue: "", priority: "", treatment: "", photo: null })
      setDialogOpen(false)
    }
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Cas sanitaires actifs</CardTitle>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Nouveau cas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Signaler un cas sanitaire</DialogTitle>
                <DialogDescription>Enregistrez un nouveau problème de santé pour un animal.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Animal concerné</Label>
                  <Input
                    placeholder="Ex: Truie #32"
                    value={newCase.animal}
                    onChange={(e) => setNewCase({ ...newCase, animal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Problème observé</Label>
                  <Textarea
                    placeholder="Décrivez les symptômes..."
                    value={newCase.issue}
                    onChange={(e) => setNewCase({ ...newCase, issue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select value={newCase.priority} onValueChange={(v) => setNewCase({ ...newCase, priority: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haute">Haute - Urgent</SelectItem>
                      <SelectItem value="Moyenne">Moyenne</SelectItem>
                      <SelectItem value="Basse">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Traitement initial</Label>
                  <Input
                    placeholder="Ex: Antibiotiques"
                    value={newCase.treatment}
                    onChange={(e) => setNewCase({ ...newCase, treatment: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <div className="flex gap-2">
                    <input
                      ref={newCasePhotoRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleNewCasePhoto}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => newCasePhotoRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                      {newCase.photo ? "Changer la photo" : "Prendre une photo"}
                    </Button>
                    {newCase.photo && (
                      <div className="relative h-16 w-16">
                        <img
                          src={newCase.photo || "/placeholder.svg"}
                          alt="Aperçu"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewCase({ ...newCase, photo: null })}
                          className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddCase}>Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm">
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="flex gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50"
          >
            <div className="relative">
              <img
                src={casePhotos[caseItem.id] || caseItem.image || "/placeholder.svg"}
                alt={caseItem.animal}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <input
                ref={(el) => (fileInputRefs.current[caseItem.id] = el)}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleCasePhotoUpload(caseItem.id, e)}
              />
              <button
                onClick={() => fileInputRefs.current[caseItem.id]?.click()}
                className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1.5 text-white shadow-sm hover:bg-primary/90 transition"
              >
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
