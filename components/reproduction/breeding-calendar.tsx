"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

const events = [
  { day: 8, type: "misesBas", label: "Mise-bas #32", color: "bg-pink-500" },
  { day: 12, type: "vaccination", label: "Vaccin Lot A12", color: "bg-blue-500" },
  { day: 15, type: "saillie", label: "Saillie prévue #44", color: "bg-purple-500" },
  { day: 18, type: "misesBas", label: "Mise-bas #18", color: "bg-pink-500" },
  { day: 22, type: "saillie", label: "Saillie prévue #52", color: "bg-purple-500" },
]

export function BreedingCalendar() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i)

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Calendrier reproductif</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
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
            const isToday = day === new Date().getDate()

            return (
              <div
                key={day}
                className={`relative flex h-12 flex-col items-center justify-center rounded-lg text-sm transition hover:bg-muted ${
                  isToday ? "bg-primary text-white" : ""
                }`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="absolute -bottom-1 flex gap-0.5">
                    {dayEvents.map((e, i) => (
                      <div key={i} className={`h-1.5 w-1.5 rounded-full ${e.color}`} />
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
  )
}
