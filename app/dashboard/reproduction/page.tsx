"use client"

import { useState } from "react"
import { ReproductionStats } from "@/components/reproduction/reproduction-stats"
import { GestationTracker } from "@/components/reproduction/gestation-tracker"
import { BreedingCalendar } from "@/components/reproduction/breeding-calendar"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Baby, CheckCircle, Loader2, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useApp } from "@/contexts/app-context"
import { FormSelect, FormInput, FormTextarea } from "@/components/common/form-field"
import { gestationSchema } from "@/lib/validations/schemas"
import Link from "next/link"

export default function ReproductionPage() {
  const { animals, addGestation } = useApp()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState("")
  const [newGestation, setNewGestation] = useState({
    sow: "",
    boar: "",
    breedingDate: "",
    notes: "",
  })

  const sows = animals.filter((a) => a.category === "truie" && a.status === "actif")
  const boars = animals.filter((a) => a.category === "verrat" && a.status === "actif")

  const sowOptions = sows.map((s) => ({ value: s.id, label: s.name }))
  const boarOptions = [{ value: "unknown", label: "Inconnu" }, ...boars.map((b) => ({ value: b.id, label: b.name }))]

  const canAddGestation = sows.length > 0

  const updateField = (field: string, value: string) => {
    setNewGestation((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAddGestation = () => {
    setErrors({})
    setErrorMessage("")

    const dataToValidate = {
      sow: newGestation.sow,
      boar: newGestation.boar || "unknown",
      breedingDate: newGestation.breedingDate,
      notes: newGestation.notes,
    }

    const result = gestationSchema.safeParse(dataToValidate)
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
      const sow = animals.find((a) => a.id === newGestation.sow)
      const boar = animals.find((a) => a.id === newGestation.boar)

      if (!sow) {
        setErrors({ sow: "Truie non trouvee" })
        setStatus("error")
        return
      }

      addGestation({
        sowId: newGestation.sow,
        sowName: sow.name,
        boarId: newGestation.boar || undefined,
        boarName: boar?.name,
        breedingDate: newGestation.breedingDate,
        status: "active",
        notes: newGestation.notes || undefined,
      })

      setStatus("success")

      setTimeout(() => {
        setNewGestation({ sow: "", boar: "", breedingDate: "", notes: "" })
        setIsAddOpen(false)
        setStatus("idle")
      }, 1500)
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reproduction</h1>
          <p className="text-muted-foreground">Suivez les saillies et gestations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => {
              setShowCalendar(true)
              document.getElementById("breeding-calendar")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            <Calendar className="h-4 w-4" />
            Voir le calendrier
          </Button>
          <Button
            className="gap-2 bg-primary text-white hover:bg-primary-dark"
            onClick={() => {
              if (canAddGestation) {
                setIsAddOpen(true)
                setErrors({})
                setStatus("idle")
              }
            }}
            disabled={!canAddGestation}
            title={!canAddGestation ? "Ajoutez d'abord une truie" : "Enregistrer une saillie"}
          >
            <Plus className="h-4 w-4" />
            Enregistrer une saillie
          </Button>
        </div>
      </div>

      {!canAddGestation && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Aucune truie disponible</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Enregistrez au moins une truie pour commencer a suivre les gestations.
            </p>
            <Link href="/dashboard/livestock/add">
              <Button variant="outline" size="sm" className="mt-2 bg-transparent border-amber-300">
                <Plus className="h-4 w-4 mr-1" />
                Enregistrer une truie
              </Button>
            </Link>
          </div>
        </div>
      )}

      <ReproductionStats />
      <GestationTracker />
      <div id="breeding-calendar">
        <BreedingCalendar />
      </div>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) {
            setErrors({})
            setStatus("idle")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-pink-500" />
              Nouvelle saillie
            </DialogTitle>
            <DialogDescription>
              Enregistrez une saillie pour suivre la gestation (duree moyenne: 114 jours).
            </DialogDescription>
          </DialogHeader>

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
              <CheckCircle className="h-4 w-4" />
              Saillie enregistree. Mise-bas prevue dans 114 jours.
            </div>
          )}

          <div className="space-y-4 py-4">
            <FormSelect
              label="Truie"
              name="sow"
              options={sowOptions}
              value={newGestation.sow}
              onChange={(v) => updateField("sow", v)}
              required
              placeholder="Selectionner une truie"
              error={errors.sow}
              disabled={status === "loading" || status === "success"}
            />
            <FormSelect
              label="Verrat (optionnel)"
              name="boar"
              options={boarOptions}
              value={newGestation.boar}
              onChange={(v) => updateField("boar", v)}
              placeholder="Selectionner un verrat"
              error={errors.boar}
              disabled={status === "loading" || status === "success"}
            />
            <FormInput
              label="Date de la saillie"
              name="breedingDate"
              type="date"
              value={newGestation.breedingDate}
              onChange={(e) => updateField("breedingDate", e.target.value)}
              required
              error={errors.breedingDate}
              disabled={status === "loading" || status === "success"}
            />
            <FormTextarea
              label="Remarques (optionnel)"
              name="notes"
              value={newGestation.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Ex: Premiere saillie, comportement observe..."
              error={errors.notes}
              disabled={status === "loading" || status === "success"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={status === "loading"}>
              Annuler
            </Button>
            <Button onClick={handleAddGestation} disabled={status === "loading" || status === "success"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement en cours...
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Enregistree
                </>
              ) : (
                "Enregistrer cette saillie"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
