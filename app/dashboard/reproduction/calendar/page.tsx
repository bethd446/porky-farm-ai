"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

const events = [
  { date: new Date(2025, 11, 8), type: "misesBas", label: "Mise-bas #32", color: "bg-pink-500" },
  { date: new Date(2025, 11, 12), type: "vaccination", label: "Vaccin Lot A12", color: "bg-blue-500" },
  { date: new Date(2025, 11, 15), type: "saillie", label: "Saillie prévue #44", color: "bg-purple-500" },
  { date: new Date(2025, 11, 18), type: "misesBas", label: "Mise-bas #18", color: "bg-pink-500" },
  { date: new Date(2025, 11, 22), type: "saillie", label: "Saillie prévue #52", color: "bg-purple-500" },
]

export default function ReproductionCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfMonth = monthStart.getDay()
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i)

  const getEventsForDay = (day: Date) => {
    return events.filter((e) => isSameDay(e.date, day))
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendrier reproductif</h1>
        <p className="text-muted-foreground">Vue d'ensemble des événements reproductifs</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Calendrier</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((i) => (
              <div key={`blank-${i}`} className="h-16" />
            ))}
            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toISOString()}
                  className={`relative flex h-16 flex-col items-center justify-center rounded-lg text-sm transition hover:bg-muted ${
                    isToday ? "bg-primary text-white" : ""
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dayEvents.map((e, i) => (
                        <div key={i} className={`h-1.5 w-1.5 rounded-full ${e.color}`} title={e.label} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-pink-500" />
              <span className="text-muted-foreground">Mise-bas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Saillie</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Vaccination</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

