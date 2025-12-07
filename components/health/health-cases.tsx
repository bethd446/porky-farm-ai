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
import { useHealth } from "@/contexts/health-context"
import { useLivestock } from "@/contexts/livestock-context"
import { FormInput, FormTextarea, FormSelect } from "@/components/common/form-field"
import { healthCaseSchema, type HealthCaseFormData } from "@/lib/validations/schemas"

const priorityOptions = [
  { value: "Haute", label: "Haute - Urgent" },
  { value: "Moyenne", label: "Moyenne" },
  { value: "Basse", label: "Basse" },
]

export function HealthCases() {
  const { cases, addCase, loading } = useHealth()
  const { animals } = useLivestock()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [casePhotos, setCasePhotos] = useState<{ [key: string]: string }>({})
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const [newCase, setNewCase] = useState<HealthCaseFormData & { photo: string | null }>({
    animal: "",
    issue: "",
    priority: "Moyenne",
    treatment: "",
    photo: null,
  })
  const newCasePhotoRef = useRef<HTMLInputElement>(null)

  const updateField = (field: keyof HealthCaseFormData, value: string) => {
    setNewCase((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleCasePhotoUpload = (caseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAddCase = async () => {
    setErrors({})

    // Validate with Zod
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
      const severityMap: Record<string, "low" | "medium" | "high" | "critical"> = {
        Haute: "high",
        Moyenne: "medium",
        Basse: "low",
      }

      await addCase({
        animal: newCase.animal,
        issue: newCase.issue,
        title: newCase.issue,
        description: newCase.issue,
        severity: severityMap[newCase.priority] || "medium",
        treatment: newCase.treatment || "À définir",
        image_url: newCase.photo || undefined,
        type: "disease",
      })

      setStatus("success")

      // Reset after success
      setTimeout(() => {
        setNewCase({ animal: "", issue: "", priority: "Moyenne", treatment: "", photo: null })
        setDialogOpen(false)
        setStatus("idle")
      }, 1500)
    } catch (error) {
      setStatus("error")
    }
  }

  const animalOptions = animals.map((animal) => ({
    value: animal.name || animal.identifier,
    label: animal.name || animal.identifier,
  }))

  if (loading) {
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

              {status === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Cas enregistré avec succès !
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Une erreur est survenue
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
                  label="Problème observé"
                  name="issue"
                  placeholder="Décrivez les symptômes en détail..."
                  value={newCase.issue}
                  onChange={(e) => updateField("issue", e.target.value)}
                  error={errors.issue}
                  required
                  disabled={status === "loading" || status === "success"}
                />

                <FormSelect
                  label="Priorité"
                  name="priority"
                  options={priorityOptions}
                  value={newCase.priority}
                  onChange={(v) => updateField("priority", v as HealthCaseFormData["priority"])}
                  error={errors.priority}
                  required
                  disabled={status === "loading" || status === "success"}
                />

                <FormInput
                  label="Traitement initial"
                  name="treatment"
                  placeholder="Ex: Antibiotiques"
                  value={newCase.treatment || ""}
                  onChange={(e) => updateField("treatment", e.target.value)}
                  error={errors.treatment}
                  disabled={status === "loading" || status === "success"}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Photo</label>
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
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm">
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cases.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun cas sanitaire actif.</p>
        ) : (
          cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="flex gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50"
            >
              <div className="relative">
                <img
                  src={
                    casePhotos[caseItem.id] ||
                    caseItem.image_url ||
                    "/placeholder.svg?height=80&width=80&query=pig health" ||
                    "/placeholder.svg"
                  }
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
                  <Badge className={`${caseItem.statusColor} text-white`}>
                    {caseItem.status === "ongoing" ? "En traitement" : caseItem.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{caseItem.treatment}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
