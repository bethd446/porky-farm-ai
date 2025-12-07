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
import { Baby, Calendar, Eye, Plus, Edit, Trash2 } from "lucide-react"

const initialGestations = [
  {
    id: 1,
    sow: "Truie #32",
    boar: "Verrat #8",
    breedingDate: "25 Août 2025",
    dueDate: "18 Déc 2025",
    day: 104,
    totalDays: 114,
    status: "Proche terme",
    statusColor: "bg-red-500",
    image: "/pregnant-sow.jpg",
    notes: "Échographie OK - 12 fœtus détectés",
  },
  {
    id: 2,
    sow: "Truie #18",
    boar: "Verrat #5",
    breedingDate: "15 Sept 2025",
    dueDate: "7 Jan 2026",
    day: 82,
    totalDays: 114,
    status: "En cours",
    statusColor: "bg-green-500",
    image: "/sow-pig.jpg",
    notes: "Gestation confirmée",
  },
  {
    id: 3,
    sow: "Truie #51",
    boar: "Verrat #8",
    breedingDate: "1 Oct 2025",
    dueDate: "23 Jan 2026",
    day: 66,
    totalDays: 114,
    status: "En cours",
    statusColor: "bg-green-500",
    image: "/healthy-sow.jpg",
    notes: "RAS - Appétit normal",
  },
  {
    id: 4,
    sow: "Truie #27",
    boar: "Verrat #3",
    breedingDate: "20 Oct 2025",
    dueDate: "11 Fév 2026",
    day: 47,
    totalDays: 114,
    status: "Début gestation",
    statusColor: "bg-blue-500",
    image: "/young-sow.jpg",
    notes: "Échographie prévue J+28",
  },
]

export function GestationTracker() {
  const router = useRouter()
  const [gestations, setGestations] = useState(initialGestations)
  const [selectedGestation, setSelectedGestation] = useState<(typeof initialGestations)[0] | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newGestation, setNewGestation] = useState({
    sow: "",
    boar: "",
    breedingDate: "",
    notes: "",
  })

  const handleView = (gest: (typeof initialGestations)[0]) => {
    setSelectedGestation(gest)
    setIsViewOpen(true)
  }

  const handleDelete = (id: number) => {
    setGestations(gestations.filter((g) => g.id !== id))
    setIsViewOpen(false)
  }

  const handleAddGestation = () => {
    if (!newGestation.sow || !newGestation.boar || !newGestation.breedingDate) return

    const breedingDate = new Date(newGestation.breedingDate)
    const dueDate = new Date(breedingDate)
    dueDate.setDate(dueDate.getDate() + 114)

    const today = new Date()
    const daysPassed = Math.floor((today.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24))

    const newGest = {
      id: Date.now(),
      sow: newGestation.sow,
      boar: newGestation.boar,
      breedingDate: breedingDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      dueDate: dueDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      day: Math.max(0, daysPassed),
      totalDays: 114,
      status: daysPassed < 30 ? "Début gestation" : daysPassed < 100 ? "En cours" : "Proche terme",
      statusColor: daysPassed < 30 ? "bg-blue-500" : daysPassed < 100 ? "bg-green-500" : "bg-red-500",
      image: "/sow-pig.jpg",
      notes: newGestation.notes || "Nouvelle gestation enregistrée",
    }

    setGestations([newGest, ...gestations])
    setIsAddOpen(false)
    setNewGestation({ sow: "", boar: "", breedingDate: "", notes: "" })
  }

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-pink-500" />
            Suivi des gestations
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
          {gestations.map((gest) => (
            <div key={gest.id} className="rounded-xl border border-border p-4 transition hover:bg-muted/50">
              <div className="flex items-start gap-4">
                <img
                  src={gest.image || "/placeholder.svg"}
                  alt={gest.sow}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{gest.sow}</h4>
                      <p className="text-sm text-muted-foreground">Père: {gest.boar}</p>
                    </div>
                    <Badge className={`${gest.statusColor} text-white`}>{gest.status}</Badge>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Jour {gest.day} / {gest.totalDays}
                      </span>
                      <span className="font-medium text-foreground">
                        {Math.round((gest.day / gest.totalDays) * 100)}%
                      </span>
                    </div>
                    <Progress value={(gest.day / gest.totalDays) * 100} className="h-2" />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Saillie: {gest.breedingDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Baby className="h-3 w-3" />
                      Terme prévu: {gest.dueDate}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">{gest.notes}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleView(gest)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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
                <img
                  src={selectedGestation.image || "/placeholder.svg"}
                  alt={selectedGestation.sow}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedGestation.sow}</h3>
                  <p className="text-muted-foreground">Père: {selectedGestation.boar}</p>
                  <Badge className={`${selectedGestation.statusColor} text-white mt-2`}>
                    {selectedGestation.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">
                    Jour {selectedGestation.day} / {selectedGestation.totalDays}
                  </span>
                </div>
                <Progress value={(selectedGestation.day / selectedGestation.totalDays) * 100} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date de saillie</span>
                  <p className="font-medium">{selectedGestation.breedingDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Terme prévu</span>
                  <p className="font-medium">{selectedGestation.dueDate}</p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Notes</span>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedGestation.notes}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Edit className="h-4 w-4" />
              Modifier
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

      {/* Add Gestation Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle gestation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sow">Truie</Label>
              <Input
                id="sow"
                value={newGestation.sow}
                onChange={(e) => setNewGestation({ ...newGestation, sow: e.target.value })}
                placeholder="Ex: Truie #45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boar">Verrat</Label>
              <Input
                id="boar"
                value={newGestation.boar}
                onChange={(e) => setNewGestation({ ...newGestation, boar: e.target.value })}
                placeholder="Ex: Verrat #12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breedingDate">Date de saillie</Label>
              <Input
                id="breedingDate"
                type="date"
                value={newGestation.breedingDate}
                onChange={(e) => setNewGestation({ ...newGestation, breedingDate: e.target.value })}
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
            <Button onClick={handleAddGestation}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
