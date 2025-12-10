"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Clock, AlertCircle, Plus, Syringe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { FormInput, FormSelect, FormTextarea } from "@/components/common/form-field"

export function HealthVaccinations() {
  const router = useRouter()
  const { vaccinations, addVaccination, animals } = useApp()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newVaccination, setNewVaccination] = useState({
    name: "",
    targetAnimals: "",
    scheduledDate: "",
    notes: "",
  })

  const getVaccinationStatus = (vax: (typeof vaccinations)[0]) => {
    if (vax.status === "completed") {
      return {
        status: "Complete",
        statusIcon: CheckCircle2,
        statusColor: "text-green-500",
      }
    }

    const today = new Date()
    const scheduledDate = new Date(vax.scheduledDate)
    const daysUntil = Math.floor((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      return {
        status: "En retard",
        statusIcon: AlertCircle,
        statusColor: "text-red-500",
      }
    } else if (daysUntil <= 3) {
      return {
        status: "Urgent",
        statusIcon: AlertCircle,
        statusColor: "text-amber-500",
      }
    } else {
      return {
        status: "Planifie",
        statusIcon: Calendar,
        statusColor: "text-blue-500",
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const daysUntil = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      return `Il y a ${Math.abs(daysUntil)} jours`
    } else if (daysUntil === 0) {
      return "Aujourd'hui"
    } else if (daysUntil === 1) {
      return "Demain"
    } else if (daysUntil <= 7) {
      return `Dans ${daysUntil} jours`
    } else {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    }
  }

  const handleAddVaccination = () => {
    if (!newVaccination.name || !newVaccination.scheduledDate) return

    addVaccination({
      name: newVaccination.name,
      targetAnimals: newVaccination.targetAnimals || "Tout le cheptel",
      scheduledDate: newVaccination.scheduledDate,
      notes: newVaccination.notes,
    })

    setNewVaccination({ name: "", targetAnimals: "", scheduledDate: "", notes: "" })
    setIsAddOpen(false)
  }

  const pendingVaccinations = vaccinations.filter((v) => v.status !== "completed")
  const completedVaccinations = vaccinations.filter((v) => v.status === "completed")

  const vaccineOptions = [
    { value: "Peste Porcine Africaine", label: "Peste Porcine Africaine (PPA)" },
    { value: "Parvovirose", label: "Parvovirose" },
    { value: "Rouget", label: "Rouget" },
    { value: "Mycoplasme", label: "Mycoplasme" },
    { value: "E. Coli", label: "E. Coli (porcelets)" },
    { value: "Autre", label: "Autre vaccin" },
  ]

  const targetOptions = [
    { value: "Tout le cheptel", label: "Tout le cheptel" },
    { value: "Truies reproductrices", label: "Truies reproductrices" },
    { value: "Verrats", label: "Verrats" },
    { value: "Porcelets", label: "Porcelets" },
    { value: "Porcs engraissement", label: "Porcs d'engraissement" },
  ]

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Syringe className="h-5 w-5 text-blue-500" />
            Calendrier vaccinal
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Planifier
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/health?tab=vaccinations")}>
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {vaccinations.length === 0 ? (
            <div className="text-center py-8">
              <Syringe className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">Aucune vaccination planifiee.</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Planifier une vaccination
              </Button>
            </div>
          ) : (
            <>
              {/* Pending vaccinations */}
              {pendingVaccinations.slice(0, 4).map((vax) => {
                const statusInfo = getVaccinationStatus(vax)
                return (
                  <div
                    key={vax.id}
                    className="flex items-center gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50"
                  >
                    <div className={`rounded-xl p-3 ${statusInfo.statusColor} bg-current/10`}>
                      <statusInfo.statusIcon className={`h-5 w-5 ${statusInfo.statusColor}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{vax.name}</h4>
                      <p className="text-sm text-muted-foreground">{vax.targetAnimals}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(vax.scheduledDate)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {vax.completedCount || 0}/{animals.length}
                      </Badge>
                      <p className={`mt-1 text-xs font-medium ${statusInfo.statusColor}`}>{statusInfo.status}</p>
                    </div>
                  </div>
                )
              })}

              {/* Show completed count */}
              {completedVaccinations.length > 0 && (
                <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                  {completedVaccinations.length} vaccination(s) terminee(s) ce mois
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Vaccination Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Planifier une vaccination</DialogTitle>
            <DialogDescription>Ajoutez une nouvelle vaccination au calendrier de votre elevage.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormSelect
              label="Type de vaccin"
              name="name"
              options={vaccineOptions}
              value={newVaccination.name}
              onChange={(v) => setNewVaccination({ ...newVaccination, name: v })}
              required
              placeholder="Selectionnez un vaccin"
            />
            <FormSelect
              label="Animaux cibles"
              name="targetAnimals"
              options={targetOptions}
              value={newVaccination.targetAnimals}
              onChange={(v) => setNewVaccination({ ...newVaccination, targetAnimals: v })}
              placeholder="Tout le cheptel"
            />
            <FormInput
              label="Date prevue"
              name="scheduledDate"
              type="date"
              value={newVaccination.scheduledDate}
              onChange={(e) => setNewVaccination({ ...newVaccination, scheduledDate: e.target.value })}
              required
            />
            <FormTextarea
              label="Notes (optionnel)"
              name="notes"
              value={newVaccination.notes}
              onChange={(e) => setNewVaccination({ ...newVaccination, notes: e.target.value })}
              placeholder="Informations supplementaires..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddVaccination} disabled={!newVaccination.name || !newVaccination.scheduledDate}>
              <Plus className="h-4 w-4 mr-2" />
              Planifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
