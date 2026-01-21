"use client"

import type React from "react"
import { useState, useRef } from "react"
import { HealthOverview } from "@/components/health/health-overview"
import { HealthCases } from "@/components/health/health-cases"
import { HealthVaccinations } from "@/components/health/health-vaccinations"
import { Button } from "@/components/ui/button"
import { Plus, Camera, X, Loader2, CheckCircle, AlertCircle, Stethoscope, Info } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApp } from "@/contexts/app-context"
import { FormTextarea, FormSelect, FormInput } from "@/components/common/form-field"
import { healthCaseSchema } from "@/lib/validations/schemas"
import Link from "next/link"

const priorityOptions = [
  { value: "Basse", label: "Basse - Surveillance" },
  { value: "Moyenne", label: "Moyenne - A traiter" },
  { value: "Haute", label: "Haute - Urgent" },
]

export default function HealthPage() {
  const { animals, addHealthCase } = useApp()

  // Dialog states
  const [caseDialogOpen, setCaseDialogOpen] = useState(false)
  const [symptomDialogOpen, setSymptomDialogOpen] = useState(false)

  // New case state
  const [caseStatus, setCaseStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [caseErrors, setCaseErrors] = useState<Record<string, string>>({})
  const [caseErrorMessage, setCaseErrorMessage] = useState("")
  const [newCase, setNewCase] = useState({
    animal: "",
    issue: "",
    priority: "Moyenne" as "Basse" | "Moyenne" | "Haute",
    treatment: "",
    photo: null as string | null,
  })
  const newCasePhotoRef = useRef<HTMLInputElement>(null)

  // Symptom capture state
  const [symptomStatus, setSymptomStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [symptomErrors, setSymptomErrors] = useState<Record<string, string>>({})
  const [symptomData, setSymptomData] = useState({
    animal: "",
    symptom: "",
    photo: null as string | null,
  })
  const symptomPhotoRef = useRef<HTMLInputElement>(null)

  const animalOptions = animals
    .filter((a) => a.status === "actif" || a.status === "malade")
    .map((animal) => ({
      value: animal.id,
      label: `${animal.name} (${animal.identifier})`,
    }))

  const hasAnimals = animalOptions.length > 0

  // --- NEW CASE HANDLERS ---
  const updateCaseField = (field: string, value: string) => {
    setNewCase((prev) => ({ ...prev, [field]: value }))
    if (caseErrors[field]) {
      setCaseErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleNewCasePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setCaseErrors((prev) => ({ ...prev, photo: "Image trop volumineuse (max 5Mo)" }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewCase((prev) => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCase = async () => {
    setCaseErrors({})
    setCaseErrorMessage("")

    const result = healthCaseSchema.safeParse(newCase)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string
        fieldErrors[field] = err.message
      })
      setCaseErrors(fieldErrors)
      return
    }

    setCaseStatus("loading")

    try {
      const selectedAnimal = animals.find((a) => a.id === newCase.animal)

      if (!selectedAnimal) {
        setCaseErrors({ animal: "Animal non trouve" })
        setCaseStatus("error")
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

      setCaseStatus("success")

      setTimeout(() => {
        setNewCase({ animal: "", issue: "", priority: "Moyenne", treatment: "", photo: null })
        setCaseDialogOpen(false)
        setCaseStatus("idle")
      }, 1500)
    } catch (error) {
      setCaseStatus("error")
      setCaseErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

  // --- SYMPTOM CAPTURE HANDLERS ---
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

  const handleCaptureSymptom = () => {
    setSymptomErrors({})

    if (!symptomData.animal) {
      setSymptomErrors({ animal: "Selectionnez un animal" })
      return
    }

    if (!symptomData.symptom || symptomData.symptom.length < 5) {
      setSymptomErrors({ symptom: "Decrivez le symptome (minimum 5 caracteres)" })
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

      addHealthCase({
        animalId: symptomData.animal,
        animalName: selectedAnimal.name || "Animal inconnu",
        issue: symptomData.symptom,
        description: `Symptome capture: ${symptomData.symptom}`,
        priority: "medium",
        status: "open",
        photo: symptomData.photo || undefined,
        startDate: new Date().toISOString().split("T")[0],
      })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sante du cheptel</h1>
          <p className="text-muted-foreground">Suivez l'etat sanitaire de vos animaux</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => {
              if (hasAnimals) {
                setSymptomDialogOpen(true)
                setSymptomErrors({})
                setSymptomStatus("idle")
              }
            }}
            disabled={!hasAnimals}
            title={!hasAnimals ? "Ajoutez d'abord un animal" : "Capturer rapidement un symptome"}
          >
            <Camera className="h-4 w-4" />
            Photo symptome
          </Button>
          <Button
            className="gap-2 bg-primary text-white hover:bg-primary-dark"
            onClick={() => {
              if (hasAnimals) {
                setCaseDialogOpen(true)
                setCaseErrors({})
                setCaseStatus("idle")
              }
            }}
            disabled={!hasAnimals}
            title={!hasAnimals ? "Ajoutez d'abord un animal" : "Declarer un probleme de sante"}
          >
            <Plus className="h-4 w-4" />
            Declarer un probleme
          </Button>
        </div>
      </div>

      {!hasAnimals && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Cheptel vide</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Enregistrez vos animaux pour pouvoir declarer des cas sanitaires.
            </p>
            <Link href="/dashboard/livestock/add">
              <Button variant="outline" size="sm" className="mt-2 bg-transparent border-amber-300">
                <Plus className="h-4 w-4 mr-1" />
                Enregistrer un animal
              </Button>
            </Link>
          </div>
        </div>
      )}

      <HealthOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <HealthCases />
        <HealthVaccinations />
      </div>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Photo d'un symptome
            </DialogTitle>
            <DialogDescription>Prenez une photo et decrivez le symptome observe.</DialogDescription>
          </DialogHeader>

          {symptomStatus === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
              <CheckCircle className="h-4 w-4" />
              Symptome enregistre. Un cas sanitaire a ete cree automatiquement.
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
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
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
                  Enregistrement en cours...
                </>
              ) : symptomStatus === "success" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Enregistre
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
        open={caseDialogOpen}
        onOpenChange={(open) => {
          setCaseDialogOpen(open)
          if (!open) {
            setCaseErrors({})
            setCaseErrorMessage("")
            setCaseStatus("idle")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Declarer un probleme de sante
            </DialogTitle>
            <DialogDescription>Enregistrez un cas sanitaire pour suivre son evolution.</DialogDescription>
          </DialogHeader>

          {caseStatus === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
              <CheckCircle className="h-4 w-4" />
              Cas enregistre. N'oubliez pas de le mettre a jour regulierement.
            </div>
          )}

          {caseStatus === "error" && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {caseErrorMessage || "Une erreur est survenue. Reessayez."}
            </div>
          )}

          <div className="space-y-4 py-4">
            <FormSelect
              label="Animal concerne"
              name="animal"
              options={animalOptions}
              value={newCase.animal}
              onChange={(v) => updateCaseField("animal", v)}
              error={caseErrors.animal}
              required
              placeholder="Selectionner un animal"
              disabled={caseStatus === "loading" || caseStatus === "success"}
            />

            <FormTextarea
              label="Description du probleme"
              name="issue"
              placeholder="Ex: Boiterie patte arriere droite, refus de s'alimenter depuis 2 jours..."
              value={newCase.issue}
              onChange={(e) => updateCaseField("issue", e.target.value)}
              error={caseErrors.issue}
              required
              disabled={caseStatus === "loading" || caseStatus === "success"}
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Soyez precis pour faciliter le diagnostic et le suivi.
            </p>

            <FormSelect
              label="Priorite"
              name="priority"
              options={priorityOptions}
              value={newCase.priority}
              onChange={(v) => updateCaseField("priority", v)}
              error={caseErrors.priority}
              required
              disabled={caseStatus === "loading" || caseStatus === "success"}
            />

            <FormInput
              label="Traitement initial (optionnel)"
              name="treatment"
              placeholder="Ex: Antibiotiques administres"
              value={newCase.treatment}
              onChange={(e) => updateCaseField("treatment", e.target.value)}
              error={caseErrors.treatment}
              disabled={caseStatus === "loading" || caseStatus === "success"}
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
                  disabled={caseStatus === "loading" || caseStatus === "success"}
                >
                  <Camera className="h-4 w-4" />
                  {newCase.photo ? "Changer la photo" : "Prendre une photo"}
                </Button>
                {newCase.photo && (
                  <div className="relative h-16 w-16">
                    <img
                      src={newCase.photo || "/placeholder.svg"}
                      alt="Apercu"
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
              {caseErrors.photo && <p className="text-xs text-destructive">{caseErrors.photo}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCaseDialogOpen(false)} disabled={caseStatus === "loading"}>
              Annuler
            </Button>
            <Button onClick={handleAddCase} disabled={caseStatus === "loading" || caseStatus === "success"}>
              {caseStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement en cours...
                </>
              ) : caseStatus === "success" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Enregistre
                </>
              ) : (
                <>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Enregistrer le probleme
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
