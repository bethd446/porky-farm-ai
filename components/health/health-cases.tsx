"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Clock, X, Plus, Loader2, CheckCircle, AlertCircle, Stethoscope } from "lucide-react"
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
  { value: "Basse", label: "Basse - Surveillance" },
  { value: "Moyenne", label: "Moyenne - A traiter" },
  { value: "Haute", label: "Haute - Urgent" },
]

export function HealthCases() {
  const { healthCases, addHealthCase, updateHealthCase, animals, isLoading } = useApp()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [symptomDialogOpen, setSymptomDialogOpen] = useState(false)
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

  const [symptomData, setSymptomData] = useState({
    animal: "",
    symptom: "",
    photo: null as string | null,
  })
  const [symptomStatus, setSymptomStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [symptomErrors, setSymptomErrors] = useState<Record<string, string>>({})

  const newCasePhotoRef = useRef<HTMLInputElement>(null)
  const symptomPhotoRef = useRef<HTMLInputElement>(null)

  const updateField = (field: string, value: string) => {
    setNewCase((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleNewCasePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: "Image trop volumineuse (max 5Mo)" }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewCase((prev) => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSymptomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSymptomErrors((prev) => ({ ...prev, photo: "Image trop volumineuse (max 5Mo)" }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setSymptomData((prev) => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCase = async () => {
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
        setErrors({ animal: "Animal non trouve" })
        setStatus("error")
        return
      }

      await addHealthCase({
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

  const handleCaptureSymptom = async () => {
    setSymptomErrors({})

    const result = symptomSchema.safeParse(symptomData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string
        fieldErrors[field] = err.message
      })
      setSymptomErrors(fieldErrors)
      return
    }

    setSymptomStatus("loading")

    try {
      const selectedAnimal = animals.find((a) => a.id === symptomData.animal)

      if (!selectedAnimal) {
        setSymptomErrors({ animal: "Animal non trouve" })
        setSymptomStatus("error")
        return
      }

      const newHealthCase = await addHealthCase({
        animalId: symptomData.animal,
        animalName: selectedAnimal.name || "Animal inconnu",
        issue: symptomData.symptom,
        description: `Symptome capture: ${symptomData.symptom}`,
        priority: "medium",
        status: "open",
        photo: symptomData.photo || undefined,
        startDate: new Date().toISOString().split("T")[0],
      })

      if (!newHealthCase) {
        throw new Error("Echec de l'enregistrement du symptome")
      }

      setSymptomStatus("success")

      setTimeout(() => {
        setSymptomData({ animal: "", symptom: "", photo: null })
        setSymptomDialogOpen(false)
        setSymptomStatus("idle")
      }, 1500)
    } catch (error) {
      setSymptomStatus("error")
      setSymptomErrors({ general: error instanceof Error ? error.message : "Une erreur est survenue" })
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
        return "bg-destructive"
      case "medium":
        return "bg-warning"
      default:
        return "bg-info"
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
        return "bg-success"
      case "in_progress":
        return "bg-info"
      default:
        return "bg-warning"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "resolved":
        return "Resolu"
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
        <div className="flex gap-2">
          <Dialog
            open={symptomDialogOpen}
            onOpenChange={(open) => {
              setSymptomDialogOpen(open)
              if (!open) {
                setSymptomErrors({})
                setSymptomStatus("idle")
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <Camera className="h-4 w-4" />
                Capturer un symptome
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Capturer un symptome</DialogTitle>
                <DialogDescription>Prenez une photo et decrivez rapidement le symptome observe.</DialogDescription>
              </DialogHeader>

              {symptomStatus === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Symptome enregistre ! Un cas sanitaire a ete cree.
                </div>
              )}

              {symptomStatus === "error" && symptomErrors.general && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {symptomErrors.general}
                </div>
              )}

              <div className="space-y-4 py-4">
                <FormSelect
                  label="Animal concerne"
                  name="animal"
                  options={animalOptions}
                  value={symptomData.animal}
                  onChange={(v) => {
                    setSymptomData((prev) => ({ ...prev, animal: v }))
                    if (symptomErrors.animal) setSymptomErrors((prev) => ({ ...prev, animal: "" }))
                  }}
                  error={symptomErrors.animal}
                  required
                  placeholder="Selectionner un animal"
                  disabled={symptomStatus === "loading" || symptomStatus === "success"}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Photo du symptome</label>
                  <div className="flex gap-2">
                    <input
                      ref={symptomPhotoRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleSymptomPhoto}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 bg-transparent flex-1"
                      onClick={() => symptomPhotoRef.current?.click()}
                      disabled={symptomStatus === "loading" || symptomStatus === "success"}
                    >
                      <Camera className="h-4 w-4" />
                      {symptomData.photo ? "Changer la photo" : "Prendre une photo"}
                    </Button>
                  </div>
                  {symptomData.photo && (
                    <div className="relative mt-2">
                      <img
                        src={symptomData.photo || "/placeholder.svg"}
                        alt="Apercu du symptome"
                        className="h-32 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setSymptomData({ ...symptomData, photo: null })}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {symptomErrors.photo && <p className="text-xs text-destructive">{symptomErrors.photo}</p>}
                </div>

                <FormTextarea
                  label="Description du symptome"
                  name="symptom"
                  placeholder="Ex: Boiterie, refus de manger, toux..."
                  value={symptomData.symptom}
                  onChange={(e) => {
                    setSymptomData((prev) => ({ ...prev, symptom: e.target.value }))
                    if (symptomErrors.symptom) setSymptomErrors((prev) => ({ ...prev, symptom: "" }))
                  }}
                  error={symptomErrors.symptom}
                  required
                  disabled={symptomStatus === "loading" || symptomStatus === "success"}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSymptomDialogOpen(false)}
                  disabled={symptomStatus === "loading"}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCaptureSymptom}
                  disabled={symptomStatus === "loading" || symptomStatus === "success"}
                >
                  {symptomStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : symptomStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Enregistre !
                    </>
                  ) : (
                    <>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Enregistrer le symptome
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
                Signaler un cas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Signaler un probleme de sante</DialogTitle>
                <DialogDescription>
                  Enregistrez un nouveau cas sanitaire pour un animal de votre cheptel.
                </DialogDescription>
              </DialogHeader>

              {status === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Cas enregistre ! Pensez a suivre l'evolution.
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage || "Une erreur est survenue. Reessayez."}
                </div>
              )}

              {animalOptions.length === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  Aucun animal dans votre cheptel. Ajoutez d'abord des animaux.
                </div>
              )}

              <div className="space-y-4 py-4">
                <FormSelect
                  label="Animal concerne"
                  name="animal"
                  options={animalOptions}
                  value={newCase.animal}
                  onChange={(v) => updateField("animal", v)}
                  error={errors.animal}
                  required
                  placeholder={animalOptions.length === 0 ? "Aucun animal disponible" : "Selectionner un animal"}
                  disabled={status === "loading" || status === "success" || animalOptions.length === 0}
                />

                <FormTextarea
                  label="Description du symptome"
                  name="issue"
                  placeholder="Ex: Boiterie patte arriere droite, refus de s'alimenter depuis 2 jours..."
                  value={newCase.issue}
                  onChange={(e) => updateField("issue", e.target.value)}
                  error={errors.issue}
                  required
                  disabled={status === "loading" || status === "success"}
                />
                <p className="text-xs text-muted-foreground -mt-2">
                  Minimum 10 caracteres. Soyez precis pour faciliter le suivi.
                </p>

                <FormSelect
                  label="Priorite"
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
                  placeholder="Ex: Antibiotiques administres"
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
                          src={newCase.photo || "/placeholder.svg?height=80&width=80&query=sick pig"}
                          alt="Apercu"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewCase({ ...newCase, photo: null })}
                          className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.photo && <p className="text-xs text-destructive">{errors.photo}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={status === "loading"}>
                  Annuler
                </Button>
                <Button
                  onClick={handleAddCase}
                  disabled={status === "loading" || status === "success" || animalOptions.length === 0}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Enregistre !
                    </>
                  ) : (
                    "Enregistrer le cas"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCases.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-base font-medium text-foreground">Aucun probleme en cours</p>
            <p className="text-sm text-muted-foreground mt-1">Tous vos animaux sont en bonne sante</p>
          </div>
        ) : (
          activeCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="flex gap-4 rounded-lg border border-border p-4 list-item-clickable focus-ring"
              role="article"
              tabIndex={0}
              aria-label={`Cas sanitaire: ${caseItem.animalName}`}
            >
              <div className="relative shrink-0">
                <img
                  src={caseItem.photo || "/placeholder.svg?height=80&width=80&query=sick pig"}
                  alt={caseItem.animalName}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{caseItem.animalName}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{caseItem.issue}</p>
                  </div>
                  <Badge className={`${getPriorityColor(caseItem.priority)} text-white shrink-0`}>
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
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-1">Traitement: {caseItem.treatment}</p>
                )}
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveCase(caseItem.id)}
                    className="tap-target bg-transparent"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer resolu
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
