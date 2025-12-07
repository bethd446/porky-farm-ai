"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Baby, Calendar, Eye, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { FormSelect } from "@/components/common/form-field"

export function GestationTracker() {
  const router = useRouter()
  const { gestations, addGestation, deleteGestation, completeGestation, animals } = useApp()
  const [selectedGestation, setSelectedGestation] = useState<(typeof gestations)[0] | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completeData, setCompleteData] = useState({ pigletCount: "", pigletsSurvived: "" })
  const [newGestation, setNewGestation] = useState({
    sowId: "",
    boarId: "",
    breedingDate: "",
    notes: "",
  })

  const sows = animals.filter((a) => a.category === "truie" && a.status === "actif")
  const boars = animals.filter((a) => a.category === "verrat" && a.status === "actif")

  const sowOptions = sows.map((s) => ({ value: s.id, label: s.name }))
  const boarOptions = [{ value: "", label: "Inconnu" }, ...boars.map((b) => ({ value: b.id, label: b.name }))]

  const handleView = (gest: (typeof gestations)[0]) => {
    setSelectedGestation(gest)
    setIsViewOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteGestation(id)
    setIsViewOpen(false)
  }

  const handleAddGestation = () => {
    if (!newGestation.sowId || !newGestation.breedingDate) return

    setIsLoading(true)

    const sow = animals.find((a) => a.id === newGestation.sowId)
    const boar = animals.find((a) => a.id === newGestation.boarId)

    addGestation({
      sowId: newGestation.sowId,
      sowName: sow?.name || "Truie inconnue",
      boarId: newGestation.boarId || undefined,
      boarName: boar?.name,
      breedingDate: newGestation.breedingDate,
      status: "active",
      notes: newGestation.notes || undefined,
    })

    setIsLoading(false)
    setIsAddOpen(false)
    setNewGestation({ sowId: "", boarId: "", breedingDate: "", notes: "" })
  }

  const handleComplete = () => {
    if (!selectedGestation) return

    const pigletCount = Number.parseInt(completeData.pigletCount) || 0
    const pigletsSurvived = Number.parseInt(completeData.pigletsSurvived) || pigletCount

    completeGestation(selectedGestation.id, pigletCount, pigletsSurvived)
    setIsCompleteOpen(false)
    setIsViewOpen(false)
    setCompleteData({ pigletCount: "", pigletsSurvived: "" })
  }

  const getGestationProgress = (gest: (typeof gestations)[0]) => {
    const breedingDate = new Date(gest.breedingDate)
    const today = new Date()
    const daysPassed = Math.floor((today.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24))
    return {
      day: Math.max(0, Math.min(114, daysPassed)),
      totalDays: 114,
      percent: Math.round((Math.min(114, daysPassed) / 114) * 100),
    }
  }

  const getStatusStyle = (gest: (typeof gestations)[0]) => {
    const { day } = getGestationProgress(gest)
    if (day >= 107) return { status: "Proche terme", color: "bg-red-500" }
    if (day >= 84) return { status: "3ème tiers", color: "bg-amber-500" }
    if (day >= 28) return { status: "En cours", color: "bg-green-500" }
    return { status: "Début gestation", color: "bg-blue-500" }
  }

  const activeGestations = gestations.filter((g) => g.status === "active")

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-pink-500" />
            Suivi des gestations ({activeGestations.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/reproduction")}>
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGestations.length === 0 ? (
            <div className="text-center py-8">
              <Baby className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">Aucune gestation en cours.</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Enregistrer une saillie
              </Button>
            </div>
          ) : (
            activeGestations.map((gest) => {
              const progress = getGestationProgress(gest)
              const statusStyle = getStatusStyle(gest)

              return (
                <div key={gest.id} className="rounded-xl border border-border p-4 transition hover:bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-pink-100 flex items-center justify-center">
                      <Baby className="h-7 w-7 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{gest.sowName}</h4>
                          <p className="text-sm text-muted-foreground">Père: {gest.boarName || "Inconnu"}</p>
                        </div>
                        <Badge className={`${statusStyle.color} text-white`}>{statusStyle.status}</Badge>
                      </div>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Jour {progress.day} / {progress.totalDays}
                          </span>
                          <span className="font-medium text-foreground">{progress.percent}%</span>
                        </div>
                        <Progress value={progress.percent} className="h-2" />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Saillie: {new Date(gest.breedingDate).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Baby className="h-3 w-3" />
                          Terme: {new Date(gest.expectedDueDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {gest.notes && <p className="mt-2 text-xs text-muted-foreground">{gest.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleView(gest)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* View Gestation Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de la gestation</DialogTitle>
          </DialogHeader>
          {selectedGestation && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Baby className="h-8 w-8 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedGestation.sowName}</h3>
                  <p className="text-muted-foreground">Père: {selectedGestation.boarName || "Inconnu"}</p>
                </div>
              </div>

              {(() => {
                const progress = getGestationProgress(selectedGestation)
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">
                        Jour {progress.day} / {progress.totalDays}
                      </span>
                    </div>
                    <Progress value={progress.percent} className="h-3" />
                  </div>
                )
              })()}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date de saillie</span>
                  <p className="font-medium">{new Date(selectedGestation.breedingDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Terme prévu</span>
                  <p className="font-medium">
                    {new Date(selectedGestation.expectedDueDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              {selectedGestation.notes && (
                <div>
                  <span className="text-muted-foreground text-sm">Notes</span>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedGestation.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                setIsCompleteOpen(true)
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Mise-bas effectuée
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => selectedGestation && handleDelete(selectedGestation.id)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Gestation Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer la mise-bas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pigletCount">Nombre de porcelets nés</Label>
              <Input
                id="pigletCount"
                type="number"
                value={completeData.pigletCount}
                onChange={(e) => setCompleteData({ ...completeData, pigletCount: e.target.value })}
                placeholder="Ex: 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pigletsSurvived">Nombre de porcelets vivants</Label>
              <Input
                id="pigletsSurvived"
                type="number"
                value={completeData.pigletsSurvived}
                onChange={(e) => setCompleteData({ ...completeData, pigletsSurvived: e.target.value })}
                placeholder="Ex: 11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleComplete}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Gestation Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle gestation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormSelect
              label="Truie"
              name="sowId"
              options={sowOptions}
              value={newGestation.sowId}
              onChange={(v) => setNewGestation({ ...newGestation, sowId: v })}
              required
              placeholder="Sélectionner une truie"
            />
            <FormSelect
              label="Verrat"
              name="boarId"
              options={boarOptions}
              value={newGestation.boarId}
              onChange={(v) => setNewGestation({ ...newGestation, boarId: v })}
              placeholder="Sélectionner un verrat"
            />
            <div className="space-y-2">
              <Label htmlFor="breedingDate">Date de saillie</Label>
              <Input
                id="breedingDate"
                type="date"
                value={newGestation.breedingDate}
                onChange={(e) => setNewGestation({ ...newGestation, breedingDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newGestation.notes}
                onChange={(e) => setNewGestation({ ...newGestation, notes: e.target.value })}
                placeholder="Observations, remarques..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddGestation} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
