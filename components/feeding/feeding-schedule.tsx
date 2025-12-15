"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, AlertCircle, Plus, PiggyBank } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/contexts/app-context"
import Link from "next/link"

interface ScheduleItem {
  id: string
  time: string
  task: string
  location: string
  quantity: string
  status: "done" | "pending"
}

export function FeedingSchedule() {
  const { animals, stats } = useApp()
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({
    time: "",
    task: "",
    location: "",
    quantity: "",
  })

  useEffect(() => {
    if (animals.length === 0) {
      // Si pas d'animaux, pas de planning
      setSchedule([])
      return
    }

    const saved = localStorage.getItem("porkyfarm_feedschedule")
    const savedDate = localStorage.getItem("porkyfarm_feedschedule_date")
    const today = new Date().toDateString()

    if (saved && savedDate === today) {
      setSchedule(JSON.parse(saved))
    } else if (saved) {
      // Reset status pour nouveau jour mais garde les taches de l'utilisateur
      const parsed = JSON.parse(saved) as ScheduleItem[]
      const resetSchedule = parsed.map((s) => ({ ...s, status: "pending" as const }))
      setSchedule(resetSchedule)
      localStorage.setItem("porkyfarm_feedschedule", JSON.stringify(resetSchedule))
      localStorage.setItem("porkyfarm_feedschedule_date", today)
    } else {
      // Premiere utilisation: vide
      setSchedule([])
    }
  }, [animals.length])

  const saveSchedule = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule)
    localStorage.setItem("porkyfarm_feedschedule", JSON.stringify(newSchedule))
    localStorage.setItem("porkyfarm_feedschedule_date", new Date().toDateString())
  }

  const toggleStatus = (id: string) => {
    const updated = schedule.map((s) =>
      s.id === id ? { ...s, status: s.status === "done" ? ("pending" as const) : ("done" as const) } : s,
    )
    saveSchedule(updated)
  }

  const addTask = () => {
    if (!newTask.time || !newTask.task) return

    const task: ScheduleItem = {
      id: Date.now().toString(),
      time: newTask.time,
      task: newTask.task,
      location: newTask.location || "Non specifie",
      quantity: newTask.quantity ? `${newTask.quantity} kg` : "Variable",
      status: "pending",
    }

    const updated = [...schedule, task].sort((a, b) => a.time.localeCompare(b.time))
    saveSchedule(updated)
    setNewTask({ time: "", task: "", location: "", quantity: "" })
    setShowAdd(false)
  }

  const deleteTask = (id: string) => {
    const updated = schedule.filter((s) => s.id !== id)
    saveSchedule(updated)
  }

  const completedCount = schedule.filter((s) => s.status === "done").length
  const progress = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0

  if (animals.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-5 w-5 text-primary" />
            Planning quotidien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PiggyBank className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">Cheptel vide</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Enregistrez des animaux pour organiser vos taches d'alimentation
            </p>
            <Link href="/dashboard/livestock/add">
              <Button size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Enregistrer un animal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Clock className="h-5 w-5 text-primary" />
              Planning quotidien
            </CardTitle>
            {schedule.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount}/{schedule.length} taches ({progress}%)
              </p>
            )}
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                <Plus className="h-4 w-4" />
                Ajouter une tache
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle tache d'alimentation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Heure</Label>
                  <Input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask((t) => ({ ...t, time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de distribution</Label>
                  <Select value={newTask.task} onValueChange={(v) => setNewTask((t) => ({ ...t, task: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Distribution truies gestantes">Truies gestantes</SelectItem>
                      <SelectItem value="Distribution truies allaitantes">Truies allaitantes</SelectItem>
                      <SelectItem value="Alimentation porcelets">Porcelets</SelectItem>
                      <SelectItem value="Ration verrats">Verrats</SelectItem>
                      <SelectItem value="Ration engraissement">Porcs en engraissement</SelectItem>
                      <SelectItem value="Distribution generale">Distribution generale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lieu (optionnel)</Label>
                  <Input
                    value={newTask.location}
                    onChange={(e) => setNewTask((t) => ({ ...t, location: e.target.value }))}
                    placeholder="Ex: Batiment A, Parc 3..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantite en kg (optionnel)</Label>
                  <Input
                    type="number"
                    value={newTask.quantity}
                    onChange={(e) => setNewTask((t) => ({ ...t, quantity: e.target.value }))}
                    placeholder="Ex: 50"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button onClick={addTask}>Ajouter cette tache</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {schedule.length > 0 && (
          <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="space-y-3">
          {schedule.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleStatus(item.id)}
              className={`w-full flex items-center gap-4 rounded-xl border border-border p-4 text-left transition-all hover:shadow-md ${
                item.status === "done"
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200"
                  : "bg-background hover:bg-muted/50"
              }`}
            >
              <div className="text-center min-w-[50px]">
                <p className={`text-lg font-bold ${item.status === "done" ? "text-green-600" : "text-foreground"}`}>
                  {item.time}
                </p>
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${item.status === "done" ? "text-green-700 line-through" : "text-foreground"}`}
                >
                  {item.task}
                </p>
                <p className="text-sm text-muted-foreground">{item.location}</p>
              </div>
              <Badge variant="outline" className={item.status === "done" ? "border-green-300 text-green-600" : ""}>
                {item.quantity}
              </Badge>
              {item.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              )}
            </button>
          ))}

          {schedule.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Aucune tache prevue aujourd'hui</p>
              <p className="text-xs mt-1">Planifiez vos distributions d'alimentation quotidiennes</p>
              <Button variant="link" onClick={() => setShowAdd(true)} className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Planifier une distribution
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
