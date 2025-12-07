"use client"

import { useState } from "react"
import { Button } from "@chakra-ui/react"
import { ChevronLeft, ChevronRight } from "react-icons/chevron"

export function BreedingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  return (
    <div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {/* Rest of the code here */}
    </div>
  )
}
