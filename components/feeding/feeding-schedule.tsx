"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, AlertCircle, Plus, PiggyBank, Loader2, Trash2 } from "lucide-react"
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
import { useAuthContext } from "@/contexts/auth-context"
import { db, isSupabaseConfigured } from "@/lib/supabase/client"
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
  const { user } = useAuthContext()
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTask, setNewTask] = useState({
    time: "",
    task: "",
    location: "",
    quantity: "",
  })

  const loadData = useCallback(async () => {
    if (!user?.id || animals.length === 0) {
      setSchedule([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      if (isSupabaseConfigured()) {
        const today = new Date().toISOString().split("T")[0]
        const { data, error } = await db.getFeedingSchedule(user.id, today)
        if (error) throw error

        const mappedSchedule: ScheduleItem[] = (data || []).map((item: any) => ({
          id: item.id,
          time: item.time,
          task: item.task,
          location: item.location || "Non specifie",
          quantity: item.quantity || "Variable",
          status: item.status as "done" | "pending",
        }))
        setSchedule(mappedSchedule)
      }
    } catch (err) {
      console.error("[FeedingSchedule] loadData error:", err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, animals.length])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleStatus = async (id: string) => {
    const item = schedule.find((s) => s.id === id)
    if (!item) return

    const newStatus = item.status === "done" ? "pending" : "done"

    // Update local state immediately for responsiveness
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)))

    try {
      await db.updateFeedingScheduleItem(id, { status: newStatus })
    } catch (err) {
      console.error("[FeedingSchedule] toggleStatus error:", err)
      // Revert on error
      setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, status: item.status } : s)))
    }
  }

  const addTask = async () => {
    if (!newTask.time || !newTask.task || !user?.id) return

    setSaving(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const { error } = await db.addFeedingScheduleItem({
        user_id: user.id,
        time: newTask.time,
        task: newTask.task,
        location: newTask.location || "Non specifie",
        quantity: newTask.quantity ? `${newTask.quantity} kg` : "Variable",
        status: "pending",
        schedule_date: today,
      })

      if (error) throw error

      await loadData()
      setNewTask({ time: "", task: "", location: "", quantity: "" })
      setShowAdd(false)
    } catch (err) {
      console.error("[FeedingSchedule] addTask error:", err)
    } finally {
      setSaving(false)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await db.deleteFeedingScheduleItem(id)
      setSchedule((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error("[FeedingSchedule] deleteTask error:", err)
    }
  }

  const completedCount = schedule.filter((s) => s.status === "done").length
  const progress = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

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
                <Button onClick={addTask} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Ajouter cette tache
                </Button>
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
            <div
              key={item.id}
              className={`w-full flex items-center gap-4 rounded-xl border border-border p-4 text-left transition-all hover:shadow-md ${
                item.status === "done"
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200"
                  : "bg-background hover:bg-muted/50"
              }`}
            >
              <button onClick={() => toggleStatus(item.id)} className="flex-1 flex items-center gap-4 text-left">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0"
                onClick={() => deleteTask(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
