"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Baby, Syringe, Heart, CalendarIcon } from "lucide-react"
import { useApp } from "@/contexts/app-context"

interface CalendarEvent {
  day: number
  type: "misesBas" | "vaccination" | "saillie"
  label: string
  color: string
  id: string
}

export function BreedingCalendar() {
  const { gestations, vaccinations } = useApp()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const generateEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Add gestation events (expected due dates and breeding dates)
    gestations.forEach((gest) => {
      // Breeding date event
      const breedingDate = new Date(gest.breedingDate)
      if (breedingDate.getFullYear() === year && breedingDate.getMonth() === month) {
        events.push({
          day: breedingDate.getDate(),
          type: "saillie",
          label: `Saillie: ${gest.sowName}`,
          color: "bg-purple-500",
          id: `breeding-${gest.id}`,
        })
      }

      // Expected due date event
      const dueDate = new Date(gest.expectedDueDate)
      if (dueDate.getFullYear() === year && dueDate.getMonth() === month && gest.status === "active") {
        events.push({
          day: dueDate.getDate(),
          type: "misesBas",
          label: `Mise-bas: ${gest.sowName}`,
          color: "bg-pink-500",
          id: `due-${gest.id}`,
        })
      }
    })

    // Add vaccination events
    vaccinations.forEach((vacc) => {
      const vaccDate = new Date(vacc.date)
      if (vaccDate.getFullYear() === year && vaccDate.getMonth() === month) {
        events.push({
          day: vaccDate.getDate(),
          type: "vaccination",
          label: `Vaccin: ${vacc.vaccineName}`,
          color: "bg-blue-500",
          id: `vacc-${vacc.id}`,
        })
      }

      // Next vaccination reminder
      if (vacc.nextDueDate) {
        const nextDate = new Date(vacc.nextDueDate)
        if (nextDate.getFullYear() === year && nextDate.getMonth() === month) {
          events.push({
            day: nextDate.getDate(),
            type: "vaccination",
            label: `Rappel: ${vacc.vaccineName}`,
            color: "bg-amber-500",
            id: `vacc-next-${vacc.id}`,
          })
        }
      }
    })

    return events
  }

  const events = generateEvents()

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i)

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const selectedDayEvents = selectedDay ? events.filter((e) => e.day === selectedDay) : []

  const getEventIcon = (type: string) => {
    switch (type) {
      case "misesBas":
        return <Baby className="h-3 w-3" />
      case "vaccination":
        return <Syringe className="h-3 w-3" />
      case "saillie":
        return <Heart className="h-3 w-3" />
      default:
        return <CalendarIcon className="h-3 w-3" />
    }
  }

  // Count events by type for legend
  const eventCounts = {
    misesBas: events.filter((e) => e.type === "misesBas").length,
    saillie: events.filter((e) => e.type === "saillie").length,
    vaccination: events.filter((e) => e.type === "vaccination").length,
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Calendrier reproductif</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs bg-transparent">
            Aujourd'hui
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((i) => (
            <div key={`blank-${i}`} className="h-12" />
          ))}
          {days.map((day) => {
            const dayEvents = events.filter((e) => e.day === day)
            const today = new Date()
            const isToday =
              day === today.getDate() &&
              currentMonth.getMonth() === today.getMonth() &&
              currentMonth.getFullYear() === today.getFullYear()
            const isSelected = selectedDay === day

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`relative flex h-12 flex-col items-center justify-center rounded-lg text-sm transition hover:bg-muted cursor-pointer ${
                  isToday ? "bg-primary text-primary-foreground font-bold" : ""
                } ${isSelected && !isToday ? "bg-muted ring-2 ring-primary" : ""}`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="absolute -bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.color}`} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selectedDay && selectedDayEvents.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-medium">
              Evenements du {selectedDay} {currentMonth.toLocaleDateString("fr-FR", { month: "long" })}
            </h4>
            {selectedDayEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-2 text-sm">
                <Badge className={`${event.color} text-white gap-1`}>
                  {getEventIcon(event.type)}
                  {event.type === "misesBas" ? "Mise-bas" : event.type === "saillie" ? "Saillie" : "Vaccin"}
                </Badge>
                <span>{event.label}</span>
              </div>
            ))}
          </div>
        )}

        {selectedDay && selectedDayEvents.length === 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
            Aucun evenement le {selectedDay} {currentMonth.toLocaleDateString("fr-FR", { month: "long" })}
          </div>
        )}

        {/* Legend with counts */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-pink-500" />
            <span className="text-muted-foreground">Mise-bas ({eventCounts.misesBas})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Saillie ({eventCounts.saillie})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Vaccination ({eventCounts.vaccination})</span>
          </div>
        </div>

        {events.length === 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Aucun evenement ce mois-ci. Enregistrez des saillies ou vaccinations pour les voir apparaitre.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
