import { ReproductionStats } from "@/components/reproduction/reproduction-stats"
import { GestationTracker } from "@/components/reproduction/gestation-tracker"
import { BreedingCalendar } from "@/components/reproduction/breeding-calendar"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"

export default function ReproductionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reproduction & Gestation</h1>
          <p className="text-muted-foreground">Suivi complet du cycle reproductif</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Calendrier
          </Button>
          <Button className="gap-2 bg-primary text-white hover:bg-primary-dark">
            <Plus className="h-4 w-4" />
            Nouvelle saillie
          </Button>
        </div>
      </div>

      <ReproductionStats />
      <GestationTracker />
      <BreedingCalendar />
    </div>
  )
}
