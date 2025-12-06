"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ReproductionStats } from "@/components/reproduction/reproduction-stats"
import { GestationTracker } from "@/components/reproduction/gestation-tracker"
import { BreedingCalendar } from "@/components/reproduction/breeding-calendar"
import { NewBreedingDialog } from "@/components/reproduction/new-breeding-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"

export default function ReproductionPage() {
  const router = useRouter()
  const [newBreedingOpen, setNewBreedingOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reproduction & Gestation</h1>
          <p className="text-muted-foreground">Suivi complet du cycle reproductif</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={() => router.push("/dashboard/reproduction/calendar")}
          >
            <Calendar className="h-4 w-4" />
            Calendrier
          </Button>
          <Button 
            className="gap-2 bg-primary text-white hover:bg-primary-dark"
            onClick={() => setNewBreedingOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nouvelle saillie
          </Button>
        </div>
      </div>

      <ReproductionStats />
      <GestationTracker />
      <BreedingCalendar />

      <NewBreedingDialog open={newBreedingOpen} onOpenChange={setNewBreedingOpen} />
    </div>
  )
}
