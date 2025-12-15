"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { Calendar, Baby, Stethoscope, Syringe, Package, Plus, CheckCircle2, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

interface SmartTask {
  id: string
  type: "gestation" | "health" | "vaccination" | "stock" | "general"
  title: string
  description: string
  dueDate?: string
  daysUntil?: number
  priority: "critical" | "high" | "medium" | "low"
  link: string
  actionLabel: string
}

export function DashboardPlanning() {
  const router = useRouter()
  const { animals, gestations, healthCases, stats } = useApp()

  const smartTasks = useMemo(() => {
    const tasks: SmartTask[] = []
    const today = new Date()

    // 1. Taches liees aux gestations proches
    const activeGestations = gestations.filter((g) => g.status === "active")
    activeGestations.forEach((g) => {
      const dueDate = new Date(g.expectedDueDate)
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil <= 14 && daysUntil > 0) {
        tasks.push({
          id: `gest-${g.id}`,
          type: "gestation",
          title: "Preparer la mise-bas",
          description: `${g.sowName} - dans ${daysUntil} jour(s)`,
          dueDate: g.expectedDueDate,
          daysUntil,
          priority: daysUntil <= 3 ? "critical" : daysUntil <= 7 ? "high" : "medium",
          link: "/dashboard/reproduction",
          actionLabel: "Voir details",
        })
      } else if (daysUntil <= 0) {
        tasks.push({
          id: `gest-overdue-${g.id}`,
          type: "gestation",
          title: "Mise-bas attendue",
          description: `${g.sowName} - date depassee de ${Math.abs(daysUntil)} jour(s)`,
          dueDate: g.expectedDueDate,
          daysUntil,
          priority: "critical",
          link: "/dashboard/reproduction",
          actionLabel: "Enregistrer la naissance",
        })
      }
    })

    // 2. Taches liees aux cas sante non resolus
    const activeCases = healthCases.filter((c) => c.status !== "resolved")
    activeCases.forEach((c) => {
      if (c.priority === "critical" || c.priority === "high") {
        tasks.push({
          id: `health-${c.id}`,
          type: "health",
          title: "Suivi cas sanitaire urgent",
          description: `${c.animalName}: ${c.issue}`,
          priority: c.priority as "critical" | "high",
          link: "/dashboard/health",
          actionLabel: "Traiter le cas",
        })
      }
    })

    // 3. Taches pour truies sans reproduction recente (si on a des truies)
    const truies = animals.filter((a) => a.category === "truie" && a.status === "actif")
    const truiesWithActiveGestation = new Set(activeGestations.map((g) => g.sowId))
    const truiesWithoutGestation = truies.filter((t) => !truiesWithActiveGestation.has(t.id))

    if (truiesWithoutGestation.length > 0 && truies.length > 0) {
      tasks.push({
        id: "breeding-suggestion",
        type: "general",
        title: "Planifier une saillie",
        description: `${truiesWithoutGestation.length} truie(s) disponible(s) pour reproduction`,
        priority: "low",
        link: "/dashboard/reproduction",
        actionLabel: "Enregistrer saillie",
      })
    }

    // Trier par priorite puis par date
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      if (a.daysUntil !== undefined && b.daysUntil !== undefined) {
        return a.daysUntil - b.daysUntil
      }
      return 0
    })
  }, [animals, gestations, healthCases])

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "gestation":
        return Baby
      case "health":
        return Stethoscope
      case "vaccination":
        return Syringe
      case "stock":
        return Package
      default:
        return Calendar
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "critical":
        return { badge: "bg-red-100 text-red-700 border-red-200", icon: "text-red-500" }
      case "high":
        return { badge: "bg-amber-100 text-amber-700 border-amber-200", icon: "text-amber-500" }
      case "medium":
        return { badge: "bg-blue-100 text-blue-700 border-blue-200", icon: "text-blue-500" }
      default:
        return { badge: "bg-green-100 text-green-700 border-green-200", icon: "text-green-500" }
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical":
        return "Urgent"
      case "high":
        return "Important"
      case "medium":
        return "Normal"
      default:
        return "Optionnel"
    }
  }

  // Empty state quand aucune donnee
  if (animals.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Calendar className="h-5 w-5 text-primary" />
            Vos taches a venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">Aucune tache planifiee</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Ajoutez vos premiers animaux pour que PorkyFarm genere automatiquement vos taches quotidiennes
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Link href="/dashboard/livestock/add">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Ajouter mon premier animal
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state quand il y a des animaux mais pas de taches
  if (smartTasks.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base font-medium">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Vos taches a venir
            </span>
            {smartTasks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {smartTasks.length} tache(s)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-sm font-medium text-foreground">Felicitations !</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Aucune tache urgente. Votre elevage est bien gere. Vous pouvez planifier de nouvelles actions.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Link href="/dashboard/reproduction">
                <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                  <Baby className="h-4 w-4" />
                  Enregistrer une saillie
                </Button>
              </Link>
              <Link href="/dashboard/health">
                <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                  <Stethoscope className="h-4 w-4" />
                  Faire un check-up
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base font-medium">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Vos taches a venir
          </span>
          {smartTasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {smartTasks.length} tache(s)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {smartTasks.slice(0, 5).map((task) => {
          const Icon = getTaskIcon(task.type)
          const style = getPriorityStyle(task.priority)

          return (
            <button
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3 hover-highlight focus-ring w-full text-left tap-target"
              onClick={() => router.push(task.link)}
              aria-label={`${task.title}: ${task.description}`}
            >
              <div className={`rounded-lg bg-muted p-2 ${style.icon} shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <Badge variant="outline" className={`text-xs shrink-0 ${style.badge}`}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{task.description}</p>
                {task.daysUntil !== undefined && task.daysUntil > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Dans {task.daysUntil} jour(s)
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </button>
          )
        })}

        {smartTasks.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">+ {smartTasks.length - 5} autre(s) tache(s)</p>
        )}
      </CardContent>
    </Card>
  )
}
