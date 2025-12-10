"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react"
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

interface ScheduleItem {
  id: string
  time: string
  task: string
  location: string
  quantity: string
  status: "done" | "pending"
}

const defaultSchedule: ScheduleItem[] = [
  {
    id: "1",
    time: "06:00",
    task: "Distribution truies gestantes",
    location: "Batiment A",
    quantity: "45 kg",
    status: "pending",
  },
  {
    id: "2",
    time: "07:00",
    task: "Alimentation porcelets",
    location: "Maternite",
    quantity: "8 kg",
    status: "pending",
  },
  { id: "3", time: "12:00", task: "Ration verrats", location: "Batiment B", quantity: "16 kg", status: "pending" },
  {
    id: "4",
    time: "17:00",
    task: "Distribution truies allaitantes",
    location: "Maternite",
    quantity: "60 kg",
    status: "pending",
  },
  {
    id: "5",
    time: "18:00",
    task: "Ration engraissement",
    location: "Batiment C",
    quantity: "175 kg",
    status: "pending",
  },
]

export function FeedingSchedule() {
  const { stats } = useApp()
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({
    time: "",
    task: "",
    location: "",
    quantity: "",
  })

  useEffect(() => {
    const saved = localStorage.getItem("porkyfarm_feedschedule")
    const savedDate = localStorage.getItem("porkyfarm_feedschedule_date")
    const today = new Date().toDateString()

    if (saved && savedDate === today) {
      setSchedule(JSON.parse(saved))
    } else {
      // Reset schedule for new day
      const resetSchedule = defaultSchedule.map((s) => ({ ...s, status: "pending" as const }))
      setSchedule(resetSchedule)
      localStorage.setItem("porkyfarm_feedschedule", JSON.stringify(resetSchedule))
      localStorage.setItem("porkyfarm_feedschedule_date", today)
    }
  }, [])

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

  const completedCount = schedule.filter((s) => s.status === "done").length
  const progress = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Clock className="h-5 w-5 text-primary" />
              Planning du jour
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount}/{schedule.length} taches completees ({progress}%)
            </p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une tache</DialogTitle>
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
                  <Label>Tache</Label>
                  <Select value={newTask.task} onValueChange={(v) => setNewTask((t) => ({ ...t, task: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de distribution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Distribution truies gestantes">Distribution truies gestantes</SelectItem>
                      <SelectItem value="Distribution truies allaitantes">Distribution truies allaitantes</SelectItem>
                      <SelectItem value="Alimentation porcelets">Alimentation porcelets</SelectItem>
                      <SelectItem value="Ration verrats">Ration verrats</SelectItem>
                      <SelectItem value="Ration engraissement">Ration engraissement</SelectItem>
                      <SelectItem value="Distribution generale">Distribution generale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lieu</Label>
                  <Input
                    value={newTask.location}
                    onChange={(e) => setNewTask((t) => ({ ...t, location: e.target.value }))}
                    placeholder="Ex: Batiment A"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantite (kg)</Label>
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
                <Button onClick={addTask}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

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
              <p>Aucune tache planifiee</p>
              <Button variant="link" onClick={() => setShowAdd(true)}>
                Ajouter une tache
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
