"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Clock, X, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useApp } from "@/contexts/app-context"
import { FormInput, FormTextarea, FormSelect } from "@/components/common/form-field"
import { healthCaseSchema } from "@/lib/validations/schemas"

const priorityOptions = [
  { value: "Basse", label: "Basse" },
  { value: "Moyenne", label: "Moyenne" },
  { value: "Haute", label: "Haute - Urgent" },
]

export function HealthCases() {
  const { healthCases, addHealthCase, updateHealthCase, animals, isLoading } = useApp()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState("")

  const [newCase, setNewCase] = useState({
    animal: "",
    issue: "",
    priority: "Moyenne" as "Basse" | "Moyenne" | "Haute",
    treatment: "",
    photo: null as string | null,
  })
  const newCasePhotoRef = useRef<HTMLInputElement>(null)

  const updateField = (field: string, value: string) => {
    setNewCase((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
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
    setErrors({})
    setErrorMessage("")

    const result = healthCaseSchema.safeParse(newCase)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setStatus("loading")

    try {
      const selectedAnimal = animals.find((a) => a.id === newCase.animal)

      if (!selectedAnimal) {
        setErrors({ animal: "Animal non trouvé" })
        setStatus("error")
        return
      }

      addHealthCase({
        animalId: newCase.animal,
        animalName: selectedAnimal.name || "Animal inconnu",
        issue: newCase.issue,
        description: newCase.issue,
        priority: newCase.priority.toLowerCase() as "low" | "medium" | "high",
        status: "open",
        treatment: newCase.treatment || undefined,
        photo: newCase.photo || undefined,
        startDate: new Date().toISOString().split("T")[0],
      })

      setStatus("success")

      setTimeout(() => {
        setNewCase({ animal: "", issue: "", priority: "Moyenne", treatment: "", photo: null })
        setDialogOpen(false)
        setStatus("idle")
      }, 1500)
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

  const handleResolveCase = (caseId: string) => {
    updateHealthCase(caseId, {
      status: "resolved",
      resolvedDate: new Date().toISOString().split("T")[0],
    })
  }

  const animalOptions = animals
    .filter((a) => a.status === "actif" || a.status === "malade")
    .map((animal) => ({
      value: animal.id,
      label: `${animal.name} (${animal.identifier})`,
    }))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      default:
        return "bg-blue-500"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical":
        return "Critique"
      case "high":
        return "Haute"
      case "medium":
        return "Moyenne"
      default:
        return "Basse"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      default:
        return "bg-amber-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "resolved":
        return "Résolu"
      case "in_progress":
        return "En traitement"
      default:
        return "Ouvert"
    }
  }

  const activeCases = healthCases.filter((c) => c.status !== "resolved")

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Chargement des cas...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Cas sanitaires actifs ({activeCases.length})</CardTitle>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setErrors({})
              setErrorMessage("")
              setStatus("idle")
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Signaler un problème
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Signaler un problème de santé</DialogTitle>
              <DialogDescription>
                Enregistrez un nouveau cas sanitaire pour un animal de votre cheptel.
              </DialogDescription>
            </DialogHeader>

            {status === "success" && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                <CheckCircle className="h-4 w-4" />
                Cas enregistré ! Pensez à suivre l'évolution.
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errorMessage || "Une erreur est survenue. Réessayez."}
              </div>
            )}

            <div className="space-y-4 py-4">
              <FormSelect
                label="Animal concerné"
                name="animal"
                options={animalOptions}
                value={newCase.animal}
                onChange={(v) => updateField("animal", v)}
                error={errors.animal}
                required
                placeholder="Sélectionner un animal"
                disabled={status === "loading" || status === "success"}
              />

              <FormTextarea
                label="Description du symptôme"
                name="issue"
                placeholder="Ex: Boiterie patte arrière droite, refus de s'alimenter depuis 2 jours..."
                value={newCase.issue}
                onChange={(e) => updateField("issue", e.target.value)}
                error={errors.issue}
                required
                disabled={status === "loading" || status === "success"}
              />
              <p className="text-xs text-muted-foreground -mt-2">
                Minimum 10 caractères. Soyez précis pour faciliter le suivi.
              </p>

              <FormSelect
                label="Priorité"
                name="priority"
                options={priorityOptions}
                value={newCase.priority}
                onChange={(v) => updateField("priority", v)}
                error={errors.priority}
                required
                disabled={status === "loading" || status === "success"}
              />

              <FormInput
                label="Traitement initial (optionnel)"
                name="treatment"
                placeholder="Ex: Antibiotiques administrés"
                value={newCase.treatment}
                onChange={(e) => updateField("treatment", e.target.value)}
                error={errors.treatment}
                disabled={status === "loading" || status === "success"}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Photo (optionnel)</label>
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
                    disabled={status === "loading" || status === "success"}
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
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={status === "loading"}>
                Annuler
              </Button>
              <Button onClick={handleAddCase} disabled={status === "loading" || status === "success"}>
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Enregistré !
                  </>
                ) : (
                  "Enregistrer le cas"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCases.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Aucun cas sanitaire actif.</p>
            <p className="text-sm text-muted-foreground">Tous vos animaux sont en bonne santé !</p>
          </div>
        ) : (
          activeCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="flex gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50"
            >
              <div className="relative">
                <img
                  src={caseItem.photo || "/placeholder.svg?height=80&width=80&query=sick pig"}
                  alt={caseItem.animalName}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{caseItem.animalName}</h4>
                    <p className="text-sm text-muted-foreground">{caseItem.issue}</p>
                  </div>
                  <Badge className={`${getPriorityColor(caseItem.priority)} text-white`}>
                    {getPriorityLabel(caseItem.priority)}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {caseItem.startDate}
                  </Badge>
                  <Badge className={`${getStatusColor(caseItem.status)} text-white`}>
                    {getStatusLabel(caseItem.status)}
                  </Badge>
                </div>
                {caseItem.treatment && (
                  <p className="mt-2 text-xs text-muted-foreground">Traitement: {caseItem.treatment}</p>
                )}
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResolveCase(caseItem.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marquer résolu
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
